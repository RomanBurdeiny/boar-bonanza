export class BalanceEngine {
  applySpin(balance: number, totalBet: number, totalWin: number): number {
    return balance - totalBet + totalWin;
  }

  applyFreeSpinWin(balance: number, totalWin: number): number {
    return balance + totalWin;
  }
}
