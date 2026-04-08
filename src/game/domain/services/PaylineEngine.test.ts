import { describe, expect, it } from 'vitest';
import { PAYLINES } from '../../config/paylines.config';
import { evaluatePayline } from './PaylineEngine';

function gridFromColumns(cols: string[][]): import('../enums/SymbolId').SymbolId[][] {
  return cols as import('../enums/SymbolId').SymbolId[][];
}

describe('PaylineEngine', () => {
  it('detects 5 oak on middle row with wild prefix', () => {
    const g = gridFromColumns([
      ['MUSHROOM', 'WILD_PIGLET', 'ACORN'],
      ['MUSHROOM', 'WILD_PIGLET', 'ACORN'],
      ['MUSHROOM', 'ACORN', 'BIG_BOAR'],
      ['MUSHROOM', 'ACORN', 'BIG_BOAR'],
      ['BIG_BOAR', 'ACORN', 'BOAR_KING'],
    ]);
    const ev = evaluatePayline(g, 0, PAYLINES[0]!);
    expect(ev?.symbol).toBe('ACORN');
    expect(ev?.count).toBe(5);
  });

  it('all wild pays wild symbol', () => {
    const g = gridFromColumns([
      ['ACORN', 'WILD_PIGLET', 'MUSHROOM'],
      ['ACORN', 'WILD_PIGLET', 'MUSHROOM'],
      ['ACORN', 'WILD_PIGLET', 'MUSHROOM'],
      ['ACORN', 'WILD_PIGLET', 'MUSHROOM'],
      ['ACORN', 'WILD_PIGLET', 'MUSHROOM'],
    ]);
    const ev = evaluatePayline(g, 0, PAYLINES[0]!);
    expect(ev?.symbol).toBe('WILD_PIGLET');
    expect(ev?.count).toBe(5);
  });
});
