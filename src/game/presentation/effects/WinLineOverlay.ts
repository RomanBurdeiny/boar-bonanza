import { Container, Graphics, Ticker } from 'pixi.js';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { paylineColor } from '../constants/paylineColors';

/** Animated polyline with glow + core in a payline-specific color. */
export class WinLineOverlay extends Container {
  private readonly glow = new Graphics();
  private readonly core = new Graphics();
  private points: { x: number; y: number }[] = [];
  private lineColor = 0xffe060;
  private phase = 0;
  private active = false;
  private readonly tick = (t: Ticker): void => {
    if (!this.active || this.points.length < 2) {
      return;
    }
    this.phase += t.deltaMS * 0.004;
    this.redraw();
  };

  constructor() {
    super();
    this.zIndex = Z_INDEX.winLineOverlay;
    this.addChild(this.glow);
    this.addChild(this.core);
  }

  showPayline(paylineIndex: number, points: ReadonlyArray<{ x: number; y: number }>): void {
    this.lineColor = paylineColor(paylineIndex);
    this.points = points.slice();
    this.phase = 0;
    this.active = true;
    Ticker.shared.add(this.tick);
    this.redraw();
  }

  showPolyline(points: ReadonlyArray<{ x: number; y: number }>): void {
    this.showPayline(0, points);
  }

  clear(): void {
    this.active = false;
    Ticker.shared.remove(this.tick);
    this.points = [];
    this.glow.clear();
    this.core.clear();
  }

  private redraw(): void {
    const pts = this.points;
    this.glow.clear();
    this.core.clear();
    if (pts.length < 2) {
      return;
    }
    const wobble = 0.45 + Math.sin(this.phase * 8) * 0.12;
    const glowW = 10 + Math.sin(this.phase * 5) * 2.5;

    this.glow.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) {
      this.glow.lineTo(pts[i]!.x, pts[i]!.y);
    }
    this.glow.stroke({ width: glowW, color: this.lineColor, alpha: 0.18 * wobble });

    this.core.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) {
      this.core.lineTo(pts[i]!.x, pts[i]!.y);
    }
    this.core.stroke({ width: 3.4, color: this.lineColor, alpha: 0.92 });

    this.core.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) {
      this.core.lineTo(pts[i]!.x, pts[i]!.y);
    }
    this.core.stroke({ width: 1.2, color: 0xffffff, alpha: 0.4 });

    for (const p of pts) {
      const r = 4.5 + Math.sin(this.phase * 6) * 1.2;
      this.core.circle(p.x, p.y, r);
      this.core.fill({ color: this.lineColor, alpha: 0.85 });
      this.core.circle(p.x, p.y, r + 3);
      this.core.fill({ color: this.lineColor, alpha: 0.12 });
    }
  }
}
