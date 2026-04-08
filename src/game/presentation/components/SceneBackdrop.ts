import { Container, Graphics, Ticker } from 'pixi.js';
import { Z_INDEX } from '../../../shared/constants/zIndex';

/**
 * Non-interactive scene depth: layered background with vignette
 * and a slowly pulsing ambient glow to keep the scene alive at idle.
 */
export class SceneBackdrop extends Container {
  private readonly ambientGlow: Graphics;
  private phase = Math.random() * 100;
  private readonly tick = (t: Ticker): void => {
    this.phase += t.deltaMS * 0.0008;
    const a = 0.08 + Math.sin(this.phase * 1.8) * 0.03;
    this.ambientGlow.alpha = a;
  };

  constructor(width: number, height: number) {
    super();
    this.zIndex = Z_INDEX.backdrop;
    this.eventMode = 'none';

    const base = new Graphics();
    base.rect(0, 0, width, height);
    base.fill({ color: 0x100c08, alpha: 1 });
    this.addChild(base);

    const warmTop = new Graphics();
    warmTop.rect(0, 0, width, height * 0.5);
    warmTop.fill({ color: 0x2a1810, alpha: 0.4 });
    this.addChild(warmTop);

    const warmMid = new Graphics();
    warmMid.rect(0, height * 0.25, width, height * 0.45);
    warmMid.fill({ color: 0x1a1008, alpha: 0.25 });
    this.addChild(warmMid);

    this.ambientGlow = new Graphics();
    const cx = width * 0.5;
    const cy = height * 0.42;
    const r = Math.max(width, height) * 0.5;
    this.ambientGlow.circle(cx, cy, r);
    this.ambientGlow.fill({ color: 0x5a3820, alpha: 1 });
    this.ambientGlow.alpha = 0.1;
    this.addChild(this.ambientGlow);

    const accentLine = new Graphics();
    accentLine.rect(0, height * 0.48, width, 1);
    accentLine.fill({ color: 0x4a3020, alpha: 0.18 });
    this.addChild(accentLine);

    const vin = new Graphics();
    const v = 80;
    vin.rect(0, 0, v, height);
    vin.fill({ color: 0x000000, alpha: 0.4 });
    vin.rect(width - v, 0, v, height);
    vin.fill({ color: 0x000000, alpha: 0.4 });
    vin.rect(0, 0, width, v * 0.9);
    vin.fill({ color: 0x000000, alpha: 0.42 });
    vin.rect(0, height - v * 0.65, width, v * 0.65);
    vin.fill({ color: 0x000000, alpha: 0.58 });
    this.addChild(vin);

    const cornerTL = new Graphics();
    cornerTL.circle(0, 0, 180);
    cornerTL.fill({ color: 0x000000, alpha: 0.12 });
    this.addChild(cornerTL);

    const cornerBR = new Graphics();
    cornerBR.circle(width, height, 180);
    cornerBR.fill({ color: 0x000000, alpha: 0.12 });
    this.addChild(cornerBR);

    Ticker.shared.add(this.tick);
  }
}
