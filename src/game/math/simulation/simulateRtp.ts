import { SpinEngine, type SpinContext } from '../../domain/services/SpinEngine';
import type { IRng } from '../rng/IRng';

export interface RtpBatchResult {
  spins: number;
  totalBet: number;
  totalWin: number;
  rtp: number;
  avgWinPerSpin: number;
  hitFrequency: number;
  bonusTriggerFrequency: number;
}

export function simulateRtp(rng: IRng, spins: number, bet: number, startBalance: number): RtpBatchResult {
  const engine = new SpinEngine();
  let balance = startBalance;
  let totalBet = 0;
  let totalWin = 0;
  let hits = 0;
  let bonusTriggers = 0;

  let bonus = { freeSpins: null as { remaining: number; betPerRound: number } | null };

  for (let i = 0; i < spins; i++) {
    const freeRem = bonus.freeSpins?.remaining ?? 0;
    const isFree = freeRem > 0;
    if (!isFree) {
      if (balance < bet) {
        break;
      }
      totalBet += bet;
    }

    const ctx: SpinContext = {
      balance,
      bet,
      bonus: { freeSpins: bonus.freeSpins },
      rng,
    };

    const { result, nextBonus } = engine.run(ctx);
    balance = result.balanceAfter;
    totalWin += result.totalWin;
    if (result.totalWin > 0) {
      hits++;
    }
    if (result.triggeredFeatures.includes('FREE_SPINS')) {
      bonusTriggers++;
    }
    bonus = nextBonus;
  }

  const used = totalBet > 0 ? totalBet : 1;
  return {
    spins,
    totalBet,
    totalWin,
    rtp: totalWin / used,
    avgWinPerSpin: totalWin / spins,
    hitFrequency: hits / spins,
    bonusTriggerFrequency: bonusTriggers / spins,
  };
}
