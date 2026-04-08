import type { SymbolId } from '../../domain/enums/SymbolId';

export type SymbolRarity = 'low' | 'mid' | 'high' | 'special';

export function symbolRarity(id: SymbolId): SymbolRarity {
  switch (id) {
    case 'BOAR_KING':
      return 'high';
    case 'BOAR_HUNTER':
    case 'BIG_BOAR':
      return 'mid';
    case 'WILD_PIGLET':
    case 'SCATTER_FIRE':
    case 'BONUS_TUSK':
      return 'special';
    default:
      return 'low';
  }
}
