import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { uiConfig } from '../../../app/config/uiConfig';

export class WinTickerPanel extends Container {
  private readonly v: Text;
  private displayValue = 0;
  private targetValue = 0;
  private countStart = 0;
  private countT0 = 0;
  private countDur = 0;
  private counting = false;
  private popPhase = 0;
  private readonly tick = (t: Ticker): void => {
    if (this.counting) {
      const u = Math.min(1, (performance.now() - this.countT0) / this.countDur);
      const ease = 1 - Math.pow(1 - u, 3);
      this.displayValue = this.countStart + (this.targetValue - this.countStart) * ease;
      this.v.text = formatMoney(this.displayValue);
      if (u >= 1) {
        this.counting = false;
        this.displayValue = this.targetValue;
        this.v.text = formatMoney(this.targetValue);
        this.popPhase = 1;
      }
    }
    if (this.popPhase > 0) {
      this.popPhase -= t.deltaMS / 320;
      const s = 1 + Math.sin((1 - this.popPhase) * Math.PI) * 0.08;
      this.v.scale.set(s);
      if (this.popPhase <= 0) {
        this.popPhase = 0;
        this.v.scale.set(1);
      }
    }
  };

  constructor() {
    super();
    const bg = new Graphics();
    const pw = 212;
    const ph = 48;
    bg.roundRect(0, 0, pw, ph, 10);
    bg.fill(uiConfig.colors.panelBg);
    bg.stroke({ width: 2, color: uiConfig.colors.panelBorder });
    bg.roundRect(4, 4, pw - 8, ph - 8, 8);
    bg.stroke({ width: 1, color: uiConfig.colors.panelBorderInner, alpha: 0.55 });
    bg.roundRect(6, 6, pw - 12, 14, 6);
    bg.fill({ color: uiConfig.colors.panelBgTop, alpha: 0.35 });
    this.addChild(bg);
    this.addChild(
      new Text({
        text: 'Last win',
        style: { fill: uiConfig.colors.textMuted, fontSize: 11, fontWeight: '600' },
        position: { x: 14, y: 8 },
      }),
    );
    this.v = new Text({
      text: '0.00',
      style: {
        fill: uiConfig.colors.winGold,
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        dropShadow: { blur: 2, color: 0x301800, alpha: 0.5, distance: 1 },
      },
      position: { x: 14, y: 24 },
    });
    this.addChild(this.v);
    Ticker.shared.add(this.tick);
  }

  setLastWin(n: number): void {
    if (n === 0) {
      this.counting = false;
      this.displayValue = 0;
      this.targetValue = 0;
      this.v.text = formatMoney(0);
      return;
    }
    this.countStart = this.displayValue;
    this.targetValue = n;
    this.countT0 = performance.now();
    this.countDur = Math.min(600, 180 + Math.abs(n - this.countStart) * 2);
    this.counting = true;
  }
}
