import { BetEngine } from '../../domain/services/BetEngine';
import { SpinEngine, type SpinContext } from '../../domain/services/SpinEngine';
import type { GameStore } from '../store/gameStore';
import { selectCanSpin } from '../store/selectors';

export interface SpinGate {
  ok: boolean;
  reason?: string;
}

export class SpinController {
  private readonly bets = new BetEngine();
  private readonly engine = new SpinEngine();

  constructor(private readonly store: GameStore) {}

  canSpin(): SpinGate {
    const s = this.store.getSnapshot();
    if (!this.bets.isValidBet(s.bet)) {
      return { ok: false, reason: 'Invalid bet' };
    }
    if (!selectCanSpin(s)) {
      return { ok: false, reason: 'Insufficient balance' };
    }
    return { ok: true };
  }

  trySpin(rng: import('../../math/rng/IRng').IRng): { ok: true } | { ok: false; reason: string } {
    const gate = this.canSpin();
    if (!gate.ok) {
      return { ok: false, reason: gate.reason ?? 'Cannot spin' };
    }

    const s = this.store.getSnapshot();
    const ctx: SpinContext = {
      balance: s.balance,
      bet: s.bet,
      bonus: s.bonus,
      rng,
    };

    try {
      const { result, nextBonus } = this.engine.run(ctx);
      this.store.applySpinCommit(result, nextBonus);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Spin failed';
      return { ok: false, reason: msg };
    }
  }
}
