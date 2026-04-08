import { Container, Graphics, Point, Text } from 'pixi.js';
import { PAYLINES } from '../../config/paylines.config';
import { REEL_STRIPS } from '../../config/reels.config';
import type { SymbolId } from '../../domain/enums/SymbolId';
import type { Win } from '../../domain/types/payout.types';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { TIMINGS_MS } from '../../../shared/constants/timings';
import { REEL_LAYOUT, VIEWPORT_H } from '../constants/reelLayout';
import { CABINET, reelOrigin, slotBoardOuterSize } from '../constants/slotCabinetLayout';
import { WinLineOverlay } from '../effects/WinLineOverlay';
import { REEL_VIEW_WIDTH, ReelView } from './ReelView';
import { uiConfig } from '../../../app/config/uiConfig';

export class SlotBoard extends Container {
  private readonly reels: ReelView[] = [];
  readonly lineOverlay: WinLineOverlay;
  private readonly cabinetArt: Graphics;
  private readonly title: Text;

  constructor() {
    super();
    this.sortableChildren = true;
    this.zIndex = Z_INDEX.slotBoard;

    const { w } = slotBoardOuterSize();
    this.cabinetArt = new Graphics();
    this.drawCabinetArt(false);
    this.addChild(this.cabinetArt);

    const { x: ox, y: oy } = reelOrigin();
    const vh = VIEWPORT_H;
    const gridW = 5 * REEL_VIEW_WIDTH + 4 * REEL_LAYOUT.reelSpacing;

    const well = new Graphics();
    const wellPad = 8;
    well.roundRect(ox - wellPad, oy - wellPad, gridW + wellPad * 2, vh + REEL_LAYOUT.gap * 2 + wellPad * 2, 10);
    well.fill({ color: 0x080604, alpha: 1 });
    well.stroke({ width: 1.5, color: 0x1a1610, alpha: 0.6 });
    well.roundRect(ox - wellPad + 2, oy - wellPad + 2, gridW + wellPad * 2 - 4, 8, 4);
    well.fill({ color: 0x000000, alpha: 0.35 });
    well.roundRect(ox - wellPad + 2, oy + vh + REEL_LAYOUT.gap * 2 + wellPad - 8, gridW + wellPad * 2 - 4, 6, 3);
    well.fill({ color: 0x2a2018, alpha: 0.2 });
    this.addChild(well);

    const sep = new Graphics();
    for (let i = 0; i < 4; i++) {
      const cx =
        ox +
        (i + 1) * REEL_VIEW_WIDTH +
        i * REEL_LAYOUT.reelSpacing +
        REEL_LAYOUT.reelSpacing / 2;
      sep.roundRect(cx - 1.5, oy + 6, 3, vh + 8, 2);
      sep.fill({ color: uiConfig.colors.reelSeparator, alpha: 0.22 });
    }
    this.addChild(sep);

    this.title = new Text({
      text: 'BOAR  BONANZA',
      style: {
        fill: 0xe8d8b8,
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 6,
        dropShadow: { blur: 3, color: 0x000000, alpha: 0.6, distance: 1 },
      },
    });
    this.title.anchor.set(0.5, 0);
    this.title.position.set(w / 2, CABINET.padY + 4);
    this.addChild(this.title);

    const titleDivider = new Graphics();
    const divW = gridW * 0.7;
    const divX = (w - divW) / 2;
    const divY = CABINET.padY + 30;
    titleDivider.rect(divX, divY, divW, 1);
    titleDivider.fill({ color: uiConfig.colors.cabinetRim, alpha: 0.4 });
    titleDivider.rect(divX + divW * 0.15, divY + 2, divW * 0.7, 1);
    titleDivider.fill({ color: uiConfig.colors.cabinetRim, alpha: 0.2 });
    this.addChild(titleDivider);

    let x = ox;
    const y = oy;
    for (let i = 0; i < 5; i++) {
      const strip = REEL_STRIPS[(i + 1) as keyof typeof REEL_STRIPS];
      const rv = new ReelView(i, strip);
      rv.zIndex = 0;
      rv.position.set(x, y);
      this.reels.push(rv);
      this.addChild(rv);
      x += REEL_VIEW_WIDTH + REEL_LAYOUT.reelSpacing;
    }

    this.lineOverlay = new WinLineOverlay();
    this.addChild(this.lineOverlay);
  }

  setFreeSpinsMode(active: boolean): void {
    this.drawCabinetArt(active);
    this.title.style.fill = active ? uiConfig.colors.bonusAccent : 0xd4c4a8;
  }

  private drawCabinetArt(bonus: boolean): void {
    const { w, h } = slotBoardOuterSize();
    const rim = bonus ? uiConfig.colors.bonusAccent : uiConfig.colors.cabinetRim;
    this.cabinetArt.clear();
    this.cabinetArt.roundRect(0, 0, w, h, 18);
    this.cabinetArt.fill({ color: uiConfig.colors.cabinetWood, alpha: 1 });
    this.cabinetArt.stroke({ width: CABINET.rimStroke, color: rim, alpha: bonus ? 0.95 : 1 });
    this.cabinetArt.roundRect(5, 5, w - 10, h - 10, 14);
    this.cabinetArt.stroke({
      width: 1,
      color: bonus ? 0xffc070 : 0x3a3028,
      alpha: bonus ? 0.4 : 0.85,
    });
  }

  getPaylinePolyline(paylineIndex: number): { x: number; y: number }[] {
    const def = PAYLINES[paylineIndex];
    if (!def) {
      return [];
    }
    const pts: { x: number; y: number }[] = [];
    for (let reel = 0; reel < 5; reel++) {
      const row = def[reel];
      const rv = this.reels[reel];
      if (row === undefined || !rv) {
        continue;
      }
      pts.push(rv.getCellCenter(row));
    }
    return pts;
  }

  setStaticGrid(grid: SymbolId[][]): void {
    for (let reel = 0; reel < 5; reel++) {
      const col = grid[reel];
      const rv = this.reels[reel];
      if (!col || col.length !== 3 || !rv) {
        continue;
      }
      rv.setStrip([col[0]!, col[1]!, col[2]!]);
    }
  }

  async playSpinSequence(grid: SymbolId[][]): Promise<void> {
    const tasks: Promise<void>[] = [];
    const base = TIMINGS_MS.reelSpinBaseDuration;
    for (let reel = 0; reel < 5; reel++) {
      const col = grid[reel];
      const rv = this.reels[reel];
      if (!col || !rv || col.length !== 3) {
        continue;
      }
      const stagger = reel * TIMINGS_MS.reelStaggerStart;
      const duration = base + reel * TIMINGS_MS.reelStaggerStop;
      const a = col[0];
      const b = col[1];
      const c = col[2];
      if (a === undefined || b === undefined || c === undefined) {
        continue;
      }
      tasks.push(rv.playSpin([a, b, c], stagger, duration));
    }
    await Promise.all(tasks);
  }

  presentLineWin(win: Win): void {
    for (const r of this.reels) {
      r.clearHighlight();
    }
    if (win.type !== 'line') {
      return;
    }
    const perReel = new Map<number, Set<number>>();
    for (const p of win.positions) {
      let s = perReel.get(p.reel);
      if (!s) {
        s = new Set();
        perReel.set(p.reel, s);
      }
      s.add(p.row);
    }
    for (let reel = 0; reel < 5; reel++) {
      const rv = this.reels[reel];
      if (!rv) {
        continue;
      }
      rv.highlightPositions(perReel.get(reel) ?? new Set(), true);
    }
  }

  presentAllWinMarks(wins: Win[]): void {
    for (const r of this.reels) {
      r.clearHighlight();
    }
    const perReelRows: Map<number, Set<number>> = new Map();
    for (const w of wins) {
      for (const p of w.positions) {
        let set = perReelRows.get(p.reel);
        if (!set) {
          set = new Set();
          perReelRows.set(p.reel, set);
        }
        set.add(p.row);
      }
    }
    for (let reel = 0; reel < 5; reel++) {
      const rv = this.reels[reel];
      if (!rv) {
        continue;
      }
      const rows = perReelRows.get(reel) ?? new Set();
      rv.highlightPositions(rows, wins.length > 0);
    }
  }

  scatterRowSets(wins: Win[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();
    for (const w of wins) {
      if (w.type !== 'scatter') {
        continue;
      }
      for (const p of w.positions) {
        let s = map.get(p.reel);
        if (!s) {
          s = new Set();
          map.set(p.reel, s);
        }
        s.add(p.row);
      }
    }
    return map;
  }

  pulseScatterPattern(scatterRows: Map<number, Set<number>>): void {
    scatterRows.forEach((rows, reel) => {
      this.reels[reel]?.pulseScatterRows(rows);
    });
  }

  clearWinFx(): void {
    for (const r of this.reels) {
      r.clearHighlight();
    }
    this.lineOverlay.clear();
  }

  getGlobalScatterCenters(wins: Win[]): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = [];
    for (const w of wins) {
      if (w.type !== 'scatter') {
        continue;
      }
      for (const p of w.positions) {
        const rv = this.reels[p.reel];
        if (!rv) {
          continue;
        }
        const l = rv.getCellCenter(p.row);
        const g = this.toGlobal(new Point(l.x, l.y));
        out.push({ x: g.x, y: g.y });
      }
    }
    return out;
  }
}
