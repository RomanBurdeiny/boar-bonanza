import { PAYTABLE } from '../../config/paytable.config';
import type { SymbolId } from '../enums/SymbolId';

export function linePayMultiplier(symbol: SymbolId, ofKind: 3 | 4 | 5): number | undefined {
  const row = PAYTABLE[symbol];
  if (!row) {
    return undefined;
  }
  return row[ofKind];
}
