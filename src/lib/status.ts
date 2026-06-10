import type { ClaimStatus, ClaimType, Category } from "@/db/schema";

export const STATUS_META: Record<
  ClaimStatus,
  {
    label: string;
    shortLabel: string;
    /** tailwind classes for badge */
    badge: string;
    /** solid color class for dots/bars */
    dot: string;
    icon: "clock" | "check" | "halfCheck" | "x" | "undo" | "question" | "scale";
  }
> = {
  pending: {
    label: "Pending",
    shortLabel: "Pending",
    badge: "bg-st-pending-bg text-st-pending-tx border-transparent",
    dot: "bg-st-pending",
    icon: "clock",
  },
  came_true: {
    label: "Came True",
    shortLabel: "True",
    badge: "bg-st-true-bg text-st-true-tx border-transparent",
    dot: "bg-st-true",
    icon: "check",
  },
  partly_true: {
    label: "Partly True",
    shortLabel: "Partly",
    badge: "bg-st-partly-bg text-st-partly-tx border-transparent",
    dot: "bg-st-partly",
    icon: "halfCheck",
  },
  didnt_come_true: {
    label: "Didn't Come True",
    shortLabel: "Didn't",
    badge: "bg-st-false-bg text-st-false-tx border-transparent",
    dot: "bg-st-false",
    icon: "x",
  },
  walked_back: {
    label: "Walked Back",
    shortLabel: "Walked Back",
    badge: "bg-st-walked-bg text-st-walked-tx border-transparent",
    dot: "bg-st-walked",
    icon: "undo",
  },
  unverifiable: {
    label: "Unverifiable",
    shortLabel: "Unverifiable",
    badge: "bg-st-unverifiable-bg text-st-unverifiable-tx border-transparent opacity-90",
    dot: "bg-st-unverifiable",
    icon: "question",
  },
  disputed: {
    label: "Disputed",
    shortLabel: "Disputed",
    badge:
      "bg-st-disputed-bg text-st-disputed-tx border-st-disputed border-dashed [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(138,106,31,.10)_4px,rgba(138,106,31,.10)_8px)]",
    dot: "bg-st-disputed",
    icon: "scale",
  },
};

export const STATUS_ORDER: ClaimStatus[] = [
  "came_true",
  "partly_true",
  "didnt_come_true",
  "walked_back",
  "disputed",
  "unverifiable",
  "pending",
];

export const TYPE_LABEL: Record<ClaimType, string> = {
  prediction: "Prediction",
  promise: "Promise",
  factual: "Factual claim",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  ai: "AI",
  markets: "Markets",
  stocks: "Stocks",
  semiconductors: "Semiconductors",
  gold: "Gold",
  economy: "Economy",
  health: "Health",
  immigration: "Immigration",
  foreign_policy: "Foreign Policy",
  nba: "NBA",
  mlb: "MLB",
  nfl: "NFL",
  f1: "F1",
  other: "Other",
};

export const DOMAIN_LABEL: Record<string, string> = {
  politician: "Politician",
  economist: "Economist",
  tech_ceo: "Tech CEO",
  pundit: "Pundit",
  analyst: "Analyst",
  agent: "AI Agent",
  other: "Public figure",
};
