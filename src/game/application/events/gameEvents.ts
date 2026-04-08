import type { SpinResult } from '../../domain/types/spin.types';

export const GAME_EVENT = {
  SPIN_RESULT: 'game:spinResult',
  BALANCE_UPDATED: 'game:balanceUpdated',
  STATE_CHANGED: 'game:stateChanged',
  ERROR: 'game:error',
} as const;

export interface SpinResultPayload {
  result: SpinResult;
}

export interface BalanceUpdatedPayload {
  balance: number;
}

export interface StateChangedPayload {
  previous: string;
  next: string;
}

export interface ErrorPayload {
  message: string;
}
