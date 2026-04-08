import { describe, expect, it } from 'vitest';
import { PayoutEngine } from './PayoutEngine';

const engine = new PayoutEngine();

describe('PayoutEngine', () => {
  it('sums line and scatter', () => {
    const grid: import('../enums/SymbolId').SymbolId[][] = [
      ['SCATTER_FIRE', 'ACORN', 'MUSHROOM'],
      ['SCATTER_FIRE', 'ACORN', 'MUSHROOM'],
      ['SCATTER_FIRE', 'ACORN', 'MUSHROOM'],
      ['FOREST_LEAF', 'MUSHROOM', 'BIG_BOAR'],
      ['FOREST_LEAF', 'MUSHROOM', 'BIG_BOAR'],
    ];
    const wins = engine.evaluate(grid, 10);
    const scatter = wins.find((w) => w.type === 'scatter');
    expect(scatter).toBeDefined();
    expect(scatter!.amount).toBeGreaterThan(0);
  });
});
