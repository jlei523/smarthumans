---
name: SmartHumans
description: A public, sourced scoreboard of predictions and promises — newsprint calm, verdict color.
colors:
  newsprint: "#faf9f6"
  archive-cream: "#f4f2ec"
  archive-cream-deep: "#efece4"
  card-white: "#ffffff"
  press-ink: "#201e1b"
  ink-soft: "#56524b"
  ink-faded: "#6c675c"
  ink-ghost: "#b4aea0"
  hairline: "#e8e4da"
  input-stroke: "#d6d1c4"
  error-brick: "#b23a30"
  open-blue: "#2563eb"
  open-blue-pill: "#e9effd"
  open-blue-text: "#1d4ed8"
  verdict-green: "#16a34a"
  verdict-green-pill: "#e7f6ec"
  verdict-green-text: "#136e37"
  caution-amber: "#d97706"
  caution-amber-pill: "#fcf0df"
  caution-amber-text: "#a04a08"
  refuted-red: "#dc2626"
  refuted-red-pill: "#fdeaea"
  refuted-red-text: "#b91c1c"
  retraction-purple: "#7c3aed"
  retraction-purple-pill: "#f2ebfd"
  retraction-purple-text: "#6d28d9"
  unverifiable-stone: "#79746a"
  unverifiable-stone-pill: "#eceae3"
  unverifiable-stone-text: "#5e594f"
  disputed-stone: "#6b6455"
  disputed-stone-text: "#56524b"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.12em"
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.42
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.35
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.71875rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  card: "12px"
  xl: "14px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  card-gap: "14px"
  md: "16px"
  card-pad: "18px 20px"
  lg: "24px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.press-ink}"
    textColor: "{colors.newsprint}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  status-pill-true:
    backgroundColor: "{colors.verdict-green-pill}"
    textColor: "{colors.verdict-green-text}"
    rounded: "{rounded.md}"
    padding: "5px 9px"
  follow-pill:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  follow-pill-active:
    backgroundColor: "{colors.press-ink}"
    textColor: "{colors.newsprint}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  category-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "2.5px 10px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
  claim-card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.press-ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
---

# Design System: SmartHumans

## 1. Overview

**Creative North Star: "The Public Record"**

SmartHumans looks like a permanent, sourced civic ledger — newsprint calm with archival weight. Warm paper surfaces, near-black press ink, hairline rules, and tabular numerals carry the entire interface; the seven verdict colors are the only thing on any screen allowed to speak loudly, and even they speak through pale tinted pills with darkened text, never through saturated fills. The register is product: dense, fast, identical from person to person. Quotes and propositions are content artifacts set in serif; everything that operates the site — labels, buttons, filters, dates — is quiet sans.

The system explicitly rejects partisan or editorial styling that implies judgment, marketing copy (plain noun H1s; no kickers, taglines, or blurbs), gamified loudness, chartjunk, and engagement-bait. Nothing flashes, pulses, or celebrates. The data delivers the verdict; the design's job is to be believed.

**Key Characteristics:**
- Warm paper ground (#faf9f6) with white cards and hairline borders — structure from rules and tints, not shadows
- Verdict color appears only as status: pale pill + darkened text + label, never decoration
- Serif = content (propositions, quotes, page titles); Inter = UI; IBM Plex Mono = numerals only
- Newspaper-grade density inside a `max-w-6xl` (1152px) column
- Every number is tabular; every source link is a first-class visual citizen

## 2. Colors: The Newsprint & Verdict Palette

A near-monochrome warm paper-and-ink ground over which seven verdict colors — and nothing else — carry meaning.

### Primary
- **Press Ink** (#201e1b): the single "brand" color. Body headings, primary buttons, the active state of the follow pill. When something is selected or primary, it turns ink, not blue.

### Neutral
- **Newsprint** (#faf9f6): the page ground everywhere. Sections sit directly on it; boxes are reserved for claim/figure cards and active widgets.
- **Archive Cream** (#f4f2ec) and **Archive Cream Deep** (#efece4): secondary surfaces — hover fills, muted panels, table stripes. One step and two steps "older paper" than the ground.
- **Card White** (#ffffff): claim cards, popovers, dialogs. White-on-newsprint is the site's main figure-ground move.
- **Ink Soft** (#56524b) / **Ink Faded** (#6c675c) / **Ink Ghost** (#b4aea0): the secondary-text ramp — metadata, timestamps, separators, disabled. Ink Faded is the floor for readable text (≥4.5:1 on every paper surface); Ink Ghost is decoration only (dividers, dots).
- **Hairline** (#e8e4da): default 1px border on cards and section rules. **Input Stroke** (#d6d1c4): the darker stroke for form fields and outlined chips.
- **Error Brick** (#b23a30): destructive actions only — deliberately duller than Refuted Red so form errors never read as a claim verdict.

### Tertiary: The Seven Verdicts
Each status is a trio: solid (dots, bars, charts), pale pill fill, and darkened pill text (all pill text ≥4.5:1 on its fill).

- **Open Blue** (#2563eb · pill #e9effd · text #1d4ed8): Pending. Also the only link-ish accent (source links borrow the pill text shade).
- **Verdict Green** (#16a34a · #e7f6ec · #136e37): Came True.
- **Caution Amber** (#d97706 · #fcf0df · #a04a08): Partly True.
- **Refuted Red** (#dc2626 · #fdeaea · #b91c1c): Didn't Come True.
- **Retraction Purple** (#7c3aed · #f2ebfd · #6d28d9): Walked Back.
- **Unverifiable Stone** (#79746a · #eceae3 · #5e594f): Unverifiable — deliberately de-emphasized, slightly transparent.
- **Disputed Stone** (#6b6455 · white fill with a 45° hatch + dashed border · text #56524b): Disputed — the one textured badge, so it reads even without color.

### Named Rules
**The One Loud Voice Rule.** Verdict colors appear only where they state a verdict: status pills, status dots, distribution bars, chart marks. Never as decoration, button color, heading color, or background mood. Everything else on the page is paper and ink.

**The Label Rule.** Tint never carries meaning alone. Every status surface pairs its color with a text label (or an icon plus accessible name at dot size).

## 3. Typography

**Display Font:** Source Serif 4 (with Georgia fallback)
**Body/UI Font:** Inter (with system-ui fallback)
**Data Font:** IBM Plex Mono (with ui-monospace fallback)

**Character:** A newspaper pairing — authoritative serif for what was *said*, neutral grotesque for the machinery around it, and monospaced figures so columns of numbers align like a ledger. The serif is reserved for content; it never labels a button.

### Hierarchy
- **Display** (600, 2.25rem/1.05, -0.025em): person and claim page H1s. Plain nouns — a name, a proposition — never slogans.
- **Headline** (700, 1.875rem/1.2, -0.025em): standard page H1s (Search, Topics, Leaderboards), serif.
- **Title** (600, 0.75rem, +0.12em, uppercase, muted): the one section-header pattern site-wide — small-caps sans over a hairline rule. This is a deliberate system, not a per-section eyebrow: it sits *as* the heading, never above another heading.
- **Body** (serif 400, 1rem/1.42, `text-wrap: pretty`): proposition statements on cards; truncated at sentence boundaries, never mid-clause ellipses. Prose caps at 65–75ch.
- **Label** (Inter 600, 0.8125rem): names, buttons, filters. Metadata steps down to 11.5px/500 in Ink Faded.
- **Data** (IBM Plex Mono 500, 0.71875rem, tabular): counts, countdowns, percentages, scores — anywhere a number sits next to other numbers.

### Named Rules
**The Serif-Is-Content Rule.** Source Serif 4 appears only on content artifacts: propositions, quotes, page titles, the logotype. UI labels, buttons, navigation, and form text are always Inter; numerals in stat positions are always mono.

**The Plain Noun Rule.** H1s are plain nouns ("Topics", a person's name, the proposition). No kickers, taglines, or marketing blurbs anywhere on product pages.

## 4. Elevation

Borders structure, shadows whisper. Depth comes from hairline borders (#e8e4da), figure-ground (white cards on newsprint), and surface tints (Archive Cream hovers) — never from shadow strength. Cards carry a whisper-soft warm double shadow that suggests paper lift; it is ambient texture, not hierarchy. Overlays (dropdowns, dialogs) may step up one shadow level because they are genuinely above the page.

### Shadow Vocabulary
- **Paper lift** (`box-shadow: 0 1px 2px rgba(40,35,25,0.04), 0 2px 6px rgba(40,35,25,0.05)`): claim and figure cards at rest. The warm-tinted black keeps shadows from going cold against the cream surfaces.
- **shadow-xs** (Tailwind `shadow-xs`): pills and small controls (follow button).
- **Overlay** (Tailwind `shadow-md`-class): dropdown menus, popovers, dialogs only.

### Named Rules
**The Whisper Rule.** If a shadow is noticeable, it is too strong. Structure must survive with shadows deleted; a screenshot with shadows off should still read perfectly.

## 5. Components

Quiet and exact: small, precise controls; semibold sans labels; tabular numerals; nothing saturates or moves unless it conveys state or verdict.

### Buttons
- **Shape:** gently rounded (10px radius; xs/sm sizes step down to 10–12px caps), heights 24/28/32/36px (xs/sm/default/lg).
- **Primary:** Press Ink fill, Newsprint text (`bg-primary text-primary-foreground`), hover eases to 80% — never a hue change.
- **Outline / Secondary / Ghost:** hairline border or Archive Cream fill; hover deepens the cream one step.
- **Focus:** 3px ring at 50% ring color (#8b8579) with border shift — identical across all controls. Active state nudges down 1px (`translate-y-px`).
- **Destructive:** Error Brick at 10% fill with Error Brick text; never solid red.

### Chips & Pills
- **Status pill:** pale verdict fill, darkened verdict text, 8px radius, semibold 12px label; optional mono countdown after a 1px divider ("Pending · 7 mo"). Disputed adds dashed border + hatch. Container-query aware: sheds to short labels under 26rem.
- **Follow pill:** fully round, Card White with Input Stroke border, semibold 12px label + mono count; following state inverts to solid Press Ink with Newsprint text.
- **Category chip:** outlined fully-round pill, 11.5px medium Ink Soft text; hover darkens border and tints Archive Cream. Links to the topic page.

### Cards / Containers
- **Corner style:** 12px radius (the "Soft" base theme normalizes all cards to 12px).
- **Background:** Card White on Newsprint; **Border:** 1px Hairline, hover darkens to Input Stroke; **Shadow:** paper lift (see Elevation).
- **Internal padding:** 18px 20px with 14px vertical gaps. The whole card is a link via an `after:` overlay; inner interactive elements re-raise with `relative z-10`.
- Boxes are reserved for claim/figure cards and "active" widgets — sections sit directly on the page background under a Title-style header.

### Inputs / Fields
- **Style:** transparent background, 1px Input Stroke border, 10px radius, 32px height.
- **Focus:** same 3px ring vocabulary as buttons. **Error:** Error Brick border + 20% ring (`aria-invalid`). **Disabled:** 50% opacity, no pointer.

### Navigation
- Sticky header, 56px tall, Newsprint at 85–90% with backdrop blur, hairline bottom border. Serif logotype, inline search (max-w-lg), ink-fill Submit button, quiet icon buttons (Ink Soft, Archive Cream hover). Below it, a topic strip; on mobile the nav collapses to a sheet and the claim card becomes the atom.

### Signature Component: The Claim Card
Three fixed rows. Row 1: identity — overlapping 24px round portraits (max 3, +N overflow link), semibold 13px name, 11.5px date — opposite the status pill with its countdown. Row 2: the proposition in serif body, sentence-boundary truncated, the card's link target. Row 3: follow pill, optional stance buttons ("Will happen / Won't"), category chip last. Resolved rails swap the follow pill for "resolved 3d ago". Every claim, every person, identical anatomy — the symmetry is the credibility.

## 6. Do's and Don'ts

### Do:
- **Do** pair every status color with its text label — tint never carries meaning alone (The Label Rule).
- **Do** keep verdict colors exclusively for verdicts: pills, dots, distribution bars, chart marks (The One Loud Voice Rule).
- **Do** set propositions and quotes in Source Serif 4 and every number in tabular IBM Plex Mono.
- **Do** use plain noun H1s ("Topics", "Donald Trump") and let pages explain themselves.
- **Do** keep motion to state changes: 140–200ms, ease-out, with a `prefers-reduced-motion: reduce` alternative for every animation (the `menu-pop` pattern).
- **Do** give every interactive control the shared focus vocabulary: 3px ring at 50%, border shift.
- **Do** keep identical templates for every person — same scorecard, same ledger, same card anatomy.

### Don't:
- **Don't** use partisan or editorial styling that implies judgment — no per-person color moods, no mocking or celebratory treatments. The status colors are the only verdict.
- **Don't** write marketing copy: no kickers, taglines, or self-promotional blurbs on product pages (per PRODUCT.md).
- **Don't** add gamified loudness — no confetti, streaks, pulse animations, or casino energy. Follower counts and countdowns inform; they never flash or pressure.
- **Don't** ship chartjunk: no 3D, no gradient fills, no decorative dashboards. Distribution bars, sparklines, and dot timelines only.
- **Don't** use saturated verdict color as fill on large surfaces, buttons, or headings — pale pill + darkened text is the ceiling.
- **Don't** use `border-left`/`border-right` stripes as status accents, gradient text, or glassmorphism (header blur is the one earned exception).
- **Don't** color form errors Refuted Red — destructive UI is Error Brick (#b23a30) so it can never be mistaken for a claim verdict.
- **Don't** set UI labels, buttons, or navigation in the serif, and don't let Ink Ghost (#b4aea0) carry readable text.
- **Don't** nest cards or box every section — section headers sit on the page ground; boxes are for claim/figure cards and active widgets only.
