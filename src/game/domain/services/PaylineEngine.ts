import { WILD_SYMBOL } from '../../config/symbols.config';
import type { PaylineDef } from '../entities/Payline';
import type { SymbolId } from '../enums/SymbolId';
import { breaksLineWin, isWild } from '../rules/symbolRules';

export interface LineWinEval {
  symbol: SymbolId;
  count: 3 | 4 | 5;
  positions: ReadonlyArray<{ reel: number; row: number }>;
}

/** grid[reel][row], row 0 top */
export function symbolsOnPayline(grid: SymbolId[][], def: PaylineDef): SymbolId[] {
  return def.map((row, reel) => {
    const col = grid[reel];
    if (!col) {
      throw new Error(`missing reel ${reel}`);
    }
    const s = col[row];
    if (!s) {
      throw new Error(`missing cell ${reel},${row}`);
    }
    return s;
  });
}

/**
 * Left-to-right; wild substitutes; scatter/bonus stop the run.
 * All-wild pays as `WILD_SYMBOL` line.
 */
export function evaluatePayline(grid: SymbolId[][], _paylineIndex: number, def: PaylineDef): LineWinEval | null {
  const line = symbolsOnPayline(grid, def);
  const positions: { reel: number; row: number }[] = [];

  let base: SymbolId | undefined;
  let run = 0;

  for (let reel = 0; reel < 5; reel++) {
    const row = def[reel]!;
    const s = line[reel]!;

    if (breaksLineWin(s)) {
      break;
    }

    if (base === undefined) {
      if (isWild(s)) {
        run++;
        positions.push({ reel, row });
        continue;
      }
      base = s;
      run++;
      positions.push({ reel, row });
      continue;
    }

    if (isWild(s) || s === base) {
      run++;
      positions.push({ reel, row });
      continue;
    }
    break;
  }

  if (run < 3) {
    return null;
  }

  const of: 3 | 4 | 5 = run >= 5 ? 5 : run >= 4 ? 4 : 3;
  const paySymbol = base ?? WILD_SYMBOL;
  return { symbol: paySymbol, count: of, positions: positions.slice(0, run) };
}
