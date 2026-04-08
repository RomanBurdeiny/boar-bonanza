export function isBigWin(totalWin: number, totalBet: number): boolean {
  if (totalBet <= 0) {
    return totalWin > 0;
  }
  return totalWin / totalBet >= 15;
}
