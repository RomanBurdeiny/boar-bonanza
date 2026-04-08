import type { GameState } from '../../domain/enums/GameState';

const transitions: Record<GameState, ReadonlySet<GameState>> = {
  IDLE: new Set(['SPIN_REQUESTED', 'ERROR']),
  SPIN_REQUESTED: new Set(['SPINNING', 'ERROR']),
  SPINNING: new Set(['RESULT_READY', 'ERROR']),
  RESULT_READY: new Set(['WIN_PRESENTATION', 'FEATURE_TRIGGERED', 'IDLE', 'ERROR']),
  WIN_PRESENTATION: new Set(['FEATURE_TRIGGERED', 'IDLE', 'ERROR']),
  FEATURE_TRIGGERED: new Set(['IDLE', 'RESULT_READY', 'ERROR']),
  ERROR: new Set(['IDLE']),
};

export class GameStateMachine {
  private state: GameState = 'IDLE';

  getState(): GameState {
    return this.state;
  }

  transition(next: GameState): boolean {
    const allowed = transitions[this.state];
    if (!allowed?.has(next)) {
      return false;
    }
    this.state = next;
    return true;
  }

  force(next: GameState): void {
    this.state = next;
  }
}
