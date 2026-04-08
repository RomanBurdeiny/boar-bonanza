export interface FreeSpinsState {
  remaining: number;
  /** Bet locked for free rounds */
  betPerRound: number;
}

export interface BonusState {
  freeSpins: FreeSpinsState | null;
}
