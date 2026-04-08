import { Container, Graphics, Text } from 'pixi.js';
import { uiConfig } from '../../../app/config/uiConfig';

export class FeatureBanner extends Container {
  private readonly bg: Graphics;
  private readonly t: Text;

  constructor() {
    super();
    this.bg = new Graphics();
    this.addChild(this.bg);

    this.t = new Text({
      text: '',
      style: {
        fill: 0xf0e0c0,
        fontSize: 15,
        fontWeight: 'bold',
        dropShadow: { blur: 2, color: 0x000000, alpha: 0.45, distance: 1 },
      },
      position: { x: 14, y: 8 },
    });
    this.addChild(this.t);
    this.redraw(false);
  }

  setFreeSpinsMessage(n: number): void {
    const active = n > 0;
    this.t.text = active ? `FREE SPINS  ·  ${n} remaining` : '';
    this.t.style.fill = active ? 0xfff2c8 : 0xf0e0c0;
    this.redraw(active);
  }

  private redraw(active: boolean): void {
    const w = 310;
    const h = 38;
    this.bg.clear();
    this.bg.roundRect(0, 0, w, h, 10);
    if (active) {
      this.bg.fill({ color: 0x2a1808, alpha: 0.95 });
      this.bg.stroke({ width: 2, color: uiConfig.colors.bonusAccent, alpha: 0.95 });
      this.bg.roundRect(4, 4, w - 8, h - 8, 8);
      this.bg.stroke({ width: 1, color: 0xffc070, alpha: 0.35 });
    } else {
      this.bg.fill({ color: 0x1e1810, alpha: 0.88 });
      this.bg.stroke({ width: 1, color: uiConfig.colors.panelBorder, alpha: 0.65 });
    }
  }
}
