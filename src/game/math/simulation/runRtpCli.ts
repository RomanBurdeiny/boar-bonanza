import { BALANCE_CONFIG } from '../../config/balance.config';
import { SeededRng } from '../rng/SeededRng';
import { simulateRtp } from './simulateRtp';

const spins = Number(process.argv[2] ?? 100_000);
const seed = Number(process.argv[3] ?? 42);
const bet = Number(process.argv[4] ?? 10);

const rng = new SeededRng(seed >>> 0);
const r = simulateRtp(rng, spins, bet, BALANCE_CONFIG.startingBalance);

console.log(JSON.stringify(r, null, 2));
