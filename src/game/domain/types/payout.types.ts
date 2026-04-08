import type { SymbolId } from '../enums/SymbolId';
import type { WinType } from '../enums/WinType';

export interface Win {
  paylineIndex?: number;
  symbol: SymbolId;
  count: number;
  amount: number;
  positions: ReadonlyArray<{ reel: number; row: number }>;
  type: WinType;
}
