import type { IRng } from './IRng';

/** Mulberry32 — deterministic for tests and RTP batches */
export class SeededRng implements IRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    return this.nextInt(0, 0xffffffff) / 0x100000000;
  }

  nextInt(min: number, max: number): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const u = ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
    return min + Math.floor(u * (max - min + 1));
  }
}
