import type { GameSnapshot } from './gameStore';

export function selectCanSpin(s: GameSnapshot): boolean {
  const fs = s.bonus.freeSpins?.remaining ?? 0;
  if (fs > 0) {
    return true;
  }
  return s.balance >= s.bet;
}

export function selectInFreeSpins(s: GameSnapshot): boolean {
  return (s.bonus.freeSpins?.remaining ?? 0) > 0;
}
