import type { IRng } from '../rng/IRng';

export function weightedPick<T>(rng: IRng, items: readonly { value: T; weight: number }[]): T {
  const total = items.reduce((a, i) => a + i.weight, 0);
  if (total <= 0) {
    throw new Error('weightedPick: non-positive total weight');
  }
  let r = rng.next() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) {
      return it.value;
    }
  }
  return items[items.length - 1]!.value;
}
