import { Container, FederatedPointerEvent, Graphics, Text, Ticker } from 'pixi.js';
import { uiConfig } from '../../../app/config/uiConfig';

export class SpinButton extends Container {
  private readonly outerGlow: Graphics;
  private readonly body: Graphics;
  private readonly caption: Text;
  private cb: (() => void) | null = null;
  private disabled = false;
  private hover = false;
  private pressed = false;
  private glowPhase = 0;
  private readonly glowTick = (t: Ticker): void => {
    if (this.disabled) {
      this.outerGlow.visible = false;
      return;
    }
    this.outerGlow.visible = true;
    this.glowPhase += t.deltaMS * 0.005;
    const pulse = 0.28 + Math.sin(this.glowPhase * 6) * 0.14;
    this.drawGlow(pulse);
  };

  constructor() {
    super();
    this.outerGlow = new Graphics();
    this.addChild(this.outerGlow);

    this.body = new Graphics();
    this.addChild(this.body);

    this.caption = new Text({
      text: 'SPIN',
      style: {
        fill: 0xf8f8f8,
        fontSize: 22,
        fontWeight: 'bold',
        dropShadow: { blur: 2, color: 0x102010, alpha: 0.45, distance: 1 },
      },
    });
    this.caption.anchor.set(0.5);
    this.caption.position.set(90, 34);
    this.addChild(this.caption);

    this.drawBody();

    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this.onDown);
    this.on('pointerup', this.onUp);
    this.on('pointerupoutside', this.onUp);
    this.on('pointerover', () => {
      this.hover = true;
      this.drawBody();
    });
    this.on('pointerout', () => {
      this.hover = false;
      this.pressed = false;
      this.drawBody();
    });
    Ticker.shared.add(this.glowTick);
  }

  setCallback(fn: () => void): void {
    this.cb = fn;
  }

  setDisabled(v: boolean): void {
    this.disabled = v;
    this.cursor = v ? 'default' : 'pointer';
    this.caption.alpha = v ? 0.55 : 1;
    this.drawBody();
    if (v) {
      this.outerGlow.clear();
      this.outerGlow.visible = false;
    }
  }

  private drawGlow(strength: number): void {
    this.outerGlow.clear();
    if (this.disabled) {
      return;
    }
    this.outerGlow.roundRect(-4, -4, 188, 76, 18);
    this.outerGlow.stroke({
      width: 10,
      color: uiConfig.colors.accentGreenHover,
      alpha: strength,
    });
  }

  private onDown = (e: FederatedPointerEvent): void => {
    if (this.disabled) {
      return;
    }
    this.pressed = true;
    this.drawBody();
    e.stopPropagation();
  };

  private onUp = (): void => {
    if (this.disabled) {
      this.pressed = false;
      this.drawBody();
      return;
    }
    const fire = this.pressed;
    this.pressed = false;
    this.drawBody();
    if (fire) {
      this.cb?.();
    }
  };

  private drawBody(): void {
    this.body.clear();
    if (this.disabled) {
      this.body.roundRect(0, 0, 180, 68, 14);
      this.body.fill({ color: 0x353535, alpha: 1 });
      this.body.stroke({ width: 2, color: 0x1a1a1a, alpha: 1 });
      return;
    }
    let fill: number = uiConfig.colors.accentGreen;
    if (this.pressed) {
      fill = 0x2d5232;
    } else if (this.hover) {
      fill = uiConfig.colors.accentGreenHover;
    }
    const yOff = this.pressed ? 2 : 0;
    this.body.roundRect(0, yOff, 180, 68, 14);
    this.body.fill({ color: fill, alpha: 1 });
    this.body.stroke({
      width: this.hover || this.pressed ? 2 : 2,
      color: this.pressed ? 0x1a301a : 0x2a402a,
      alpha: 1,
    });
    if (!this.pressed && !this.hover) {
      this.body.roundRect(3, 3 + yOff, 174, 24, 10);
      this.body.fill({ color: 0xffffff, alpha: 0.08 });
    }
    this.caption.position.set(90, 34 + yOff);
  }
}
