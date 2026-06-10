# Design Prompt: smarthumans.ai

Design a crowdsourced predictions-and-promises tracking website called **smarthumans.ai**. The site keeps a public scoreboard of what public figures said would happen — and whether it did. Think of it as a permanent, sourced, community-verified accountability record. The flagship example: a Donald Trump page listing every prediction and promise he's made, each with a primary source and a resolved verdict.

Tone target: **data journalism**. Credible, neutral, stats-forward — FiveThirtyEight meets Polymarket meets Wikipedia. The design must feel rigorously nonpartisan: identical templates for every person, no editorial styling that implies judgment. The data delivers the verdict; the design stays calm.

---

## 1. Core domain model (drives all UI)

**Claim types** (every entry is one of these):
- **Prediction** — a forecast about the future ("The market will crash if X passes")
- **Promise** — a commitment to act ("I will build the wall")
- **Factual claim** — a checkable statement about the present/past (secondary; can be a v2 tab)

**Claim statuses** (the central visual language of the site — design a distinct badge for each):
- **Pending** (deadline not yet reached) — blue/gray
- **Came True** — green
- **Partly True** — amber
- **Didn't Come True** — red
- **Walked Back** (abandoned/reversed by the speaker) — purple or slate
- **Unverifiable** (too vague to ever resolve) — neutral gray, slightly de-emphasized
- **Disputed** (resolution under appeal) — striped/outlined variant

**Propositions and stances (prevents duplicates):** a claim is split into two layers. The **proposition** is the canonical resolvable event ("Tesla achieves full self-driving by 2027") — it carries the resolution criteria, deadline, status, evidence, follower count, and audit trail, and exists exactly once. A **stance** is one person's position on that proposition — agree or disagree — with their own exact quote, date stated, venue, and primary-source link (video timestamp where applicable). If Elon predicts something and Trump later agrees, that's one proposition with two stances, not two entries. When a proposition resolves, every stance scores automatically: agreers credited, disagreers debited (and vice versa). Each person's profile ledger lists their stances. Materially different versions (different deadline or magnitude) become separate, cross-linked propositions.

**Every proposition contains:** statement, resolution criteria, claim type, category (economy, foreign policy, health, tech, elections, legal, etc.), resolution deadline, current status, resolution rationale, evidence list, follower count, stance list, and a full audit trail of status changes.

**Follows = importance.** Every claim has a **Follow button**. Following means "notify me when this resolves" — so follower count doubles as the site's importance signal. Trivial claims get no follows and sink; consequential ones surface everywhere. Follower count appears on every claim card and drives default sorting, trending, and homepage placement.

**Person scorecard:** never reduce a person to one number alone. Show an accuracy score (resolved-true ÷ total-resolved) AND the full distribution ("Record: 62 came true · 38 partly · 141 didn't · 12 walked back · 87 pending"). Include a minimum-sample-size note ("based on 253 resolved claims") so small samples aren't misleading.

---

## 2. Pages to design

### A. Homepage
- Search-first hero: large search bar ("Search any public figure…") under a tagline like *"They said it. We tracked it."* with live counters (claims tracked, claims resolved, people followed).
- **Recently resolved** feed — claim cards that just flipped status (this is the addictive core loop).
- **Trending claims** — gaining the most follows this week.
- **Most followed pending claims** — the big open questions everyone is waiting on, with deadline countdowns.
- Leaderboard teasers: "Best track records" / "Worst track records" with mini scorecards.
- Featured person profiles grid.

### B. Person profile page (the flagship — design this most thoroughly; use Donald Trump as the example with realistic sample data)
- **Hero:** photo, name, title/role, short neutral bio, follow button, share button.
- **Scorecard panel:** big accuracy gauge or grade, the full status-distribution bar (stacked horizontal bar in status colors), accuracy-over-time sparkline, per-category accuracy breakdown (small multiples or a compact table).
- **Claim ledger:** the main body. Filterable and sortable list of claim cards — filter by status, type, category, year; sort by follower count (default), date stated, or deadline. Include a **timeline view toggle** (claims plotted chronologically with status-colored dots).
- "Notable calls" strip: biggest correct prediction, biggest miss.
- **Compare** button → side-by-side scorecards of two people.

### C. Claim detail page
- The proposition as the headline, with the originating quote treated as the artifact: large serif blockquote with date, venue, and a prominent primary-source link/embed (video with timestamp, archived tweet, article).
- **Positions panel:** every public figure with a stance, grouped into "said it would happen" / "said it wouldn't," each with their quote and source. After resolution, this becomes the scoreboard — who was right, who was wrong.
- Prominent **Follow button** with follower count ("12,406 following — get notified when this resolves").
- Status banner with the resolution rationale in plain language.
- **Evidence panel:** two columns — evidence it came true / evidence it didn't — each item a sourced citation submitted by users.
- **Resolution module:** when a claim is resolvable, the community resolution vote appears here (proposed verdict, evidence, weighted vote progress, threshold indicator).
- Audit trail: every status change with who, when, why.
- **User stances:** any signed-in user can register their own position ("will happen" / "won't") with one tap, shown as an aggregate split ("68% of 4,200 users say it'll happen"). User stances are scored on resolution and feed each user's personal track record.
- **Discussion thread:** each comment shows the author's stance badge next to their name; thread is filterable by side. After resolution, comments from users who called it correctly get a "called it" check.
- Related claims, and a **shareable verdict card** generator (social-media-image style: quote + verdict + source + smarthumans.ai branding).

### D. Submit-a-claim flow
- Opens with **"paste a link"**: AI extracts quote, speaker, date, venue and pre-fills the form; manual multi-step wizard as fallback: (1) who said it → (2) exact quote + **required primary source** → (3) when/where → (4) type, category, deadline → (5) review.
- Inline duplicate detection against existing propositions: "This is already tracked — add this person's stance to it instead?" Creating a new proposition is the fallback, not the default.
- Make the rule visually unmissable: *no primary source, no claim*.

### E. Leaderboards
- Most/least accurate (with minimum-resolved-claims threshold), filterable by domain: politicians, pundits, economists, tech CEOs, sports analysts.
- "Best call of the year" / "Worst miss" highlights.

### F. Supporting pages (lighter treatment)
- Browse by category; search results.
- **User profile:** the user's own prediction scorecard (same scorecard design as public figures — accuracy from their registered stances on resolved propositions), reputation score, accepted submissions, resolution-vote accuracy, badges (Verified Sourcer, Jury Member, Called It, etc.). A "smartest users" leaderboard makes the site's name literal.
- **Review queue** (trusted users/mods): pending submissions to verify quote authenticity, sourcing, falsifiability, and dedupe.
- **Methodology page:** how claims are admitted, how verdicts are reached, how disputes work. This page is critical for credibility — design it like a published editorial standard.

---

## 3. Crowdsourcing & trust mechanics (must be legible in the UI)

- **Lifecycle:** submitted → community review → published as Pending → resolution proposed with evidence → weighted community vote (or randomized jury of high-reputation users) → resolved → appealable once with new evidence.
- **Reputation:** users earn it from accepted submissions and resolution votes that hold up. Reputation gates jury eligibility and weights votes. Show rep subtly (small number/badge), never gamified-loud.
- **Anti-brigading signals to surface:** vote weighting note, jury composition, public audit logs, "resolution locked" state.
- Everything verifiable: every verdict traces to citations a reader can click.

---

## 4. AI assistance & external agents (design the labeling) 

Import: Do not build any AI Agents yet. Just prep the website to be AI agent enabled at some point in the future.

Governing rule, visible throughout the UI: **AI proposes, humans verify.** Every AI contribution is labeled; verdicts always carry human sign-off.

- **AI-assisted submission:** the submit wizard opens with "paste a link" — AI extracts the quote, speaker, date, and venue, and pre-fills proposition phrasing, category, deadline, and resolution criteria for the user to confirm or correct. A **falsifiability coach** flags vague claims inline and suggests measurable rewrites.
- **Resolution briefs:** when a deadline hits, an AI-assembled evidence brief (both sides, sourced) appears in the resolution module as a clearly labeled starting point for the human jury.
- **Trust labels:** "AI-drafted · human-verified" badges on assisted content; every source is auto-archived with an archive link shown beside the original.
- **External agent accounts:** third-party AI agents can register (tied to an accountable human/org owner) and submit claims, stances, and evidence — restricted to mechanically-resolvable categories (finance, sports, markets, scheduled events). Agents are publicly badged as agents, can never vote on resolutions, and have submission quotas that scale with their acceptance rate. Their submissions land in a separate review queue with automated pre-checks.
- **Agent scorecards:** agents get the same public scorecard template as people, plus a "smartest agents" leaderboard.

## 5. Visual design direction

- **Typography:** authoritative serif for headlines and quotes (Tiempos/Source Serif feel), clean grotesque sans for UI (Inter-like), tabular monospaced figures for all stats.
- **Palette:** paper-white background, near-black ink, one restrained brand accent. Status colors (green/amber/red/blue/slate/purple) are the only loud colors and must be colorblind-safe — always pair color with an icon or label.
- **Charts:** minimal, Tufte-style — stacked distribution bars, sparklines, dot timelines. No chartjunk.
- **Citations everywhere:** source links are first-class visual citizens, not footnotes.
- Newspaper-grade information density on desktop; fully responsive with the claim card as the mobile atom.
- Light mode primary; dark mode optional.

## 6. Key reusable components

ClaimCard (quote excerpt, person chip, status badge, date, source icon, follow button + count, deadline countdown for pending), StatusBadge system, ScoreGauge + distribution bar, EvidencePanel, ResolutionVote widget, TimelineView, CompareView, ShareCard, AuditTrail list, AgentBadge, "AI-drafted · human-verified" label.

## 7. Growth surfaces (design these as first-class features)

- **Shareable asset system:** auto-generated social images (OG cards) for every proposition, resolution, and person scorecard — quote + verdict + source + smarthumans.ai branding, one-tap share. Also a personal scorecard share card for users ("Top 2% of predictors").
- **Resolution-day scoreboard page:** an auto-generated roundup template published when a major proposition (or cluster) resolves — "The Fed decided today. 14 people made a call; 3 were right" — with each figure's stance, quote, and verdict. Designed to be screenshot-friendly.
- **"Resolves soon" surfaces:** homepage rail and a dedicated page of propositions approaching their deadlines, with countdowns and follower counts.
- **Embeddable widgets:** compact embeddable versions of the person scorecard and the claim card for journalists and bloggers (with backlink). Design the embed at ~600px and a narrow variant.
- **Notifications & weekly digest email:** a notification center for resolution alerts on followed claims, and a digest email template — "3 claims you follow resolved this week," upcoming deadlines, your personal record.
- **SEO-first page anatomy:** every proposition page opens with a direct answer block ("Did Trump build the wall? Verdict: Partly True") above the fold, question-phrased title, breadcrumbs, and structured claim/verdict markup — each page targets the query people actually type.

## 8. States & edge cases to include

Pending claim with countdown; disputed claim; person with too few resolved claims ("not enough data to score"); empty search result with "request this person" CTA; claim with no deadline ("resolves when event occurs"); mobile claim ledger.

Populate all screens with realistic sample data (use Donald Trump's profile as the worked example, plus 2–3 contrasting figures such as an economist and a tech CEO) so the design reads as a living product, not a wireframe.


## Tech stack:

- Framework: Next.js + TypeScript + Tailwind + shadcn/ui. Server-rendered pages so every proposition page is fully indexable. shadcn/ui matches the clean data-journalism aesthetic and Claude Design / Claude Code output maps onto it directly.
- Database: Postgres. One service covers your relational model (propositions, stances, votes, audit trails), auth, file storage, and — crucially — pgvector for the dedupe embeddings, so you don't need a separate vector database. Drizzle as the ORM. (for building on local, you can use my local postgres database "smarthumans". Postgres is installed and running on this computer locally). 
- Use Better Auth for authentication
- Hosting: Vercel. Zero-config with Next.js, and its OG-image generation (@vercel/og) is exactly how you build the verdict share cards — rendered on the fly, no design pipeline.
- API server will run on render.com. It needs to be Node.js.
- Search: Postgres full-text first; only add Meilisearch/Typesense if it becomes a bottleneck.

## Changes:

- Hero: "See who saw it coming"
