import type { Category } from "@/db/schema";

/** Neutral topic blurbs. */
export const TOPIC_BLURBS: Record<Category, string> = {
  ai: "Capability claims and timelines for AI, autonomy, and robotics. Ambitious near-term forecasts dominate — and resolve fast.",
  markets:
    "Calls on indices, rates, crashes, and rallies. Hedged language is common; the record keeps the exact words.",
  stocks:
    "Single-company calls — price targets, production milestones, go-private pledges, and 'dead money' verdicts.",
  semiconductors:
    "Forecasts on chips, fabs, and the AI hardware buildout — demand, supply, and who wins it.",
  gold: "Price targets and macro theses on gold and hard assets. Round numbers attract round predictions.",
  economy:
    "Predictions about growth, jobs, debt, inflation, and prices. The most-claimed topic on the site, and among the hardest to resolve cleanly.",
  health:
    "Claims about public health, disease, drugs, and care policy. Deadlines are often explicit, making resolution unusually clean.",
  immigration:
    "Promises and predictions on borders, enforcement, and immigration law.",
  foreign_policy:
    "Commitments and forecasts on diplomacy, conflict, treaties, and alliances. Long horizons and contested resolutions are common here.",
  nba: "Season predictions, playoff calls, and championship picks — short-horizon and mechanically resolvable.",
  mlb: "Pennant races, World Series picks, and player forecasts — resolved by the box score.",
  nfl: "Super Bowl picks, season win totals, and draft verdicts — settled on the field.",
  f1: "Race wins, title fights, and driver-move bets — resolved by the checkered flag.",
  other:
    "Tracked claims that don't fit a standing domain — space, courts, elections, and the rest of the record.",
};
