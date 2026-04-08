export function sum(values: readonly number[]): number {
  let s = 0;
  for (const v of values) {
    s += v;
  }
  return s;
}
