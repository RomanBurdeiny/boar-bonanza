import { Container, Graphics, Ticker } from 'pixi.js';
import { TIMINGS_MS } from '../../../shared/constants/timings';
import type { SymbolId } from '../../domain/enums/SymbolId';
import {
  REEL_LAYOUT,
  REEL_VIEW_HEIGHT,
  REEL_VIEW_WIDTH,
  STRIDE,
  SYMBOL_BLOCK_TOP,
  VIEWPORT_H,
  cellCenterLocal,
} from '../constants/reelLayout';
import { uiConfig } from '../../../app/config/uiConfig';
import { spinScrollEase01 } from '../utils/easing';
import { SymbolView } from './SymbolView';

export { REEL_VIEW_WIDTH, REEL_VIEW_HEIGHT };

const POOL = 7;
const STREAM_TAIL_PAD = 40;

export class ReelView extends Container {
  private readonly reelIndex: number;
  private readonly reelStrip: readonly SymbolId[];
  private readonly clipMask: Graphics;
  private readonly moving: Container;
  private readonly cells: SymbolView[] = [];
  private stream: SymbolId[] = [];
  private streamStopIndex = 0;
  private running = false;
  private activeDriver: ((t: Ticker) => void) | null = null;

  constructor(reelIndex: number, reelStrip: readonly SymbolId[]) {
    super();
    this.reelIndex = reelIndex;
    this.reelStrip = reelStrip;

    const chassis = new Graphics();
    chassis.roundRect(0, 0, REEL_VIEW_WIDTH, REEL_VIEW_HEIGHT, 11);
    chassis.fill({ color: uiConfig.colors.cabinetWell });
    chassis.stroke({ width: 2, color: uiConfig.colors.cabinetRim });
    this.addChild(chassis);

    const bezelHi = new Graphics();
    bezelHi.roundRect(1, 1, REEL_VIEW_WIDTH - 2, REEL_VIEW_HEIGHT - 2, 9);
    bezelHi.stroke({ width: 1, color: 0x6a5a48, alpha: 0.35 });
    this.addChild(bezelHi);

    const mx = REEL_LAYOUT.padX - 2;
    const my = SYMBOL_BLOCK_TOP - 2;
    const mw = REEL_LAYOUT.cellW + 4;
    const mh = VIEWPORT_H + 4;
    this.clipMask = new Graphics();
    this.clipMask.rect(mx, my, mw, mh);
    this.clipMask.fill({ color: 0xffffff, alpha: 1 });
    this.addChild(this.clipMask);

    this.moving = new Container();
    this.moving.mask = this.clipMask;
    this.addChild(this.moving);

    const shadeT = new Graphics();
    shadeT.rect(mx, my, mw, 16);
    shadeT.fill({ color: 0x000000, alpha: 0.32 });
    this.addChild(shadeT);

    const shadeB = new Graphics();
    shadeB.rect(mx, my + mh - 14, mw, 14);
    shadeB.fill({ color: 0x000000, alpha: 0.42 });
    this.addChild(shadeB);

    for (let i = 0; i < POOL; i++) {
      const c = new SymbolView();
      c.position.set(REEL_LAYOUT.padX, SYMBOL_BLOCK_TOP + i * STRIDE);
      this.cells.push(c);
      this.moving.addChild(c);
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getCellCenter(row: number): { x: number; y: number } {
    const local = cellCenterLocal(row);
    return { x: this.x + local.x, y: this.y + local.y };
  }

  setStrip(column: SymbolId[]): void {
    if (column.length !== 3) {
      throw new Error('need 3 symbols');
    }
    this.clearSpinDriver();
    this.streamStopIndex = 0;
    this.moving.position.set(0, 0);
    this.stream = buildIdleStream(column);
    this.forceSyncAllCells(0);
    for (let r = 0; r < 3; r++) {
      const sym = column[r];
      const cell = this.cells[r];
      if (sym && cell) {
        cell.setSymbol(sym);
        cell.clearWinTint();
        cell.setDimmed(false);
      }
    }
    for (let i = 3; i < POOL; i++) {
      this.cells[i]?.clearWinTint();
      this.cells[i]?.setDimmed(false);
    }
  }

  async playSpin(column: SymbolId[], delayStartMs: number, durationMs: number): Promise<void> {
    this.running = true;
    this.clearSpinDriver();
    await sleep(delayStartMs);

    const oldTriple: SymbolId[] = [];
    for (let i = 0; i < 3; i++) {
      oldTriple.push(this.stream[i] ?? column[0]!);
    }
    const seed = hashSymbolId(column[0]!) + this.reelIndex * 17;
    const J = 14 + this.reelIndex * 2 + (seed % 6);
    const fillers: SymbolId[] = [];
    const fillerCount = Math.max(0, J - 3);
    for (let i = 0; i < fillerCount; i++) {
      fillers.push(this.stripPick(seed + i * 31));
    }
    const tail: SymbolId[] = [column[2]!, column[0]!, column[1]!];
    const padding: SymbolId[] = [];
    for (let i = 0; i < STREAM_TAIL_PAD; i++) {
      padding.push(this.stripPick(seed + 500 + i * 7));
    }
    this.stream = [...oldTriple, ...fillers, ...column, ...tail, ...padding];
    this.streamStopIndex = 0;
    this.moving.position.set(0, 0);
    this.forceSyncAllCells(0);

    const start = performance.now();

    return new Promise((resolve) => {
      const finish = (finalJ: number): void => {
        this.clearSpinDriver();
        this.streamStopIndex = finalJ;
        this.moving.position.set(0, 0);
        this.forceSyncAllCells(finalJ);
        void this.finishBounce().then(() => {
          this.normalizeToColumn(column);
          this.running = false;
          resolve();
        });
      };

      let finished = false;
      const driver = (_ticker: Ticker): void => {
        if (finished) {
          return;
        }
        const elapsed = performance.now() - start;
        const tn = Math.min(1, elapsed / durationMs);
        if (tn >= 1) {
          finished = true;
          finish(J);
          return;
        }
        const p = spinScrollEase01(tn);
        const progress = Math.min(J, p * J);
        const baseIdx = Math.min(J, Math.floor(progress));
        let intra = progress - baseIdx;
        if (baseIdx >= J - 1 && J > 0) {
          intra = Math.min(intra, 0.91);
        }
        this.streamStopIndex = baseIdx;
        this.moving.position.y = -intra * STRIDE;
        this.forceSyncAllCells(baseIdx);
      };

      this.activeDriver = driver;
      Ticker.shared.add(driver);
    });
  }

  private clearSpinDriver(): void {
    if (this.activeDriver) {
      Ticker.shared.remove(this.activeDriver);
      this.activeDriver = null;
    }
  }

  private forceSyncAllCells(base: number): void {
    for (let i = 0; i < POOL; i++) {
      const id = this.safeStreamAt(base + i);
      this.cells[i]?.setSymbolForce(id);
    }
  }

  private safeStreamAt(idx: number): SymbolId {
    if (this.stream.length === 0) {
      return 'ACORN';
    }
    if (idx < 0) {
      return this.stream[0]!;
    }
    if (idx >= this.stream.length) {
      return this.stream[this.stream.length - 1]!;
    }
    return this.stream[idx]!;
  }

  private normalizeToColumn(column: SymbolId[]): void {
    this.streamStopIndex = 0;
    this.moving.position.set(0, 0);
    this.setStrip(column);
  }

  private async finishBounce(): Promise<void> {
    const amp = 6;
    const dur = TIMINGS_MS.reelBounceMs;
    const t0 = performance.now();
    const holdBase = this.streamStopIndex;
    await new Promise<void>((r) => {
      const step = (): void => {
        const u = Math.min(1, (performance.now() - t0) / dur);
        const bounceY = Math.sin(u * Math.PI) * amp * (1 - u);
        this.moving.position.y = bounceY;
        this.forceSyncAllCells(holdBase);
        if (u < 1) {
          requestAnimationFrame(step);
        } else {
          this.moving.position.y = 0;
          r();
        }
      };
      requestAnimationFrame(step);
    });
  }

  private stripPick(seed: number): SymbolId {
    const s = this.reelStrip;
    if (s.length === 0) {
      return 'ACORN';
    }
    const i = Math.abs(seed) % s.length;
    return s[i]!;
  }

  highlightPositions(rows: ReadonlySet<number>, win: boolean): void {
    for (let r = 0; r < 3; r++) {
      const cell = this.cells[r];
      if (!cell) {
        continue;
      }
      if (rows.has(r) && win) {
        cell.flashWin();
      } else if (win) {
        cell.setDimmed(true);
      }
    }
  }

  clearHighlight(): void {
    for (const c of this.cells) {
      c.clearWinTint();
      c.setDimmed(false);
    }
  }

  pulseScatterRows(rows: ReadonlySet<number>): void {
    for (let r = 0; r < 3; r++) {
      if (rows.has(r)) {
        this.cells[r]?.flashWin();
      }
    }
  }
}

function buildIdleStream(column: SymbolId[]): SymbolId[] {
  const a = column[0]!;
  const b = column[1]!;
  const c = column[2]!;
  return [a, b, c, c, c, c, c];
}

function hashSymbolId(id: SymbolId): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i)! * (i + 1)) | 0;
  }
  return Math.abs(h);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}