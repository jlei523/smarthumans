---
target: related claims sidebar — src/app/claims/[slug]/page.tsx
total_score: 27
p0_count: 0
p1_count: 1
timestamp: 2026-06-11T04-40-12Z
slug: elated-claims-sidebar-src-app-claims-slug-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Status is visible, but as bare colored text not the proper StatusBadge pill |
| 2 | Match System / Real World | 3 | Language is natural; "Related claims" is clear |
| 3 | User Control and Freedom | 3 | Standard link behavior; no traps |
| 4 | Consistency and Standards | 2 | Status display breaks the site-wide StatusBadge language; quote vs. statement mixed in same slot |
| 5 | Error Prevention | 3 | Read-only surface; n/a mostly |
| 6 | Recognition Rather Than Recall | 3 | Labels present; status readable without prior knowledge |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; no follower context to judge relevance; no "see more" |
| 8 | Aesthetic and Minimalist Design | 3 | Appropriately stripped back; divide-y list is correct for the space |
| 9 | Error Recovery | 3 | n/a for read-only sidebar |
| 10 | Help and Documentation | 2 | No explanation of why these claims are "related" (same category only, not semantically linked) |
| **Total** | | **27/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment**: No glaring AI slop tells. The sidebar follows the site's small-caps section-heading pattern correctly (`text-xs font-semibold uppercase tracking-[0.12em]`), and the `divide-y` list is the right affordance for a compact secondary rail. The problems here are internal consistency failures, not aesthetic bloat.

**Deterministic scan**: The automated detector returned zero findings on the target file. No banned patterns detected.

**Visual overlays**: Browser visualization confirmed the sidebar renders at 300px wide in a sticky column. Four items are visible with the divide-y hairlines and the colored status text is legible. Hover state only triggers underline on the quote text — the row background does not respond.

## Overall Impression

The sidebar is clean and space-efficient, but it's a bespoke component that quietly breaks two of the site's own rules: the StatusBadge visual system and the proposition-vs-quote distinction. A reader looking at the related claims sees colored text labels instead of the recognizable tinted pills used everywhere else on the page — a subtle but real inconsistency that erodes visual coherence. The content mixing (verbatim quote OR proposition statement in the same slot) is the deeper issue.

## What's Working

1. **Section heading is pixel-matched to the Section component style.** `text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground border-b pb-2` is nearly identical to what `Section` renders. The heading doesn't feel out of place on the page.
2. **`divide-y` list with `py-3` is the correct density for a 300px sidebar rail.** Items are scannable without being cramped. The line-clamp-2 prevents any single quote from dominating.
3. **Sorted by follower count via `getRelatedClaims`.** The right four claims surface without requiring editorial curation — the community's importance signal drives it.

## Priority Issues

**[P1] Status uses plain colored text instead of StatusBadge**
- **What**: `<span className={cn("font-semibold", STATUS_TEXT[p.status])}>Didn't Come True</span>` — just bold colored text, no tinted pill or border.
- **Why it matters**: The design spec calls the status badge system "the central visual language of the site." The StatusBadge pill with tinted background + border is how users learn to read verdicts site-wide. Bare colored text in the sidebar makes the same information feel different, undermining the pattern. It also removes the accessibility contract — the pill pairs tint with label, but so does the text here; however, the visual hierarchy cue (pill = verdict) breaks.
- **Fix**: Replace the `<span>` with `<StatusDot status={p.status} className="mr-1" />` + the label text, or use `<StatusBadge status={p.status} size="sm" />`. `StatusDot` is the most space-efficient option for a 300px sidebar.
- **Suggested command**: `/impeccable polish`

**[P2] Quote and proposition statement are mixed in the same visual slot**
- **What**: When `primaryStance` returns a stance, the sidebar shows `"${ps.quote}"` (the speaker's verbatim words). When there's no affirming stance, it shows `p.statement` (the canonical proposition). Both render identically as `text-sm line-clamp-2`.
- **Why it matters**: These are structurally different things — a quote is someone's words, a statement is the site's canonical resolvable question. A reader sees "Prices will come down. You just watch…" (Trump's verbatim) next to "By 2005 or so, it will become clear…" (also a verbatim quote) and has no way to know they're reading quotes, not proposition summaries. The ClaimCard always shows `proposition.statement`. The sidebar should match: show the statement, not the raw quote.
- **Fix**: Replace `{ps ? \`"${ps.quote}"\` : p.statement}` with `{p.statement}` for all items. If the person attribution matters, the existing ` · {ps.person.name}` line already handles it.
- **Suggested command**: `/impeccable polish`

**[P2] Row hover affordance is underline-only — no background response**
- **What**: `className="group block py-3"` — the full row has no hover background. Only the quote text underlines via `group-hover:underline`.
- **Why it matters**: On a white-background sidebar, a bare text underline is the only signal that the entire row is a link. This is weaker than the site's card hover treatment (`hover:border-input`) and breaks the pattern for interactive list items. On touch devices, hover is moot entirely.
- **Fix**: Add `hover:bg-paper-2 rounded-sm transition-colors` to the `<Link>` and wrap the content in `-mx-2 px-2` to give the background room, or simply add `hover:bg-muted/40` with `rounded-sm`.
- **Suggested command**: `/impeccable polish`

**[P3] Raw `<section>` bypasses the Section component — missing mt-4 spacer**
- **What**: The sidebar renders `<section className="mt-10"><h2 ...>Related claims</h2><ul ...>` directly. The `Section` component wraps children in `<div className="mt-4">` to create breathing room below the heading line.
- **Why it matters**: Without the mt-4 spacer, the first `<li>` starts immediately at the `border-b` of the heading — slightly tighter than every other section on the page. It's subtle but noticeable against the properly-spaced main column.
- **Fix**: Either use `<Section title="Related claims" className="mt-10">` (may need to adjust because Section adds `mt-4` before children, which would require the `<ul>` to lose its first item's top padding), or just add `<div className="mt-4">` around the `<ul>`.
- **Suggested command**: `/impeccable polish`

**[P3] Person name is unlinked**
- **What**: `<> · {ps.person.name}</>` — plain unclickable text. Every other occurrence of a person's name on this page links to their profile.
- **Why it matters**: A reader interested in "Jim Cramer" can't navigate to his profile from here without going through the claim first — breaking the pattern the rest of the site follows.
- **Fix**: `<Link href={"/p/" + ps.person.slug} className="hover:underline underline-offset-2">{ps.person.name}</Link>` — but check that `ps.person.slug` is included in the query join; add `slug: true` to person column selection in `getRelatedClaims` if not present.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Jordan (First-Timer)**: Arrives from a shared link expecting to find more context. The related claims section is unlabeled — there's no indication that "related" means "same category." Jordan clicks a related claim, ends up on the inflation page, can't tell why it's related to the fax machine claim they just came from. No tooltip or explanation. Low abandonment risk because they can just navigate back, but the sidebar adds noise without context.

**Riley (Stress Tester)**: Will notice that item 1 shows a verbatim Trump quote in quotes, item 3 shows a Krugman quote in quotes, but item 5 (if it had no affirmers) would show the plain proposition statement without quotes. Same visual treatment, different data source. Riley will correctly flag this as a data presentation bug, not just a style inconsistency.

**Sam (Accessibility-Dependent)**: The colored status text (`text-st-false-tx`) conveys meaning through color. While the label text is also present (so WCAG 1.4.1 "use of color" is technically met), the StatusBadge pill adds a visible border that makes the container legible even in a desaturated view. Sam sees the sidebar status and the main body StatusBadge and gets two different interaction models for the same semantic concept.

## Minor Observations

- `getRelatedClaims` uses only `category` as the relation signal — two claims in "Economy" are "related" even if they're about completely different topics. There's no tag, keyword, or embedding-based similarity. This is a data/product issue, not purely UI, but it contributes to why "why are these related?" has no good answer. Adding a small muted label like "More in Economy →" would at least set expectations.
- The sidebar has no "empty state" — if `related.length === 0`, the section simply disappears. That's correct behavior, but worth noting as an intentional design choice rather than an oversight.
- `limit = 4` is hardcoded in `getRelatedClaims`. If fewer than 4 exist in the category, the sidebar is shorter and the action panel above it looks more isolated. Consider a minimum of 3 or nothing.

## Questions to Consider

- "Should the 'Related claims' section ever surface claims from outside the current category if there aren't enough in the same one — or is an empty sidebar preferable to tangentially-related items?"
- "If the person name is shown in the meta row, does the quote itself add anything? Or would `p.statement` (the canonical question) give the reader more useful context about the claim they'd be navigating to?"
- "The StatusBadge includes `@container` query logic for narrow contexts — does that make `size='sm'` workable in the 300px sidebar, or would a StatusDot be cleaner?"
