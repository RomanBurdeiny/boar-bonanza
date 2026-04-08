/** Spin progress 0…1: calm start, long linear “tape” middle, soft cubic settle */
export function spinScrollEase01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  if (x <= 0.14) {
    const u = x / 0.14;
    return u * u * u * 0.16;
  }
  if (x <= 0.78) {
    const u = (x - 0.14) / 0.64;
    return 0.16 + u * 0.74;
  }
  const u = (x - 0.78) / 0.22;
  const out = 1 - Math.pow(1 - u, 3);
  return 0.9 + out * 0.1;
}

export function easeOutCubic(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - u, 3);
}
