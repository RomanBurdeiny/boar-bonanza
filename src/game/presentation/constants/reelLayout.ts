export const REEL_LAYOUT = {
  cellW: 96,
  cellH: 88,
  gap: 6,
  padX: 6,
  reelSpacing: 12,
} as const;

export const STRIDE = REEL_LAYOUT.cellH + REEL_LAYOUT.gap;

export const SYMBOL_BLOCK_TOP = REEL_LAYOUT.gap;

export const VIEWPORT_H = 3 * REEL_LAYOUT.cellH + 2 * REEL_LAYOUT.gap;

export const REEL_VIEW_WIDTH = REEL_LAYOUT.padX * 2 + REEL_LAYOUT.cellW;
export const REEL_VIEW_HEIGHT = VIEWPORT_H + REEL_LAYOUT.gap * 2;

export function cellCenterLocal(row: number): { x: number; y: number } {
  const x = REEL_LAYOUT.padX + REEL_LAYOUT.cellW / 2;
  const y = SYMBOL_BLOCK_TOP + row * STRIDE + REEL_LAYOUT.cellH / 2;
  return { x, y };
}
