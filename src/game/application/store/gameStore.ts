import { BALANCE_CONFIG } from '../../config/balance.config';
import type { GameState } from '../../domain/enums/GameState';
import type { BonusState } from '../../domain/types/bonus.types';
import type { SpinResult } from '../../domain/types/spin.types';

export interface GameSnapshot {
  balance: number;
  bet: number;
  uiState: GameState;
  bonus: BonusState;
  lastResult: SpinResult | null;
  error: string | null;
}

type Subscriber = () => void;

export class GameStore {
  private snapshot: GameSnapshot = {
    balance: BALANCE_CONFIG.startingBalance,
    bet: 10,
    uiState: 'IDLE',
    bonus: { freeSpins: null },
    lastResult: null,
    error: null,
  };

  private readonly subscribers = new Set<Subscriber>();

  getSnapshot(): GameSnapshot {
    return this.snapshot;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return (): void => {
      this.subscribers.delete(fn);
    };
  }

  private notify(): void {
    for (const s of this.subscribers) {
      s();
    }
  }

  setBalance(v: number): void {
    this.snapshot = { ...this.snapshot, balance: v };
    this.notify();
  }

  setBet(v: number): void {
    this.snapshot = { ...this.snapshot, bet: v };
    this.notify();
  }

  setUiState(s: GameState): void {
    this.snapshot = { ...this.snapshot, uiState: s };
    this.notify();
  }

  setBonus(b: BonusState): void {
    this.snapshot = { ...this.snapshot, bonus: b };
    this.notify();
  }

  setLastResult(r: SpinResult | null): void {
    this.snapshot = { ...this.snapshot, lastResult: r };
    this.notify();
  }

  setError(e: string | null): void {
    this.snapshot = { ...this.snapshot, error: e };
    this.notify();
  }

  applySpinCommit(result: SpinResult, bonus: BonusState): void {
    this.snapshot = {
      ...this.snapshot,
      balance: result.balanceAfter,
      lastResult: result,
      bonus,
      error: null,
    };
    this.notify();
  }
}
