import type { SymbolId } from '../enums/SymbolId';

export interface ReelStop {
  reelIndex: number;
  stripOffset: number;
  visible: readonly [SymbolId, SymbolId, SymbolId];
}
