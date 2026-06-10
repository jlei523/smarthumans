import type { StanceOutcome } from "./scoring";

/**
 * Contrarian-weighted payout. The baseline is the community split at the
 * moment you staked: being right when 15% agreed with you pays ~3× more
 * than being right with the herd. Wrong calls pay nothing — there is no
 * participation currency.
 *
 *   sideSharePct — % of one-tap stakers on YOUR side when you staked (0–100;
 *   50 when you were first).
 */
export function stakePoints(
  outcome: StanceOutcome,
  sideSharePct: number | null,
): number {
  const share = (sideSharePct ?? 50) / 100;
  const base = 20 + Math.round(180 * (1 - share));
  if (outcome === "correct") return base;
  if (outcome === "partly") return Math.round(base / 2);
  return 0;
}

/** "Q2 2026" — seasons are calendar quarters. */
export function seasonOf(d: Date): string {
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

export function currentSeason(): string {
  return seasonOf(new Date());
}

/**
 * Percentile framing, never raw ranks: "Top 8%". Computed against everyone
 * with at least one scored stake.
 */
export function topPercent(mine: number, all: number[]): number | null {
  const field = all.filter((p) => p > 0);
  if (field.length === 0 || mine <= 0) return null;
  const above = field.filter((p) => p > mine).length;
  return Math.max(1, Math.ceil(((above + 1) / field.length) * 100));
}

export type BadgeKey = "called-it" | "against-the-crowd" | "verified-sourcer";

export const BADGES: Record<BadgeKey, { label: string; desc: string }> = {
  "called-it": {
    label: "Called It",
    desc: "Right on a claim with 5,000+ followers.",
  },
  "against-the-crowd": {
    label: "Against the Crowd",
    desc: "Right when 20% or fewer agreed at stake time.",
  },
  "verified-sourcer": {
    label: "Verified Sourcer",
    desc: "Ten accepted, primary-sourced submissions.",
  },
};

/** Rare badges only — computed from the record, never awarded for showing up. */
export function earnedBadges(input: {
  stakes: Array<{
    outcome: StanceOutcome;
    sideSharePct: number | null;
    propositionFollowers: number;
  }>;
  approvedSubmissions: number;
}): BadgeKey[] {
  const out: BadgeKey[] = [];
  if (
    input.stakes.some(
      (s) => s.outcome === "correct" && s.propositionFollowers >= 5000,
    )
  ) {
    out.push("called-it");
  }
  if (
    input.stakes.some(
      (s) =>
        s.outcome === "correct" &&
        s.sideSharePct !== null &&
        s.sideSharePct <= 20,
    )
  ) {
    out.push("against-the-crowd");
  }
  if (input.approvedSubmissions >= 10) out.push("verified-sourcer");
  return out;
}
