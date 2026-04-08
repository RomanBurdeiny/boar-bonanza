import { Container, Graphics, Text } from 'pixi.js';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { uiConfig } from '../../../app/config/uiConfig';

export class BalancePanel extends Container {
  private readonly value: Text;
  private target = 0;
  private anim: number | null = null;

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
        text: 'Balance',
        style: { fill: uiConfig.colors.textMuted, fontSize: 11, fontWeight: '600' },
        position: { x: 14, y: 8 },
      }),
    );
    this.value = new Text({
      text: '0.00',
      style: {
        fill: uiConfig.colors.textLight,
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 0.5,
      },
      position: { x: 14, y: 24 },
    });
    this.addChild(this.value);
  }

  setBalanceImmediate(n: number): void {
    this.target = n;
    if (this.anim !== null) {
      cancelAnimationFrame(this.anim);
      this.anim = null;
    }
    this.value.text = formatMoney(n);
  }

  animateToBalance(n: number): void {
    const start = this.target;
    this.target = n;
    const t0 = performance.now();
    const dur = 420;
    const step = (): void => {
      const u = Math.min(1, (performance.now() - t0) / dur);
      const cur = start + (n - start) * u;
      this.value.text = formatMoney(cur);
      if (u < 1) {
        this.anim = requestAnimationFrame(step) as unknown as number;
      } else {
        this.anim = null;
      }
    };
    if (this.anim !== null) {
      cancelAnimationFrame(this.anim);
    }
    this.anim = requestAnimationFrame(step) as unknown as number;
  }
}
