import { REEL_STRIPS } from '../../config/reels.config';
import type { IRng } from '../../math/rng/IRng';
import type { SymbolId } from '../enums/SymbolId';

export interface ReelSpinGrid {
  /** grid[reel][row] row 0 = top */
  grid: SymbolId[][];
  /** Start index on each reel strip (0-based) */
  stops: number[];
}

export class ReelEngine {
  spin(rng: IRng): ReelSpinGrid {
    const grid: SymbolId[][] = [];
    const stops: number[] = [];

    for (let reel = 0; reel < 5; reel++) {
      const strip = REEL_STRIPS[(reel + 1) as 1 | 2 | 3 | 4 | 5];
      const maxStart = strip.length - 3;
      const start = rng.nextInt(0, maxStart);
      stops.push(start);
      grid.push([strip[start]!, strip[start + 1]!, strip[start + 2]!]);
    }

    return { grid, stops };
  }
}
