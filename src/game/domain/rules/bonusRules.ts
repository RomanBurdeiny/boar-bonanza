import {
  freeSpinsAwardedForScatterCount,
  freeSpinsAwardedForScatterReels,
} from '../../config/bonus.config';

/**
 * Free spins: scatter must land on **≥3 different reels** (classic slot rule).
 * A single column can show at most 3 scatters, which would wrongly trigger every
 * feature if we only counted total symbols.
 *
 * Scatter **money** in `PayoutEngine` still uses total symbol count (3+ anywhere).
 */
export function scatterReelsAwardFreeSpins(reelsWithScatter: number): boolean {
  return reelsWithScatter >= 3;
}

export { freeSpinsAwardedForScatterCount, freeSpinsAwardedForScatterReels };
