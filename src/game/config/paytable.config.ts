import type { SymbolId } from '../domain/enums/SymbolId';

/** Multipliers × line bet for 3 / 4 / 5 of a kind on a payline */
export type PaySteps = { 3: number; 4: number; 5: number };

export const PAYTABLE: Partial<Record<SymbolId, PaySteps>> = {
  BOAR_KING: { 3: 50, 4: 150, 5: 500 },
  BOAR_HUNTER: { 3: 35, 4: 100, 5: 350 },
  BIG_BOAR: { 3: 25, 4: 70, 5: 200 },
  WILD_PIGLET: { 3: 40, 4: 120, 5: 400 },
  ACORN: { 3: 8, 4: 25, 5: 60 },
  MUSHROOM: { 3: 8, 4: 25, 5: 60 },
  FOREST_LEAF: { 3: 8, 4: 25, 5: 60 },
};

/** Scatter pay: multiplier × total bet for count 3 / 4 / 5+ */
export const SCATTER_PAY: Record<3 | 4 | 5, number> = {
  3: 3,
  4: 12,
  5: 60,
};
