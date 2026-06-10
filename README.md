# smarthumans.ai

**They said it. We tracked it.** A public, sourced, community-verified record
of predictions and promises made by public figures — and whether they came
true.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- Postgres + Drizzle ORM
- Better Auth (email/password)
- OG share cards via `next/og`

## Local development

Requires Node 22+ and a local Postgres with a `smarthumans` database.

```bash
npm install
npx drizzle-kit push        # create / sync tables
npx tsx src/db/seed.ts      # load sample data (Trump, Musk, Krugman, Cramer)
npm run dev                 # http://localhost:3000
```

Connection settings live in `.env` (`DATABASE_URL`, `BETTER_AUTH_SECRET`).

## Key concepts

- **Proposition** — the canonical resolvable event; exists once, carries the
  resolution criteria, deadline, status, evidence, and audit trail.
- **Stance** — one person's position (affirm/deny) on a proposition, with
  their own quote, date, venue, and primary source. When a proposition
  resolves, every stance scores automatically.
- **Statuses** — Pending, Came True, Partly True, Didn't Come True, Walked
  Back, Unverifiable, Disputed.
- **Follows = importance** — follower count drives sorting, trending, and
  homepage placement.
- **AI proposes, humans verify** — all AI-assisted surfaces (submit
  extraction, falsifiability coach, resolution briefs) are labeled and
  human-confirmed. The site is prepped for future AI agents but ships none.

## Map

| Route | Purpose |
| --- | --- |
| `/` | Search hero, recently resolved, trending, open questions, leaderboard teasers |
| `/p/[slug]` | Person scorecard + filterable claim ledger (list & timeline views) |
| `/claims/[slug]` | Claim detail: quote artifact, positions, evidence, resolution vote, audit trail, discussion |
| `/submit` | Paste-a-link wizard with duplicate detection and falsifiability coach |
| `/leaderboards` | Best/worst track records, filterable by domain |
| `/compare` | Side-by-side scorecards |
| `/methodology` | The editorial standard |
| `/api/og/claim/[slug]`, `/api/og/person/[slug]` | Shareable verdict/scorecard cards |

Scoring: `accuracy = (correct + 0.5 × partly) ÷ resolved`, walked-back counts
against, minimum 3 resolved claims to qualify for a score.
