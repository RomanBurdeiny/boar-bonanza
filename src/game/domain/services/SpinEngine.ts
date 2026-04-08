import { scatterReelsAwardFreeSpins, freeSpinsAwardedForScatterReels } from '../rules/bonusRules';
import type { FeatureType } from '../enums/FeatureType';
import type { BonusState } from '../types/bonus.types';
import type { SpinResult } from '../types/spin.types';
import type { IRng } from '../../math/rng/IRng';
import { sum } from '../../math/helpers/sum';
import { BalanceEngine } from './BalanceEngine';
import { BonusEngine } from './BonusEngine';
import { PayoutEngine } from './PayoutEngine';
import { ReelEngine } from './ReelEngine';

const balanceEngine = new BalanceEngine();
const payoutEngine = new PayoutEngine();
const reelEngine = new ReelEngine();
const bonusEngine = new BonusEngine();

export interface SpinContext {
  balance: number;
  bet: number;
  bonus: BonusState;
  rng: IRng;
}

export interface SpinEngineResult {
  result: SpinResult;
  nextBonus: BonusState;
}

export class SpinEngine {
  run(ctx: SpinContext): SpinEngineResult {
    const prevFs = ctx.bonus.freeSpins;
    const prevRem = prevFs?.remaining ?? 0;
    const isFreeRound = prevRem > 0;
    const effectiveBet = isFreeRound ? prevFs!.betPerRound : ctx.bet;

    if (!isFreeRound && ctx.balance < ctx.bet) {
      throw new Error('insufficient balance');
    }
    if (isFreeRound && effectiveBet <= 0) {
      throw new Error('free spin bet not set');
    }

    const balanceBefore = ctx.balance;
    const { grid } = reelEngine.spin(ctx.rng);
    const wins = payoutEngine.evaluate(grid, effectiveBet);
    const lineAndScatterWin = sum(wins.map((w) => w.amount));

    const scatterReels = bonusEngine.countReelsWithScatter(grid);
    const triggeredFeatures: FeatureType[] = [];

    let rem = prevRem;
    let betPerRound = prevFs?.betPerRound ?? 0;

    if (isFreeRound) {
      rem -= 1;
    }

    let freeSpinsGranted = 0;
    if (scatterReelsAwardFreeSpins(scatterReels)) {
      freeSpinsGranted = freeSpinsAwardedForScatterReels(scatterReels);
      rem += freeSpinsGranted;
      triggeredFeatures.push('FREE_SPINS');
      if (!isFreeRound) {
        betPerRound = ctx.bet;
      } else if (betPerRound <= 0) {
        betPerRound = ctx.bet;
      }
    }

    const nextBonus: BonusState =
      rem <= 0
        ? { freeSpins: null }
        : { freeSpins: { remaining: rem, betPerRound: betPerRound > 0 ? betPerRound : ctx.bet } };

    const balanceAfter = isFreeRound
      ? balanceEngine.applyFreeSpinWin(balanceBefore, lineAndScatterWin)
      : balanceEngine.applySpin(balanceBefore, ctx.bet, lineAndScatterWin);

    const result: SpinResult = {
      grid,
      totalBet: isFreeRound ? 0 : ctx.bet,
      totalWin: lineAndScatterWin,
      wins,
      triggeredFeatures,
      balanceBefore,
      balanceAfter,
      ...(freeSpinsGranted > 0 ? { freeSpinsGranted } : {}),
    };

    return { result, nextBonus };
  }
}
