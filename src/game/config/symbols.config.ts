import type { SymbolId } from '../domain/enums/SymbolId';

export const LINE_PAY_SYMBOLS: ReadonlySet<SymbolId> = new Set([
  'BOAR_KING',
  'BOAR_HUNTER',
  'BIG_BOAR',
  'WILD_PIGLET',
  'ACORN',
  'MUSHROOM',
  'FOREST_LEAF',
]);

export const SCATTER_SYMBOL: SymbolId = 'SCATTER_FIRE';

export const BONUS_SYMBOL: SymbolId = 'BONUS_TUSK';

export const WILD_SYMBOL: SymbolId = 'WILD_PIGLET';
