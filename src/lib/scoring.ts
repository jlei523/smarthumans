import type { ClaimStatus } from "@/db/schema";

export type StanceOutcome =
  | "correct"
  | "partly"
  | "incorrect"
  | "walked_back"
  | "pending"
  | "unverifiable"
  | "disputed";

/**
 * A stance is scored against the proposition's resolved status.
 * Affirmers are credited when it came true; deniers when it didn't.
 */
export function stanceOutcome(
  status: ClaimStatus,
  position: "affirm" | "deny",
): StanceOutcome {
  switch (status) {
    case "pending":
      return "pending";
    case "disputed":
      return "disputed";
    case "unverifiable":
      return "unverifiable";
    case "walked_back":
      return "walked_back";
    case "partly_true":
      return "partly";
    case "came_true":
      return position === "affirm" ? "correct" : "incorrect";
    case "didnt_come_true":
      return position === "deny" ? "correct" : "incorrect";
  }
}

export type Scorecard = {
  total: number;
  correct: number;
  partly: number;
  incorrect: number;
  walkedBack: number;
  pending: number;
  unverifiable: number;
  disputed: number;
  resolved: number;
  /** (correct + 0.5·partly) / resolved — walked-back counts against */
  accuracy: number | null;
  hasEnoughData: boolean;
};

export const MIN_RESOLVED_FOR_SCORE = 3;

export function buildScorecard(
  outcomes: StanceOutcome[],
): Scorecard {
  const c = {
    correct: 0,
    partly: 0,
    incorrect: 0,
    walked_back: 0,
    pending: 0,
    unverifiable: 0,
    disputed: 0,
  };
  for (const o of outcomes) c[o === "walked_back" ? "walked_back" : o]++;
  const resolved = c.correct + c.partly + c.incorrect + c.walked_back;
  const accuracy =
    resolved > 0 ? (c.correct + 0.5 * c.partly) / resolved : null;
  return {
    total: outcomes.length,
    correct: c.correct,
    partly: c.partly,
    incorrect: c.incorrect,
    walkedBack: c.walked_back,
    pending: c.pending,
    unverifiable: c.unverifiable,
    disputed: c.disputed,
    resolved,
    accuracy,
    hasEnoughData: resolved >= MIN_RESOLVED_FOR_SCORE,
  };
}

export function accuracyGrade(accuracy: number): string {
  if (accuracy >= 0.9) return "A";
  if (accuracy >= 0.8) return "A−";
  if (accuracy >= 0.7) return "B+";
  if (accuracy >= 0.6) return "B";
  if (accuracy >= 0.5) return "B−";
  if (accuracy >= 0.4) return "C";
  if (accuracy >= 0.3) return "C−";
  if (accuracy >= 0.2) return "D";
  return "F";
}
