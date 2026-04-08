import type { SymbolId } from '../enums/SymbolId';

/** Domain wrapper when a reel cell needs identity beyond plain SymbolId */
export interface SymbolCell {
  id: SymbolId;
}
