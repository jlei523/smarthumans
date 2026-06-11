import type { ClaimSubtype } from "@/db/schema";
import { FACTUAL_CLAIMS_V2 } from "./flags";

/**
 * AI-extractor seam: submitters are never asked for the subtype — it is
 * inferred from the quote + proposition and shown to reviewers, who correct
 * it in the review queue. This heuristic stands in until the extraction
 * model ships (the call site won't change).
 *
 *   promise    — the speaker commits to act
 *   prediction — a forecast about events
 *   factual    — a checkable statement about the present/past (v2-gated)
 */
export function inferSubtype(text: string): ClaimSubtype {
  const t = ` ${text.toLowerCase()} `;
  // first-person commitment to act
  const commits =
    /\b(i|we|my (administration|government|company)|this administration)\s*('ll|will|'m going to|am going to|'re going to|are going to|promise|pledge|commit|intend to|plan to)\b/;
  if (commits.test(t)) return "promise";
  // forward-looking markers → forecast
  const future =
    /\b(will|won't|going to|gonna|by (19|20)\d\d|next (year|month|week|quarter|season)|within \d|predict|forecast|expect)\b/;
  if (FACTUAL_CLAIMS_V2 && !future.test(t)) return "factual";
  return "prediction";
}

export function normalizeSubtype(v: unknown): ClaimSubtype | null {
  if (v === "prediction" || v === "promise") return v;
  if (v === "factual" && FACTUAL_CLAIMS_V2) return v;
  return null;
}
