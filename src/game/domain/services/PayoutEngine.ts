import { PAYLINE_COUNT, PAYLINES } from '../../config/paylines.config';
import { SCATTER_PAY } from '../../config/paytable.config';
import { SCATTER_SYMBOL } from '../../config/symbols.config';
import type { SymbolId } from '../enums/SymbolId';
import type { Win } from '../types/payout.types';
import { linePayMultiplier } from '../rules/payoutRules';
import { evaluatePayline } from './PaylineEngine';

export class PayoutEngine {
  evaluate(grid: SymbolId[][], totalBet: number): Win[] {
    const wins: Win[] = [];
    const lineBet = totalBet / PAYLINE_COUNT;

    for (let p = 0; p < PAYLINES.length; p++) {
      const def = PAYLINES[p]!;
      const ev = evaluatePayline(grid, p, def);
      if (!ev) {
        continue;
      }
      const mult = linePayMultiplier(ev.symbol, ev.count);
      if (mult === undefined) {
        continue;
      }
      const amount = mult * lineBet;
      wins.push({
        paylineIndex: p,
        symbol: ev.symbol,
        count: ev.count,
        amount,
        positions: ev.positions,
        type: 'line',
      });
    }

    wins.push(...scatterWins(grid, totalBet));

    return wins;
  }
}

function scatterWins(grid: SymbolId[][], totalBet: number): Win[] {
  const positions: { reel: number; row: number }[] = [];
  for (let reel = 0; reel < grid.length; reel++) {
    const col = grid[reel];
    if (!col) {
      continue;
    }
    for (let row = 0; row < col.length; row++) {
      if ( col[row] === SCATTER_SYMBOL) {
        positions.push({ reel, row });
      }
    }
  }
  const count = positions.length;
  if (count < 3) {
    return [];
  }
  const tier: 3 | 4 | 5 = count >= 5 ? 5 : count === 4 ? 4 : 3;
  const mult = SCATTER_PAY[tier];
  return [
    {
      symbol: SCATTER_SYMBOL,
      count,
      amount: mult * totalBet,
      positions,
      type: 'scatter',
    },
  ];
}
