"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditTrail,
  comments,
  commentVotes,
  evidence,
  people,
  personFollows,
  propositionFollows,
  propositions,
  resolutionProposals,
  resolutionVotes,
  stances,
  submissions,
  user as userTable,
  userStances,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { stakePoints } from "@/lib/gamification";
import { stanceOutcome } from "@/lib/scoring";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return session.user;
}

export async function toggleFollowProposition(propositionId: number, path: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  const existing = await db.query.propositionFollows.findFirst({
    where: and(
      eq(propositionFollows.userId, user.id),
      eq(propositionFollows.propositionId, propositionId),
    ),
  });
  if (existing) {
    await db.delete(propositionFollows).where(eq(propositionFollows.id, existing.id));
    await db
      .update(propositions)
      .set({
        followerCount: sql`greatest(${propositions.followerCount} - 1, 0)`,
        weeklyFollowDelta: sql`greatest(${propositions.weeklyFollowDelta} - 1, 0)`,
      })
      .where(eq(propositions.id, propositionId));
  } else {
    await db.insert(propositionFollows).values({ userId: user.id, propositionId });
    await db
      .update(propositions)
      .set({
        followerCount: sql`${propositions.followerCount} + 1`,
        weeklyFollowDelta: sql`${propositions.weeklyFollowDelta} + 1`,
      })
      .where(eq(propositions.id, propositionId));
  }
  revalidatePath(path);
  return { ok: true, following: !existing };
}

export async function toggleFollowPerson(personId: number, path: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  const existing = await db.query.personFollows.findFirst({
    where: and(
      eq(personFollows.userId, user.id),
      eq(personFollows.personId, personId),
    ),
  });
  if (existing) {
    await db.delete(personFollows).where(eq(personFollows.id, existing.id));
    await db
      .update(people)
      .set({ followerCount: sql`greatest(${people.followerCount} - 1, 0)` })
      .where(eq(people.id, personId));
  } else {
    await db.insert(personFollows).values({ userId: user.id, personId });
    await db
      .update(people)
      .set({ followerCount: sql`${people.followerCount} + 1` })
      .where(eq(people.id, personId));
  }
  revalidatePath(path);
  return { ok: true, following: !existing };
}

async function sideShareAt(
  propositionId: number,
  position: "affirm" | "deny",
  excludeUserId?: string,
): Promise<number> {
  const rows = await db.query.userStances.findMany({
    where: eq(userStances.propositionId, propositionId),
    columns: { position: true, userId: true },
  });
  const others = rows.filter((r) => r.userId !== excludeUserId);
  if (others.length === 0) return 50;
  const mine = others.filter((r) => r.position === position).length;
  return Math.round((mine / others.length) * 100);
}

export async function setUserStance(
  propositionId: number,
  position: "affirm" | "deny",
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  // refuse stakes on settled questions
  const prop = await db.query.propositions.findFirst({
    where: eq(propositions.id, propositionId),
    columns: { status: true, deadline: true },
  });
  if (!prop || !["pending", "disputed"].includes(prop.status)) {
    return { ok: false, error: "not-open" as const };
  }
  // calls close at the deadline: once the answer may already be out,
  // no new positions and no switches — the timestamp record stays honest
  if (prop.deadline && new Date(prop.deadline) < new Date()) {
    return { ok: false, error: "calls-closed" as const };
  }
  // calls freeze once a resolution vote opens — no flipping onto the
  // winning side when settlement is in sight
  const openProposal = await db.query.resolutionProposals.findFirst({
    where: and(
      eq(resolutionProposals.propositionId, propositionId),
      eq(resolutionProposals.state, "open"),
    ),
    columns: { id: true },
  });
  if (openProposal) {
    return { ok: false, error: "calls-locked" as const };
  }

  const existing = await db.query.userStances.findFirst({
    where: and(
      eq(userStances.userId, user.id),
      eq(userStances.propositionId, propositionId),
    ),
  });
  if (existing && existing.position === position) {
    await db.delete(userStances).where(eq(userStances.id, existing.id));
  } else {
    // the contrarian baseline re-locks at every (dis)commitment
    const share = await sideShareAt(propositionId, position, user.id);
    if (existing) {
      await db
        .update(userStances)
        .set({
          position,
          stakeSideSharePct: share,
          switchCount: sql`${userStances.switchCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userStances.id, existing.id));
    } else {
      await db.insert(userStances).values({
        userId: user.id,
        propositionId,
        position,
        stakeSideSharePct: share,
      });
    }
  }
  revalidatePath(path);
  return { ok: true };
}

/** Migrate anonymous (pre-signup) stakes once the user signs in. */
export async function importAnonStances(
  stakes: Array<{ propositionId: number; position: "affirm" | "deny" }>,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  let imported = 0;
  for (const s of stakes.slice(0, 50)) {
    const prop = await db.query.propositions.findFirst({
      where: eq(propositions.id, s.propositionId),
      columns: { status: true, deadline: true },
    });
    if (!prop || !["pending", "disputed"].includes(prop.status)) continue;
    if (prop.deadline && new Date(prop.deadline) < new Date()) continue;
    const frozen = await db.query.resolutionProposals.findFirst({
      where: and(
        eq(resolutionProposals.propositionId, s.propositionId),
        eq(resolutionProposals.state, "open"),
      ),
      columns: { id: true },
    });
    if (frozen) continue;
    const share = await sideShareAt(s.propositionId, s.position, user.id);
    await db
      .insert(userStances)
      .values({
        userId: user.id,
        propositionId: s.propositionId,
        position: s.position,
        stakeSideSharePct: share,
      })
      .onConflictDoNothing();
    imported++;
  }
  return { ok: true, imported };
}

export async function addComment(
  propositionId: number,
  body: string,
  path: string,
  parentId?: number | null,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  const text = body.trim();
  if (!text) return { ok: false, error: "empty" as const };
  await db.insert(comments).values({
    propositionId,
    userId: user.id,
    body: text,
    parentId: parentId ?? null,
    // your own comment starts with your implicit upvote, Reddit-style
    score: 1,
  });
  revalidatePath(path);
  return { ok: true };
}

export async function voteComment(
  commentId: number,
  value: 1 | -1,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  const existing = await db.query.commentVotes.findFirst({
    where: and(
      eq(commentVotes.commentId, commentId),
      eq(commentVotes.userId, user.id),
    ),
  });

  let delta = value;
  if (existing && existing.value === value) {
    // clicking the same arrow again removes the vote
    await db.delete(commentVotes).where(eq(commentVotes.id, existing.id));
    delta = -value as 1 | -1;
  } else if (existing) {
    await db
      .update(commentVotes)
      .set({ value, updatedAt: new Date() })
      .where(eq(commentVotes.id, existing.id));
    delta = (2 * value) as 1 | -1;
  } else {
    await db.insert(commentVotes).values({ commentId, userId: user.id, value });
  }
  await db
    .update(comments)
    .set({ score: sql`${comments.score} + ${delta}` })
    .where(eq(comments.id, commentId));
  revalidatePath(path);
  return { ok: true };
}

export async function voteOnResolution(
  proposalId: number,
  agree: boolean,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  const weight = Math.max(1, Math.floor(((user as { reputation?: number }).reputation ?? 0) / 100));
  await db
    .insert(resolutionVotes)
    .values({ proposalId, userId: user.id, agree, weight })
    .onConflictDoUpdate({
      target: [resolutionVotes.proposalId, resolutionVotes.userId],
      set: { agree, weight, updatedAt: new Date() },
    });
  revalidatePath(path);
  return { ok: true };
}

export type SubmissionPayload = {
  kind?: "claim";
  /** forum seam: the discussion comment this claim was staked from */
  sourceCommentId?: number;
  sourceUrl: string;
  speaker: string;
  quote: string;
  dateStated: string;
  venue: string;
  claimType: string;
  category: string;
  deadline: string | null;
  proposedStatement: string;
  resolutionCriteria: string;
  /** sourcing tier */
  sourceType?: string;
  // broadcast citations: structured fields; the artifact link gates publication
  network?: string;
  show?: string;
  approxTimestamp?: string;
  // lower tier: quote reported by the press (no recording) — 2+ reports required
  quoteReported?: boolean;
  corroborationUrl?: string;
};

export async function submitClaim(payload: SubmissionPayload) {
  const user = await requireUser();
  // a structured broadcast citation without a verifiable artifact goes to
  // the queue flagged "needs clip" — it cannot publish until one is attached
  const needsClip =
    payload.sourceType === "broadcast" && !payload.sourceUrl.trim();
  await db.insert(submissions).values({
    userId: user?.id ?? null,
    payload: { ...payload, kind: "claim" },
    status: needsClip ? "needs_clip" : "pending",
  });
  return { ok: true, needsClip };
}

/** Attach the missing artifact (clip/transcript) to a broadcast citation.
    Credits the attacher toward the Verified Sourcer badge. */
export async function attachClip(
  submissionId: number,
  artifactUrl: string,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  if (!artifactUrl.trim().startsWith("http")) {
    return { ok: false, error: "invalid-url" as const };
  }
  const sub = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });
  if (!sub || sub.status !== "needs_clip") {
    return { ok: false, error: "not-needs-clip" as const };
  }
  const payload = sub.payload as Record<string, unknown>;
  await db
    .update(submissions)
    .set({
      payload: {
        ...payload,
        sourceUrl: artifactUrl.trim(),
        clipAttachedBy: user.id,
        clipAttachedByName: user.name,
      },
      status: "pending",
      reviewNote: `Artifact attached by ${user.name}`,
    })
    .where(eq(submissions.id, submissionId));
  revalidatePath(path);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Contribution flows: positions, evidence, resolutions
// ---------------------------------------------------------------------------

export type StanceSubmissionPayload = {
  kind: "stance";
  propositionId: number;
  propositionSlug: string;
  propositionStatement: string;
  speaker: string;
  position: "affirm" | "deny";
  quote: string;
  dateStated: string;
  venue: string;
  sourceUrl: string;
};

/** A figure's position on an existing proposition — goes to the review queue. */
export async function submitStance(
  payload: Omit<StanceSubmissionPayload, "kind">,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  if (!payload.quote.trim() || !payload.sourceUrl.trim() || !payload.speaker.trim()) {
    return { ok: false, error: "missing-fields" as const };
  }
  await db.insert(submissions).values({
    userId: user.id,
    payload: { ...payload, kind: "stance" },
    status: "pending",
  });
  return { ok: true };
}

/** Evidence publishes immediately, attributed to the submitter. */
export async function addEvidence(
  propositionId: number,
  side: "supports" | "refutes",
  title: string,
  sourceUrl: string,
  sourceName: string,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  if (!title.trim() || !sourceUrl.trim()) {
    return { ok: false, error: "missing-fields" as const };
  }
  await db.insert(evidence).values({
    propositionId,
    side,
    title: title.trim(),
    sourceUrl: sourceUrl.trim(),
    sourceName: sourceName.trim() || new URL(sourceUrl).hostname.replace("www.", ""),
    submittedBy: user.id,
  });
  revalidatePath(path);
  return { ok: true };
}

/** Open a resolution vote on a pending/disputed proposition. */
export async function proposeResolution(
  propositionId: number,
  proposedStatus: "came_true" | "partly_true" | "didnt_come_true" | "walked_back" | "unverifiable",
  rationale: string,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };
  if (rationale.trim().length < 20) {
    return { ok: false, error: "rationale-too-short" as const };
  }
  const prop = await db.query.propositions.findFirst({
    where: eq(propositions.id, propositionId),
  });
  if (!prop || !["pending", "disputed"].includes(prop.status)) {
    return { ok: false, error: "not-open" as const };
  }
  const existing = await db.query.resolutionProposals.findFirst({
    where: and(
      eq(resolutionProposals.propositionId, propositionId),
      eq(resolutionProposals.state, "open"),
    ),
  });
  if (existing) return { ok: false, error: "already-proposed" as const };

  const [proposal] = await db
    .insert(resolutionProposals)
    .values({
      propositionId,
      proposedStatus,
      rationale: rationale.trim(),
      proposedBy: user.id,
      state: "open",
      voteThreshold: 25,
    })
    .returning();
  // proposer's own vote counts
  const weight = Math.max(1, Math.floor(((user as { reputation?: number }).reputation ?? 0) / 100));
  await db.insert(resolutionVotes).values({
    proposalId: proposal.id,
    userId: user.id,
    agree: true,
    weight,
  });
  await db.insert(auditTrail).values({
    propositionId,
    fromStatus: prop.status,
    toStatus: prop.status,
    actor: `resolution proposal #${proposal.id}`,
    rationale: `Resolution proposed (${proposedStatus.replace(/_/g, " ")}): ${rationale.trim().slice(0, 140)}`,
  });
  revalidatePath(path);
  return { ok: true };
}

/** Apply a verdict whose weighted vote passed its threshold. */
export async function certifyResolution(proposalId: number, path: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  const proposal = await db.query.resolutionProposals.findFirst({
    where: eq(resolutionProposals.id, proposalId),
    with: { votes: true },
  });
  if (!proposal || proposal.state !== "open") {
    return { ok: false, error: "not-open" as const };
  }
  const agreeWeight = proposal.votes
    .filter((v) => v.agree)
    .reduce((s, v) => s + v.weight, 0);
  if (agreeWeight < proposal.voteThreshold) {
    return { ok: false, error: "threshold-not-met" as const };
  }
  const prop = await db.query.propositions.findFirst({
    where: eq(propositions.id, proposal.propositionId),
  });
  if (!prop) return { ok: false, error: "not-found" as const };

  await db
    .update(resolutionProposals)
    .set({ state: "accepted", decidedAt: new Date() })
    .where(eq(resolutionProposals.id, proposalId));
  await db
    .update(propositions)
    .set({
      status: proposal.proposedStatus,
      resolutionRationale: proposal.rationale,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(propositions.id, proposal.propositionId));
  await db.insert(auditTrail).values({
    propositionId: proposal.propositionId,
    fromStatus: prop.status,
    toStatus: proposal.proposedStatus,
    actor: `community vote (${proposal.votes.length} voters, ${agreeWeight} weight)`,
    rationale: proposal.rationale,
  });

  // resolution payday: score every unscored stake on this proposition
  const stakes = await db.query.userStances.findMany({
    where: eq(userStances.propositionId, proposal.propositionId),
  });
  const deadlineCutoff = prop.deadline ? new Date(prop.deadline) : null;
  for (const stake of stakes) {
    if (stake.points !== null) continue;
    // data-level guard: positions taken (or switched to) after the deadline
    // never pay — the answer may already have been out
    const lateStake =
      deadlineCutoff !== null && stake.updatedAt > deadlineCutoff;
    const pts = lateStake
      ? 0
      : stakePoints(
          stanceOutcome(proposal.proposedStatus, stake.position),
          stake.stakeSideSharePct,
        );
    await db
      .update(userStances)
      .set({ points: pts })
      .where(eq(userStances.id, stake.id));
    if (pts > 0) {
      await db
        .update(userTable)
        .set({ points: sql`${userTable.points} + ${pts}` })
        .where(eq(userTable.id, stake.userId));
    }
  }

  revalidatePath(path);
  revalidatePath("/");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Review queue
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function findOrCreatePerson(name: string) {
  const trimmed = name.trim();
  const existing = await db.query.people.findFirst({
    where: (t, { ilike }) => ilike(t.name, trimmed),
  });
  if (existing) return existing;
  let slug = slugify(trimmed);
  if (await db.query.people.findFirst({ where: eq(people.slug, slug) })) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }
  const [created] = await db
    .insert(people)
    .values({
      slug,
      name: trimmed,
      title: "Public figure",
      bio: "",
      domain: "other",
    })
    .returning();
  return created;
}

export async function reviewSubmission(
  submissionId: number,
  approve: boolean,
  path: string,
) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "sign-in-required" as const };

  const sub = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });
  if (!sub || sub.status !== "pending") {
    return { ok: false, error: "not-pending" as const };
  }
  if (sub.userId === user.id) {
    return { ok: false, error: "own-submission" as const };
  }

  if (!approve) {
    await db
      .update(submissions)
      .set({
        status: "rejected",
        reviewNote: `Rejected by ${user.name}`,
        reviewedAt: new Date(),
      })
      .where(eq(submissions.id, submissionId));
    revalidatePath(path);
    return { ok: true };
  }

  const payload = sub.payload as Record<string, unknown>;
  const kind = (payload.kind as string) ?? "claim";

  // no artifact, no publication — regardless of how structured the citation is
  if (!String(payload.sourceUrl ?? "").trim() && !payload.quoteReported) {
    return { ok: false, error: "needs-artifact" as const };
  }
  // reported tier requires two independent reports
  if (
    payload.quoteReported &&
    (!String(payload.sourceUrl ?? "").trim() ||
      !String(payload.corroborationUrl ?? "").trim())
  ) {
    return { ok: false, error: "needs-corroboration" as const };
  }

  const VALID_SOURCE_TYPES = [
    "video", "tweet", "article", "speech", "interview", "filing", "broadcast", "other",
  ] as const;
  const sourceType = VALID_SOURCE_TYPES.includes(
    payload.sourceType as (typeof VALID_SOURCE_TYPES)[number],
  )
    ? (payload.sourceType as (typeof VALID_SOURCE_TYPES)[number])
    : "other";
  // broadcast structure folds into the stance record
  const venue =
    sourceType === "broadcast" && payload.show
      ? `${payload.show}${payload.network ? `, ${payload.network}` : ""}`
      : String(payload.venue || "On the record");
  const videoTimestamp =
    sourceType === "broadcast" && payload.approxTimestamp
      ? String(payload.approxTimestamp)
      : null;
  // every source link is auto-archived regardless of type (production calls
  // the Save Page Now API; the wayback wrapper resolves to the snapshot)
  const archiveOf = (url: string) =>
    url ? `https://web.archive.org/web/${url}` : null;

  if (kind === "stance") {
    const propositionId = Number(payload.propositionId);
    const person = await findOrCreatePerson(String(payload.speaker));
    await db
      .insert(stances)
      .values({
        propositionId,
        personId: person.id,
        position: payload.position === "deny" ? "deny" : "affirm",
        quote: String(payload.quote),
        dateStated: String(payload.dateStated || new Date().toISOString().slice(0, 10)),
        venue,
        sourceUrl: String(payload.sourceUrl),
        sourceArchiveUrl: archiveOf(String(payload.sourceUrl)),
        sourceType,
        videoTimestamp,
        quoteReported: !!payload.quoteReported,
        corroborationUrl: payload.corroborationUrl
          ? String(payload.corroborationUrl)
          : null,
      })
      .onConflictDoNothing();
  } else {
    const person = await findOrCreatePerson(String(payload.speaker));
    let slug = slugify(String(payload.proposedStatement));
    if (await db.query.propositions.findFirst({ where: eq(propositions.slug, slug) })) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }
    const claimType = ["prediction", "promise", "factual"].includes(String(payload.claimType))
      ? (String(payload.claimType) as "prediction" | "promise" | "factual")
      : "prediction";
    const [prop] = await db
      .insert(propositions)
      .values({
        slug,
        statement: String(payload.proposedStatement),
        question: "",
        resolutionCriteria: String(payload.resolutionCriteria),
        claimType,
        category: (payload.category as typeof propositions.$inferInsert.category) || "other",
        deadline: payload.deadline ? String(payload.deadline) : null,
        status: "pending",
        sourceCommentId: payload.sourceCommentId
          ? Number(payload.sourceCommentId)
          : null,
      })
      .returning();
    await db.insert(stances).values({
      propositionId: prop.id,
      personId: person.id,
      position: "affirm",
      quote: String(payload.quote),
      dateStated: String(payload.dateStated || new Date().toISOString().slice(0, 10)),
      venue,
      sourceUrl: String(payload.sourceUrl),
      sourceArchiveUrl: archiveOf(String(payload.sourceUrl)),
      sourceType,
      videoTimestamp,
      quoteReported: !!payload.quoteReported,
      corroborationUrl: payload.corroborationUrl
        ? String(payload.corroborationUrl)
        : null,
    });
    await db.insert(auditTrail).values({
      propositionId: prop.id,
      fromStatus: null,
      toStatus: "pending",
      actor: `community review (approved by ${user.name})`,
      rationale: "Published after review: quote, sourcing, and falsifiability verified.",
    });
  }

  await db
    .update(submissions)
    .set({
      status: "approved",
      reviewNote: `Approved by ${user.name}`,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId));
  // reputation reward for the accepted submission
  if (sub.userId) {
    await db
      .update(userTable)
      .set({ reputation: sql`${userTable.reputation} + ${kind === "stance" ? 10 : 25}` })
      .where(eq(userTable.id, sub.userId));
  }
  revalidatePath(path);
  return { ok: true };
}
