import { describe, expect, it } from 'vitest';
import { SeededRng } from './SeededRng';

describe('SeededRng', () => {
  it('is deterministic for same seed', () => {
    const a = new SeededRng(12345);
    const b = new SeededRng(12345);
    for (let i = 0; i < 20; i++) {
      expect(a.next()).toBe(b.next());
    }
  });
});
