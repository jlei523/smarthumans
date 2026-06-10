"use client";

/**
 * Anonymous stakes: signed-out users can take sides with zero friction.
 * Stakes live in localStorage until sign-in, then migrate to the server
 * (see AuthMenu). After the third call we nudge signup to "save your record".
 */

const KEY = "sh-anon-stakes";

export type AnonStakes = Record<number, "affirm" | "deny">;

export function getAnonStakes(): AnonStakes {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getAnonStake(propositionId: number): "affirm" | "deny" | null {
  return getAnonStakes()[propositionId] ?? null;
}

/** Returns the new value for this proposition (null = cleared). */
export function toggleAnonStake(
  propositionId: number,
  position: "affirm" | "deny",
): "affirm" | "deny" | null {
  const all = getAnonStakes();
  const next = all[propositionId] === position ? null : position;
  if (next) all[propositionId] = next;
  else delete all[propositionId];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
  return next;
}

export function anonStakeCount(): number {
  return Object.keys(getAnonStakes()).length;
}

export function clearAnonStakes() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}
