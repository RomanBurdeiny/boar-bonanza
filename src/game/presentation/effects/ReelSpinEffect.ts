import type { SlotBoard } from '../components/SlotBoard';
import type { SymbolId } from '../../domain/enums/SymbolId';

export async function playReels(board: SlotBoard, grid: SymbolId[][]): Promise<void> {
  await board.playSpinSequence(grid);
}
