import type { FeatureType } from '../enums/FeatureType';
import type { SymbolId } from '../enums/SymbolId';
import type { Win } from './payout.types';

export interface SpinResult {
  grid: SymbolId[][];
  totalBet: number;
  totalWin: number;
  wins: Win[];
  triggeredFeatures: FeatureType[];
  balanceBefore: number;
  balanceAfter: number;
  /** Spins added this round when `FREE_SPINS` triggered (presentation / UX) */
  freeSpinsGranted?: number;
}
