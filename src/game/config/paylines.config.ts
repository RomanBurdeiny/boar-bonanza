/** 10 paylines: index = payline id, each entry is row index per reel (0 top, 2 bottom) */
export const PAYLINES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 2],
];

export const PAYLINE_COUNT = PAYLINES.length;
