import { BALANCE_CONFIG } from '../../config/balance.config';

export class BetEngine {
  increase(current: number): number {
    return Math.min(BALANCE_CONFIG.maxBet, current + BALANCE_CONFIG.betStep);
  }

  decrease(current: number): number {
    return Math.max(BALANCE_CONFIG.minBet, current - BALANCE_CONFIG.betStep);
  }

  isValidBet(bet: number): boolean {
    return bet >= BALANCE_CONFIG.minBet && bet <= BALANCE_CONFIG.maxBet;
  }
}
