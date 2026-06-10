import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  date,
  serial,
  jsonb,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "came_true",
  "partly_true",
  "didnt_come_true",
  "walked_back",
  "unverifiable",
  "disputed",
]);

export const claimTypeEnum = pgEnum("claim_type", [
  "prediction",
  "promise",
  "factual",
]);

export const categoryEnum = pgEnum("category", [
  "ai",
  "markets",
  "stocks",
  "semiconductors",
  "gold",
  "economy",
  "health",
  "immigration",
  "foreign_policy",
  "nba",
  "mlb",
  "nfl",
  "f1",
  "other",
]);

export const stancePositionEnum = pgEnum("stance_position", ["affirm", "deny"]);

export const evidenceSideEnum = pgEnum("evidence_side", [
  "supports",
  "refutes",
]);

export const personDomainEnum = pgEnum("person_domain", [
  "politician",
  "economist",
  "tech_ceo",
  "pundit",
  "analyst",
  "agent",
  "other",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "video",
  "tweet",
  "article",
  "speech",
  "interview",
  "filing",
  "broadcast",
  "other",
]);

export const proposalStateEnum = pgEnum("proposal_state", [
  "open",
  "locked",
  "accepted",
  "rejected",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "needs_clip",
  "approved",
  "rejected",
]);

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  reputation: integer("reputation").notNull().default(0),
  /** game currency — contrarian-weighted prediction points (never governance) */
  points: integer("points").notNull().default(0),
  isAgent: boolean("is_agent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

export const people = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    bio: text("bio").notNull().default(""),
    imageUrl: text("image_url"),
    domain: personDomainEnum("domain").notNull().default("other"),
    isAgent: boolean("is_agent").notNull().default(false),
    agentOwner: text("agent_owner"),
    followerCount: integer("follower_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("people_name_idx").on(t.name)],
);

export const propositions = pgTable(
  "propositions",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    statement: text("statement").notNull(),
    // SEO question phrasing, e.g. "Did Trump build the wall?"
    question: text("question").notNull().default(""),
    resolutionCriteria: text("resolution_criteria").notNull(),
    claimType: claimTypeEnum("claim_type").notNull(),
    category: categoryEnum("category").notNull(),
    // null deadline = "resolves when event occurs"
    deadline: date("deadline"),
    status: claimStatusEnum("status").notNull().default("pending"),
    resolutionRationale: text("resolution_rationale"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    followerCount: integer("follower_count").notNull().default(0),
    weeklyFollowDelta: integer("weekly_follow_delta").notNull().default(0),
    aiDrafted: boolean("ai_drafted").notNull().default(false),
    humanVerified: boolean("human_verified").notNull().default(true),
    resolutionLocked: boolean("resolution_locked").notNull().default(false),
    /** forum seam: set when this proposition was staked out of a discussion
        comment — discussion is the discovery engine for new claims */
    sourceCommentId: integer("source_comment_id").references(
      (): AnyPgColumn => comments.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("propositions_status_idx").on(t.status),
    index("propositions_category_idx").on(t.category),
    index("propositions_deadline_idx").on(t.deadline),
  ],
);

export const stances = pgTable(
  "stances",
  {
    id: serial("id").primaryKey(),
    propositionId: integer("proposition_id")
      .notNull()
      .references(() => propositions.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    position: stancePositionEnum("position").notNull(),
    quote: text("quote").notNull(),
    dateStated: date("date_stated").notNull(),
    venue: text("venue").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceArchiveUrl: text("source_archive_url"),
    sourceType: sourceTypeEnum("source_type").notNull().default("article"),
    videoTimestamp: text("video_timestamp"),
    /** lower evidence tier: quote reported by the press, no recording exists.
        Requires 2+ independent contemporaneous reports and a visible label. */
    quoteReported: boolean("quote_reported").notNull().default(false),
    corroborationUrl: text("corroboration_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("stances_prop_person_uq").on(t.propositionId, t.personId),
    index("stances_person_idx").on(t.personId),
  ],
);

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  propositionId: integer("proposition_id")
    .notNull()
    .references(() => propositions.id, { onDelete: "cascade" }),
  side: evidenceSideEnum("side").notNull(),
  title: text("title").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull().default(""),
  submittedBy: text("submitted_by").references(() => user.id, {
    onDelete: "set null",
  }),
  aiDrafted: boolean("ai_drafted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditTrail = pgTable("audit_trail", {
  id: serial("id").primaryKey(),
  propositionId: integer("proposition_id")
    .notNull()
    .references(() => propositions.id, { onDelete: "cascade" }),
  fromStatus: claimStatusEnum("from_status"),
  toStatus: claimStatusEnum("to_status").notNull(),
  actor: text("actor").notNull(),
  rationale: text("rationale").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const propositionFollows = pgTable(
  "proposition_follows",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    propositionId: integer("proposition_id")
      .notNull()
      .references(() => propositions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("prop_follows_uq").on(t.userId, t.propositionId)],
);

export const personFollows = pgTable(
  "person_follows",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("person_follows_uq").on(t.userId, t.personId)],
);

export const userStances = pgTable(
  "user_stances",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    propositionId: integer("proposition_id")
      .notNull()
      .references(() => propositions.id, { onDelete: "cascade" }),
    position: stancePositionEnum("position").notNull(),
    /** % of one-tap stakers who agreed with this side at stake time (0–100) */
    stakeSideSharePct: integer("stake_side_share_pct"),
    /** side changes are allowed pre-vote, but they're on the record */
    switchCount: integer("switch_count").notNull().default(0),
    /** contrarian-weighted payout, set at resolution (null = unscored) */
    points: integer("points"),
    /** first commitment — never moves */
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** time of the CURRENT position — switches move this. The pair answers
        "did this call predate the news?" for juries and scoring. */
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_stances_uq").on(t.userId, t.propositionId)],
);

/** Permanent end-of-season titles ("Top Forecaster, Economy — Q1 2026"). */
export const seasonTitles = pgTable("season_titles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  season: text("season").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  propositionId: integer("proposition_id")
    .notNull()
    .references(() => propositions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  score: integer("score").notNull().default(0),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const commentVotes = pgTable(
  "comment_votes",
  {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // +1 | -1
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("comment_votes_uq").on(t.commentId, t.userId)],
);

export const resolutionProposals = pgTable("resolution_proposals", {
  id: serial("id").primaryKey(),
  propositionId: integer("proposition_id")
    .notNull()
    .references(() => propositions.id, { onDelete: "cascade" }),
  proposedStatus: claimStatusEnum("proposed_status").notNull(),
  rationale: text("rationale").notNull(),
  proposedBy: text("proposed_by").references(() => user.id, {
    onDelete: "set null",
  }),
  state: proposalStateEnum("state").notNull().default("open"),
  voteThreshold: integer("vote_threshold").notNull().default(20),
  aiBrief: text("ai_brief"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** when the proposal was accepted/rejected/locked */
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const resolutionVotes = pgTable(
  "resolution_votes",
  {
    id: serial("id").primaryKey(),
    proposalId: integer("proposal_id")
      .notNull()
      .references(() => resolutionProposals.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    agree: boolean("agree").notNull(),
    weight: integer("weight").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("resolution_votes_uq").on(t.proposalId, t.userId)],
);

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  payload: jsonb("payload").notNull(),
  status: submissionStatusEnum("status").notNull().default("pending"),
  aiDrafted: boolean("ai_drafted").notNull().default(false),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const peopleRelations = relations(people, ({ many }) => ({
  stances: many(stances),
}));

export const propositionsRelations = relations(propositions, ({ many }) => ({
  stances: many(stances),
  evidence: many(evidence),
  auditTrail: many(auditTrail),
  userStances: many(userStances),
  comments: many(comments),
  proposals: many(resolutionProposals),
}));

export const stancesRelations = relations(stances, ({ one }) => ({
  proposition: one(propositions, {
    fields: [stances.propositionId],
    references: [propositions.id],
  }),
  person: one(people, {
    fields: [stances.personId],
    references: [people.id],
  }),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  proposition: one(propositions, {
    fields: [evidence.propositionId],
    references: [propositions.id],
  }),
}));

export const auditTrailRelations = relations(auditTrail, ({ one }) => ({
  proposition: one(propositions, {
    fields: [auditTrail.propositionId],
    references: [propositions.id],
  }),
}));

export const userStancesRelations = relations(userStances, ({ one }) => ({
  proposition: one(propositions, {
    fields: [userStances.propositionId],
    references: [propositions.id],
  }),
  user: one(user, {
    fields: [userStances.userId],
    references: [user.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  proposition: one(propositions, {
    fields: [comments.propositionId],
    references: [propositions.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  votes: many(commentVotes),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id],
  }),
}));

export const resolutionProposalsRelations = relations(
  resolutionProposals,
  ({ one, many }) => ({
    proposition: one(propositions, {
      fields: [resolutionProposals.propositionId],
      references: [propositions.id],
    }),
    votes: many(resolutionVotes),
  }),
);

export const resolutionVotesRelations = relations(
  resolutionVotes,
  ({ one }) => ({
    proposal: one(resolutionProposals, {
      fields: [resolutionVotes.proposalId],
      references: [resolutionProposals.id],
    }),
    user: one(user, {
      fields: [resolutionVotes.userId],
      references: [user.id],
    }),
  }),
);

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type Person = typeof people.$inferSelect;
export type Proposition = typeof propositions.$inferSelect;
export type Stance = typeof stances.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type AuditEntry = typeof auditTrail.$inferSelect;
export type ClaimStatus = (typeof claimStatusEnum.enumValues)[number];
export type ClaimType = (typeof claimTypeEnum.enumValues)[number];
export type Category = (typeof categoryEnum.enumValues)[number];
