import { db } from "@/db";
import {
  comments,
  people,
  propositions,
  stances,
  submissions,
  user,
  userStances,
  type Person,
  type Proposition,
  type Stance,
  type Category,
} from "@/db/schema";
import { and, desc, asc, eq, gte, ilike, isNotNull, ne, or, sql } from "drizzle-orm";
import {
  buildScorecard,
  stanceOutcome,
  type Scorecard,
  type StanceOutcome,
} from "./scoring";
import {
  currentSeason,
  earnedBadges,
  seasonOf,
  type BadgeKey,
} from "./gamification";

export type StanceWithPerson = Stance & { person: Person };
export type PropositionWithStances = Proposition & {
  stances: StanceWithPerson[];
};
export type LedgerEntry = {
  proposition: Proposition;
  stance: Stance;
  outcome: StanceOutcome;
};

// ---------------------------------------------------------------------------

export async function getSiteStats() {
  const [row] = await db
    .select({
      tracked: sql<number>`count(*)::int`,
      resolved: sql<number>`count(*) filter (where ${propositions.status} not in ('pending'))::int`,
      peopleCount: sql<number>`(select count(*) from ${people})::int`,
      followers: sql<number>`(coalesce(sum(${propositions.followerCount}),0) + (select coalesce(sum(${people.followerCount}),0) from ${people}))::int`,
    })
    .from(propositions);
  return row;
}

export async function getRecentlyResolved(limit = 6) {
  return db.query.propositions.findMany({
    where: and(
      ne(propositions.status, "pending"),
      isNotNull(propositions.resolvedAt),
    ),
    orderBy: desc(propositions.resolvedAt),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

export async function getTrending(limit = 6) {
  return db.query.propositions.findMany({
    orderBy: desc(propositions.weeklyFollowDelta),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

export async function getMostFollowedPending(limit = 6) {
  return db.query.propositions.findMany({
    where: eq(propositions.status, "pending"),
    orderBy: desc(propositions.followerCount),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

/** Discussion volume per proposition — the Trending sort's metric. */
export async function getCommentCounts(): Promise<Record<number, number>> {
  const rows = await db
    .select({
      propositionId: comments.propositionId,
      n: sql<number>`count(*)::int`,
    })
    .from(comments)
    .groupBy(comments.propositionId);
  return Object.fromEntries(rows.map((r) => [r.propositionId, r.n]));
}

/** One pooled claim list for the homepage wire — filtered client-side. */
export async function getClaimWire(limit = 18) {
  return db.query.propositions.findMany({
    orderBy: desc(propositions.followerCount),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

export async function getResolvingSoon(limit = 20) {
  return db.query.propositions.findMany({
    where: and(
      or(eq(propositions.status, "pending"), eq(propositions.status, "disputed")),
      isNotNull(propositions.deadline),
      gte(propositions.deadline, sql`current_date - 30`),
    ),
    orderBy: asc(propositions.deadline),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

export async function getAllPeople() {
  return db.query.people.findMany({ orderBy: desc(people.followerCount) });
}

// ---------------------------------------------------------------------------
// Person scorecards
// ---------------------------------------------------------------------------

export type PersonScore = {
  person: Person;
  scorecard: Scorecard;
  ledger: LedgerEntry[];
  categoryBreakdown: Array<{
    category: Category;
    scorecard: Scorecard;
  }>;
  /** cumulative accuracy by resolution year, for the sparkline */
  accuracySeries: Array<{ year: number; accuracy: number }>;
  notableHit: LedgerEntry | null;
  notableMiss: LedgerEntry | null;
};

export async function getPersonScore(slug: string): Promise<PersonScore | null> {
  const person = await db.query.people.findFirst({
    where: eq(people.slug, slug),
  });
  if (!person) return null;
  return buildPersonScore(person);
}

async function buildPersonScore(person: Person): Promise<PersonScore> {
  const rows = (await db.query.stances.findMany({
    where: eq(stances.personId, person.id),
    with: { proposition: true },
  })) as Array<Stance & { proposition: Proposition }>;

  const ledger: LedgerEntry[] = rows
    .map((s) => ({
      proposition: s.proposition,
      stance: s,
      outcome: stanceOutcome(s.proposition.status, s.position),
    }))
    .sort(
      (a, b) =>
        b.proposition.followerCount - a.proposition.followerCount,
    );

  const scorecard = buildScorecard(ledger.map((l) => l.outcome));

  const byCategory = new Map<Category, StanceOutcome[]>();
  for (const l of ledger) {
    const k = l.proposition.category;
    if (!byCategory.has(k)) byCategory.set(k, []);
    byCategory.get(k)!.push(l.outcome);
  }
  const categoryBreakdown = Array.from(byCategory.entries())
    .map(([category, outcomes]) => ({
      category,
      scorecard: buildScorecard(outcomes),
    }))
    .sort((a, b) => b.scorecard.total - a.scorecard.total);

  // cumulative accuracy by resolution year
  const resolvedSorted = ledger
    .filter(
      (l) =>
        l.proposition.resolvedAt &&
        ["correct", "partly", "incorrect", "walked_back"].includes(l.outcome),
    )
    .sort(
      (a, b) =>
        a.proposition.resolvedAt!.getTime() -
        b.proposition.resolvedAt!.getTime(),
    );
  const accuracySeries: Array<{ year: number; accuracy: number }> = [];
  let num = 0;
  let den = 0;
  let lastYear: number | null = null;
  for (const l of resolvedSorted) {
    den += 1;
    if (l.outcome === "correct") num += 1;
    if (l.outcome === "partly") num += 0.5;
    const year = l.proposition.resolvedAt!.getFullYear();
    if (lastYear !== null && year !== lastYear) {
      accuracySeries.push({ year: lastYear, accuracy: num / den });
    }
    lastYear = year;
  }
  if (lastYear !== null) accuracySeries.push({ year: lastYear, accuracy: num / den });

  const hits = ledger.filter((l) => l.outcome === "correct");
  const misses = ledger.filter((l) => l.outcome === "incorrect");

  return {
    person,
    scorecard,
    ledger,
    categoryBreakdown,
    accuracySeries,
    notableHit: hits[0] ?? null,
    notableMiss: misses[0] ?? null,
  };
}

export async function getAllPersonScores(): Promise<PersonScore[]> {
  const all = await getAllPeople();
  return Promise.all(all.map(buildPersonScore));
}

// ---------------------------------------------------------------------------
// Claim detail
// ---------------------------------------------------------------------------

export async function getClaim(slug: string) {
  const prop = await db.query.propositions.findFirst({
    where: eq(propositions.slug, slug),
    with: {
      stances: { with: { person: true } },
      evidence: true,
      auditTrail: { orderBy: (t, { asc }) => asc(t.createdAt) },
      comments: {
        with: { user: true, votes: true },
        orderBy: (t, { asc }) => asc(t.createdAt),
      },
      userStances: { with: { user: true } },
      proposals: { with: { votes: { with: { user: true } } } },
    },
  });
  return prop ?? null;
}

export type ClaimDetail = NonNullable<Awaited<ReturnType<typeof getClaim>>>;

export async function getRelatedClaims(prop: Proposition, limit = 4) {
  return db.query.propositions.findMany({
    where: and(
      eq(propositions.category, prop.category),
      ne(propositions.id, prop.id),
    ),
    orderBy: desc(propositions.followerCount),
    limit,
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

// ---------------------------------------------------------------------------
// Search & browse
// ---------------------------------------------------------------------------

export async function searchAll(q: string) {
  const term = `%${q}%`;
  const [matchedPeople, matchedProps] = await Promise.all([
    db.query.people.findMany({
      where: or(ilike(people.name, term), ilike(people.title, term)),
      limit: 8,
    }),
    db.query.propositions.findMany({
      where: or(
        ilike(propositions.statement, term),
        ilike(propositions.question, term),
      ),
      orderBy: desc(propositions.followerCount),
      limit: 20,
      with: { stances: { with: { person: true } } },
    }) as Promise<PropositionWithStances[]>,
  ]);
  return { people: matchedPeople, propositions: matchedProps };
}

export async function getByCategory(category: Category) {
  return db.query.propositions.findMany({
    where: eq(propositions.category, category),
    orderBy: desc(propositions.followerCount),
    with: { stances: { with: { person: true } } },
  }) as Promise<PropositionWithStances[]>;
}

export async function getCategoryCounts() {
  return db
    .select({
      category: propositions.category,
      count: sql<number>`count(*)::int`,
    })
    .from(propositions)
    .groupBy(propositions.category)
    .orderBy(desc(sql`count(*)`));
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export type TopicSummary = {
  category: Category;
  scorecard: Scorecard;
};

/** Claim-level scorecard for a set of propositions (proposition = affirm stance). */
function propositionsScorecard(props: Proposition[]): Scorecard {
  return buildScorecard(props.map((p) => stanceOutcome(p.status, "affirm")));
}

export async function getTopicsIndex(): Promise<TopicSummary[]> {
  const all = await db.query.propositions.findMany();
  const byCat = new Map<Category, Proposition[]>();
  for (const p of all) {
    if (!byCat.has(p.category)) byCat.set(p.category, []);
    byCat.get(p.category)!.push(p);
  }
  return Array.from(byCat.entries())
    .map(([category, props]) => ({
      category,
      scorecard: propositionsScorecard(props),
    }))
    .sort((a, b) => b.scorecard.total - a.scorecard.total);
}

export type TopicData = {
  category: Category;
  claims: PropositionWithStances[];
  scorecard: Scorecard;
  topForecasters: Array<{
    person: Person;
    scorecard: Scorecard;
  }>;
  mostFollowed: PropositionWithStances | null;
};

export async function getTopicData(category: Category): Promise<TopicData> {
  const claims = await getByCategory(category);
  const scorecard = propositionsScorecard(claims);

  const byPerson = new Map<number, { person: Person; outcomes: StanceOutcome[] }>();
  for (const c of claims) {
    for (const s of c.stances) {
      if (!byPerson.has(s.personId)) {
        byPerson.set(s.personId, { person: s.person, outcomes: [] });
      }
      byPerson.get(s.personId)!.outcomes.push(stanceOutcome(c.status, s.position));
    }
  }
  const topForecasters = Array.from(byPerson.values())
    .map(({ person, outcomes }) => ({ person, scorecard: buildScorecard(outcomes) }))
    .sort(
      (a, b) =>
        (b.scorecard.accuracy ?? -1) - (a.scorecard.accuracy ?? -1) ||
        b.scorecard.total - a.scorecard.total,
    );

  const mostFollowed =
    [...claims].sort((a, b) => b.followerCount - a.followerCount)[0] ?? null;

  return { category, claims, scorecard, topForecasters, mostFollowed };
}

// ---------------------------------------------------------------------------
// Community users
// ---------------------------------------------------------------------------

export type UserScore = {
  id: string;
  name: string;
  reputation: number;
  /** game currency — contrarian-weighted points, separate from reputation */
  points: number;
  seasonPoints: number;
  joined: Date;
  scorecard: Scorecard;
  badges: BadgeKey[];
  titles: Array<{ title: string; season: string }>;
  approvedSubmissions: number;
  entries: Array<{
    proposition: Proposition;
    position: "affirm" | "deny";
    outcome: StanceOutcome;
    sideSharePct: number | null;
    pointsEarned: number | null;
    stakedAt: Date;
    /** time of the current position (moves on switches) */
    positionAt: Date;
    switchCount: number;
  }>;
};

async function buildUserScore(u: {
  id: string;
  name: string;
  reputation: number;
  points: number;
  createdAt: Date;
}): Promise<UserScore> {
  const [rows, approved, clipCredits, titles] = await Promise.all([
    db.query.userStances.findMany({
      where: eq(userStances.userId, u.id),
      with: { proposition: true },
    }),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(submissions)
      .where(
        and(eq(submissions.userId, u.id), eq(submissions.status, "approved")),
      ),
    // attaching the missing clip to someone else's broadcast citation
    // counts toward Verified Sourcer
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(submissions)
      .where(
        and(
          sql`${submissions.payload}->>'clipAttachedBy' = ${u.id}`,
          ne(submissions.status, "rejected"),
        ),
      ),
    db.query.seasonTitles.findMany({
      where: (t, { eq }) => eq(t.userId, u.id),
      columns: { title: true, season: true },
    }),
  ]);
  const entries = rows
    .map((s) => ({
      proposition: s.proposition,
      position: s.position,
      outcome: stanceOutcome(s.proposition.status, s.position),
      sideSharePct: s.stakeSideSharePct,
      pointsEarned: s.points,
      stakedAt: s.createdAt,
      positionAt: s.updatedAt,
      switchCount: s.switchCount,
    }))
    .sort((a, b) => b.proposition.followerCount - a.proposition.followerCount);

  const season = currentSeason();
  const seasonPoints = entries
    .filter(
      (e) =>
        e.pointsEarned !== null &&
        e.proposition.resolvedAt &&
        seasonOf(e.proposition.resolvedAt) === season,
    )
    .reduce((s, e) => s + (e.pointsEarned ?? 0), 0);

  return {
    id: u.id,
    name: u.name,
    reputation: u.reputation,
    points: u.points,
    seasonPoints,
    joined: u.createdAt,
    scorecard: buildScorecard(entries.map((e) => e.outcome)),
    badges: earnedBadges({
      stakes: entries.map((e) => ({
        outcome: e.outcome,
        sideSharePct: e.sideSharePct,
        propositionFollowers: e.proposition.followerCount,
      })),
      approvedSubmissions: (approved[0]?.n ?? 0) + (clipCredits[0]?.n ?? 0),
    }),
    titles,
    approvedSubmissions: (approved[0]?.n ?? 0) + (clipCredits[0]?.n ?? 0),
    entries,
  };
}

/** Resolution payday: the user's stakes that settled in the last 7 days. */
export function paydayOf(score: UserScore) {
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const settled = score.entries.filter(
    (e) =>
      e.pointsEarned !== null &&
      e.proposition.resolvedAt &&
      e.proposition.resolvedAt.getTime() >= weekAgo,
  );
  return {
    settled,
    wins: settled.filter((e) => e.outcome === "correct").length,
    partly: settled.filter((e) => e.outcome === "partly").length,
    losses: settled.filter((e) => e.outcome === "incorrect").length,
    pointsEarned: settled.reduce((s, e) => s + (e.pointsEarned ?? 0), 0),
  };
}

/**
 * Domain-scoped credentials — usernames never carry one global karma
 * number; they carry a track record in the relevant domain.
 */
export type DomainRecord = {
  resolved: number;
  accuracy: number | null;
  topPct: number | null;
};

export async function getDomainRecords(
  category: Category,
): Promise<Record<string, DomainRecord>> {
  const rows = await db.query.userStances.findMany({
    with: { proposition: { columns: { category: true, status: true } } },
  });
  const byUser = new Map<string, StanceOutcome[]>();
  for (const r of rows) {
    if (r.proposition.category !== category) continue;
    if (!byUser.has(r.userId)) byUser.set(r.userId, []);
    byUser.get(r.userId)!.push(stanceOutcome(r.proposition.status, r.position));
  }
  const records = new Map<string, DomainRecord>();
  for (const [userId, outcomes] of byUser) {
    const sc = buildScorecard(outcomes);
    records.set(userId, {
      resolved: sc.resolved,
      accuracy: sc.resolved > 0 ? sc.accuracy : null,
      topPct: null,
    });
  }
  // percentile among users with a resolved record in this domain
  const field = [...records.values()].filter((r) => r.accuracy !== null);
  for (const rec of records.values()) {
    if (rec.accuracy === null) continue;
    const above = field.filter((f) => (f.accuracy ?? 0) > (rec.accuracy ?? 0)).length;
    rec.topPct = Math.max(1, Math.ceil(((above + 1) / field.length) * 100));
  }
  return Object.fromEntries(records);
}

/** Propositions that were staked out of discussion comments. */
export async function getStakedFromComments(commentIds: number[]) {
  if (commentIds.length === 0) return [];
  return db.query.propositions.findMany({
    where: (t, { inArray }) => inArray(t.sourceCommentId, commentIds),
    columns: {
      sourceCommentId: true,
      slug: true,
      statement: true,
      status: true,
    },
  });
}

/** Head-to-head vs a public figure on shared, resolved claims. */
export async function getHeadToHead(userId: string, personId: number) {
  const [mine, theirs] = await Promise.all([
    db.query.userStances.findMany({
      where: eq(userStances.userId, userId),
      with: { proposition: true },
    }),
    db.query.stances.findMany({ where: eq(stances.personId, personId) }),
  ]);
  const theirByProp = new Map(theirs.map((s) => [s.propositionId, s]));
  const shared = mine.filter(
    (m) =>
      theirByProp.has(m.propositionId) &&
      !["pending", "disputed"].includes(m.proposition.status),
  );
  let me = 0;
  let them = 0;
  for (const m of shared) {
    const t = theirByProp.get(m.propositionId)!;
    if (stanceOutcome(m.proposition.status, m.position) === "correct") me++;
    if (stanceOutcome(m.proposition.status, t.position) === "correct") them++;
  }
  const open = mine.filter(
    (m) =>
      theirByProp.has(m.propositionId) &&
      ["pending", "disputed"].includes(m.proposition.status),
  ).length;
  return { shared: shared.length, me, them, open };
}

export async function getSmartestUsers(): Promise<UserScore[]> {
  const users = await db.query.user.findMany({
    orderBy: (t, { desc }) => desc(t.reputation),
  });
  const scored = await Promise.all(users.map(buildUserScore));
  // the game board: season points first, then all-time, then accuracy
  return scored
    .filter((u) => u.scorecard.total > 0 || u.reputation > 0)
    .sort(
      (a, b) =>
        b.seasonPoints - a.seasonPoints ||
        b.points - a.points ||
        (b.scorecard.accuracy ?? -1) - (a.scorecard.accuracy ?? -1),
    );
}

export async function getUserScore(id: string): Promise<UserScore | null> {
  const u = await db.query.user.findFirst({ where: eq(user.id, id) });
  if (!u) return null;
  return buildUserScore(u);
}

// ---------------------------------------------------------------------------
// Session follow state (so Follow buttons reflect reality)
// ---------------------------------------------------------------------------

export async function getFollowedPropositionIds(
  userId: string | undefined,
): Promise<Set<number>> {
  if (!userId) return new Set();
  const rows = await db.query.propositionFollows.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
    columns: { propositionId: true },
  });
  return new Set(rows.map((r) => r.propositionId));
}

/** The signed-in user's one-tap stances, keyed by proposition id. */
export async function getUserStanceMap(
  userId: string | undefined,
): Promise<Record<number, "affirm" | "deny">> {
  if (!userId) return {};
  const rows = await db.query.userStances.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
    columns: { propositionId: true, position: true },
  });
  return Object.fromEntries(rows.map((r) => [r.propositionId, r.position]));
}

export async function getFollowedPersonIds(
  userId: string | undefined,
): Promise<Set<number>> {
  if (!userId) return new Set();
  const rows = await db.query.personFollows.findMany({
    where: (t, { eq }) => eq(t.userId, userId),
    columns: { personId: true },
  });
  return new Set(rows.map((r) => r.personId));
}

/** earliest stance = the originating quote shown on cards */
export function primaryStance(p: PropositionWithStances): StanceWithPerson | null {
  if (!p.stances.length) return null;
  return [...p.stances].sort(
    (a, b) => a.dateStated.localeCompare(b.dateStated),
  )[0];
}
