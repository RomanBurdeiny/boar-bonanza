/** Abstraction for all game randomness — UI never implements this */
export interface IRng {
  /** [0, 1) */
  next(): number;
  /** Inclusive min, inclusive max integers */
  nextInt(min: number, max: number): number;
}
