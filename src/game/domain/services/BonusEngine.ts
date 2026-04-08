import { SCATTER_SYMBOL } from '../../config/symbols.config';
import type { SymbolId } from '../enums/SymbolId';

export class BonusEngine {
  countScatters(grid: SymbolId[][]): number {
    let n = 0;
    for (const col of grid) {
      for (const s of col) {
        if (s === SCATTER_SYMBOL) {
          n++;
        }
      }
    }
    return n;
  }

  /** Reels that show at least one scatter in the 3×5 window */
  countReelsWithScatter(grid: SymbolId[][]): number {
    let reels = 0;
    for (const col of grid) {
      if (col.some((s) => s === SCATTER_SYMBOL)) {
        reels++;
      }
    }
    return reels;
  }
}
