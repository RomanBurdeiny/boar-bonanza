import type { IRng } from './IRng';

export class MathRandomRng implements IRng {
  next(): number {
    return Math.random();
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}
