import { Container, Graphics, Text } from 'pixi.js';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { uiConfig } from '../../../app/config/uiConfig';

export class BetPanel extends Container {
  private readonly value: Text;
  onChange: ((delta: 1 | -1) => void) | null = null;
  private disabled = false;

  constructor() {
    super();
    const bg = new Graphics();
    const pw = 228;
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
        text: 'Bet',
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
      position: { x: 72, y: 22 },
    });
    this.addChild(this.value);

    const minusC = this.makeBtn(4, 10, '−', () => this.onChange?.(-1));
    const plusC = this.makeBtn(186, 10, '+', () => this.onChange?.(1));
    this.addChild(minusC, plusC);
  }

  private makeBtn(x: number, y: number, label: string, fn: () => void): Container {
    const c = new Container();
    c.position.set(x, y);
    const g = new Graphics();
    g.roundRect(0, 0, 36, 28, 7);
    g.fill(0x3a3028);
    g.stroke({ width: 1, color: uiConfig.colors.panelBorder });
    c.addChild(g);
    const t = new Text({
      text: label,
      style: { fill: 0xe8dcc8, fontSize: label === '+' ? 20 : 18, fontWeight: 'bold' },
    });
    t.anchor.set(0.5);
    t.position.set(18, 14);
    c.addChild(t);
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.on('pointertap', () => {
      if (!this.disabled) {
        fn();
      }
    });
    return c;
  }

  setBet(n: number): void {
    this.value.text = formatMoney(n);
  }

  setDisabled(v: boolean): void {
    this.disabled = v;
    this.alpha = v ? 0.5 : 1;
  }
}
