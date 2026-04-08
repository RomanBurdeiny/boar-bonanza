import { REEL_LAYOUT, REEL_VIEW_HEIGHT, REEL_VIEW_WIDTH } from './reelLayout';

/** “Cabinet” chrome around reels — keeps math/layout in one place */
export const CABINET = {
  padX: 28,
  padY: 18,
  titleH: 44,
  innerPad: 14,
  rimStroke: 3,
} as const;

export function reelGridWidthPx(): number {
  return 5 * REEL_VIEW_WIDTH + 4 * REEL_LAYOUT.reelSpacing;
}

export function reelOrigin(): { x: number; y: number } {
  return {
    x: CABINET.padX + CABINET.innerPad,
    y: CABINET.padY + CABINET.titleH + CABINET.innerPad,
  };
}

export function slotBoardOuterSize(): { w: number; h: number } {
  const { x, y } = reelOrigin();
  const w = x * 2 + reelGridWidthPx();
  const h = y + REEL_VIEW_HEIGHT + CABINET.innerPad + CABINET.padY;
  return { w, h };
}
