import { BetEngine } from '../../domain/services/BetEngine';
import type { IRng } from '../../math/rng/IRng';
import { EventBus } from '../events/eventBus';
import {
  GAME_EVENT,
  type BalanceUpdatedPayload,
  type ErrorPayload,
  type SpinResultPayload,
  type StateChangedPayload,
} from '../events/gameEvents';
import { GameStateMachine } from '../state/stateMachine';
import type { GameStore } from '../store/gameStore';
import { SpinController } from './SpinController';

export class GameController {
  readonly spin: SpinController;
  private readonly fsm = new GameStateMachine();
  private readonly bets = new BetEngine();

  private rngFactory: () => IRng;

  constructor(
    private readonly store: GameStore,
    private readonly bus: EventBus,
    rngFactory: () => IRng,
  ) {
    this.spin = new SpinController(store);
    this.rngFactory = rngFactory;
  }

  private emitState(prev: StateChangedPayload['previous'], next: StateChangedPayload['next']): void {
    this.bus.emit<StateChangedPayload>(GAME_EVENT.STATE_CHANGED, { previous: prev, next });
  }

  requestSpin(): boolean {
    const prevFsm = this.fsm.getState();
    if (prevFsm !== 'IDLE') {
      return false;
    }

    const gate = this.spin.canSpin();
    if (!gate.ok) {
      this.store.setError(gate.reason ?? '');
      this.bus.emit<ErrorPayload>(GAME_EVENT.ERROR, { message: gate.reason ?? '' });
      return false;
    }

    this.fsm.transition('SPIN_REQUESTED') || this.fsm.force('SPIN_REQUESTED');
    this.emitState(prevFsm, 'SPIN_REQUESTED');

    this.fsm.transition('SPINNING') || this.fsm.force('SPINNING');
    this.store.setUiState('SPINNING');
    this.emitState('SPIN_REQUESTED', 'SPINNING');

    const outcome = this.spin.trySpin(this.rngFactory());

    if (!outcome.ok) {
      this.store.setError(outcome.reason);
      this.bus.emit<ErrorPayload>(GAME_EVENT.ERROR, { message: outcome.reason });
      this.fsm.force('IDLE');
      this.store.setUiState('IDLE');
      return false;
    }

    const result = this.store.getSnapshot().lastResult;
    if (!result) {
      throw new Error('spin result missing');
    }

    this.fsm.transition('RESULT_READY') || this.fsm.force('RESULT_READY');
    this.store.setUiState('RESULT_READY');
    this.emitState('SPINNING', 'RESULT_READY');

    this.bus.emit<SpinResultPayload>(GAME_EVENT.SPIN_RESULT, { result });
    this.bus.emit<BalanceUpdatedPayload>(GAME_EVENT.BALANCE_UPDATED, { balance: result.balanceAfter });

    if (result.totalWin > 0) {
      this.fsm.transition('WIN_PRESENTATION') || this.fsm.force('WIN_PRESENTATION');
      this.store.setUiState('WIN_PRESENTATION');
    }
    if (result.triggeredFeatures.length > 0) {
      this.fsm.transition('FEATURE_TRIGGERED') || this.fsm.force('FEATURE_TRIGGERED');
      this.store.setUiState('FEATURE_TRIGGERED');
    }
    return true;
  }

  completePresentation(): void {
    const prev = this.fsm.getState();
    if (prev !== 'RESULT_READY' && prev !== 'WIN_PRESENTATION' && prev !== 'FEATURE_TRIGGERED') {
      return;
    }
    this.fsm.force('IDLE');
    this.store.setUiState('IDLE');
    this.emitState(prev, 'IDLE');
  }

  getFsmState() {
    return this.fsm.getState();
  }

  nudgeBet(delta: 1 | -1): void {
    if (this.fsm.getState() !== 'IDLE') {
      return;
    }
    const snap = this.store.getSnapshot();
    const next = delta > 0 ? this.bets.increase(snap.bet) : this.bets.decrease(snap.bet);
    this.store.setBet(next);
  }
}
