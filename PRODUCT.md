# Product

## Register

product

## Users

- **Readers** — journalists, politically engaged readers, market watchers. They arrive from search ("did Trump build the wall?") or a shared verdict card, in lookup mode: check one person's track record or one claim's outcome, skim, click the source, leave convinced. Speed-to-answer and provable sourcing are the whole experience.
- **Contributors** — signed-in users who submit claims (primary source required), register stances, propose and vote on resolutions. They build a personal track record scored the same way as public figures.
- **Trusted reviewers / mods** — work the review queue: verify quote authenticity, sourcing, falsifiability, dedupe against existing propositions.
- **Future: external AI agents** — badged, owner-accountable accounts limited to mechanically-resolvable categories. The site is prepped for them but ships none; "AI proposes, humans verify" is the visible governing rule.

The job to be done, for everyone: *show me who said what would happen, whether it did, and the proof — in one click.*

## Product Purpose

A public, sourced, community-verified scoreboard of predictions and promises by public figures. One canonical **proposition** per resolvable event; each person holds a **stance** on it; when it resolves, every stance scores automatically. Follower count is the importance signal that drives sorting and surfacing. Success looks like being citable: readers trust a verdict because every verdict traces to clickable primary sources, a transparent resolution process, and a full audit trail.

## Brand Personality

Credible, neutral, stats-forward. Data journalism: FiveThirtyEight × Polymarket × Wikipedia. The design stays calm so the data can deliver the verdict — quotes are typographic artifacts (serif), numbers are tabular figures, citations are first-class visual citizens. Rigorously nonpartisan: identical templates for every person, no styling that implies editorial judgment.

## Anti-references

- **Partisan or editorial styling that implies judgment.** Same scorecard, same ledger, same treatment for every person. The status colors are the only verdict.
- **Marketing copy.** Pages are self-explanatory: plain noun H1s, no kickers, no taglines, no self-promotional blurbs on product pages.
- **Gamified loudness.** Reputation appears as a small number or badge, never confetti, streaks, or casino energy. Not a prediction-market trading floor.
- **Chartjunk.** Tufte-style minimal charts: distribution bars, sparklines, dot timelines. No 3D, no gradients-as-decoration, no decorative dashboards.
- **Engagement-bait.** Follower counts and countdowns inform; they never flash, pulse, or pressure.

## Design Principles

1. **The data delivers the verdict.** Neutral templates, calm surfaces; status colors are the only loud element, and they always speak with a text label.
2. **Every claim traces to a click.** Primary sources, archive links, and audit trails are first-class UI, not footnotes. No source, no claim.
3. **Identical treatment for every person.** One scorecard design, one ledger design — credibility comes from the symmetry.
4. **Follows = importance.** The community's attention, not an editor's taste, decides what surfaces.
5. **AI proposes, humans verify.** Every AI-assisted contribution is labeled; verdicts always carry human sign-off.

## Accessibility & Inclusion

- Colorblind-safe status palette; color never carries meaning alone — every status pairs its tint with a text label (and icon where space allows).
- WCAG AA contrast for body text (≥4.5:1) and UI text on tinted status pills.
- `prefers-reduced-motion` alternatives for every animation.
- Server-rendered semantic HTML; every proposition page fully indexable and readable without JS.
