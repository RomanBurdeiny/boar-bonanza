import { Container, Graphics } from 'pixi.js';
import { appConfig } from '../../../app/config/appConfig';
import { uiConfig } from '../../../app/config/uiConfig';

const BAR_H = 82;

export class BottomBar extends Container {
  private readonly bg: Graphics;

  constructor() {
    super();
    const w = appConfig.canvas.width;
    this.bg = new Graphics();
    this.bg.rect(0, 0, w, BAR_H);
    this.bg.fill({ color: 0x100c08, alpha: 0.92 });
    this.bg.rect(0, 0, w, 1);
    this.bg.fill({ color: uiConfig.colors.cabinetRim, alpha: 0.55 });
    this.bg.rect(0, 1, w, 1);
    this.bg.fill({ color: 0x000000, alpha: 0.45 });
    this.bg.roundRect(w / 2 - 105, -8, 210, BAR_H + 8, 12);
    this.bg.fill({ color: 0x100c08, alpha: 0.96 });
    this.bg.roundRect(w / 2 - 105, -8, 210, 1, 0);
    this.bg.fill({ color: uiConfig.colors.cabinetRim, alpha: 0.45 });
    this.addChild(this.bg);
  }

  static readonly HEIGHT = BAR_H;
}
