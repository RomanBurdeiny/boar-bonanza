/** Free spins tier table — keyed by reels with scatter (3/4/5) or legacy symbol count */
export const FREE_SPINS_FOR_SCATTER: Record<number, number> = {
  3: 8,
  4: 12,
  5: 18,
};

/**
 * Extra spins when feature triggers — **by number of reels** showing a scatter (matches
 * `scatterReelsAwardFreeSpins`). Using total symbol count here made stacked scatters
 * on the same 3 reels grant a tier-5 award (+18) and retriggers looked “broken”.
 */
export function freeSpinsAwardedForScatterReels(reelsWithScatter: number): number {
  if (reelsWithScatter >= 5) {
    return FREE_SPINS_FOR_SCATTER[5]!;
  }
  if (reelsWithScatter === 4) {
    return FREE_SPINS_FOR_SCATTER[4]!;
  }
  if (reelsWithScatter === 3) {
    return FREE_SPINS_FOR_SCATTER[3]!;
  }
  return 0;
}

/** @deprecated Prefer {@link freeSpinsAwardedForScatterReels} for bonus grants; kept for tooling/tests */
export function freeSpinsAwardedForScatterCount(count: number): number {
  if (count >= 5) {
    return FREE_SPINS_FOR_SCATTER[5]!;
  }
  if (count === 4) {
    return FREE_SPINS_FOR_SCATTER[4]!;
  }
  if (count === 3) {
    return FREE_SPINS_FOR_SCATTER[3]!;
  }
  return 0;
}
