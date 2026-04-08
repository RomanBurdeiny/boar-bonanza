/** Distinct color per payline — keeps core visible against dark backgrounds */
export const PAYLINE_COLORS: readonly number[] = [
  0xffe060, // 0 — gold
  0xff5858, // 1 — red
  0x50d868, // 2 — green
  0x58b8ff, // 3 — sky blue
  0xff8838, // 4 — orange
  0xc878ff, // 5 — violet
  0x50ffe8, // 6 — cyan
  0xff70b0, // 7 — pink
  0xb0ff50, // 8 — lime
  0xf0f0f0, // 9 — white
] as const;

export function paylineColor(index: number): number {
  return PAYLINE_COLORS[index % PAYLINE_COLORS.length]!;
}
