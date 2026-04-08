import { BONUS_SYMBOL, SCATTER_SYMBOL, WILD_SYMBOL } from '../../config/symbols.config';
import type { SymbolId } from '../enums/SymbolId';

export function isScatter(id: SymbolId): boolean {
  return id === SCATTER_SYMBOL;
}

export function isBonusSymbol(id: SymbolId): boolean {
  return id === BONUS_SYMBOL;
}

export function isWild(id: SymbolId): boolean {
  return id === WILD_SYMBOL;
}

/** Symbols that can form line-of-a-kind wins */
export function breaksLineWin(id: SymbolId): boolean {
  return isScatter(id) || isBonusSymbol(id);
}
