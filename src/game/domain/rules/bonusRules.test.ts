import { describe, expect, it } from 'vitest';
import {
  freeSpinsAwardedForScatterCount,
  freeSpinsAwardedForScatterReels,
  scatterReelsAwardFreeSpins,
} from './bonusRules';

describe('bonusRules', () => {
  it('free spins require 3+ reels with scatter, not only symbol count', () => {
    expect(scatterReelsAwardFreeSpins(2)).toBe(false);
    expect(scatterReelsAwardFreeSpins(3)).toBe(true);
  });

  it('bonus grants use reel count so stacked symbols do not inflate tier', () => {
    expect(freeSpinsAwardedForScatterReels(3)).toBe(8);
    expect(freeSpinsAwardedForScatterReels(4)).toBe(12);
    expect(freeSpinsAwardedForScatterReels(5)).toBe(18);
    expect(freeSpinsAwardedForScatterReels(2)).toBe(0);
  });

  it('legacy symbol-count tiers still monotonic (paytable / tools)', () => {
    expect(freeSpinsAwardedForScatterCount(3)).toBeGreaterThan(0);
    expect(freeSpinsAwardedForScatterCount(5)).toBeGreaterThanOrEqual(freeSpinsAwardedForScatterCount(4));
  });
});
