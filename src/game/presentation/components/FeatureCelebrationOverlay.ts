import { Container, Graphics, Text } from 'pixi.js';
import { appConfig } from '../../../app/config/appConfig';
import { uiConfig } from '../../../app/config/uiConfig';

const CW = appConfig.canvas.width;
const CH = appConfig.canvas.height;

export class FeatureCelebrationOverlay extends Container {
  async showFreeSpinsAwarded(n: number): Promise<void> {
    const dim = new Graphics();
    dim.rect(0, 0, CW, CH);
    dim.fill({ color: 0x000000, alpha: 0 });
    dim.eventMode = 'none';

    const panel = new Graphics();
    const pw = 480;
    const ph = 180;
    const px = (CW - pw) / 2;
    const py = (CH - ph) / 2 - 20;
    panel.roundRect(px, py, pw, ph, 22);
    panel.fill({ color: 0x1a1008, alpha: 0.94 });
    panel.stroke({ width: 3, color: uiConfig.colors.bonusAccent, alpha: 1 });
    panel.roundRect(px + 5, py + 5, pw - 10, ph - 10, 18);
    panel.stroke({ width: 1, color: 0xffc070, alpha: 0.4 });
    panel.alpha = 0;

    const glowOuter = new Graphics();
    glowOuter.roundRect(px - 10, py - 10, pw + 20, ph + 20, 28);
    glowOuter.stroke({ width: 12, color: uiConfig.colors.bonusAccent, alpha: 0.18 });
    glowOuter.alpha = 0;

    const heading = new Text({
      text: 'FREE SPINS!',
      style: {
        fill: uiConfig.colors.bonusAccent,
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 5,
        dropShadow: { blur: 4, color: 0x301000, alpha: 0.7, distance: 2 },
      },
    });
    heading.anchor.set(0.5);
    heading.position.set(CW / 2, py + 60);
    heading.alpha = 0;

    const countText = new Text({
      text: `+${n}`,
      style: {
        fill: 0xfff8d0,
        fontSize: 58,
        fontWeight: 'bold',
        dropShadow: { blur: 6, color: 0x402000, alpha: 0.8, distance: 2 },
      },
    });
    countText.anchor.set(0.5);
    countText.position.set(CW / 2, py + 120);
    countText.alpha = 0;

    const sparkles: Graphics[] = [];
    for (let i = 0; i < 14; i++) {
      const sp = new Graphics();
      const angle = (i / 14) * Math.PI * 2;
      const dist = 120 + Math.random() * 60;
      sp.circle(0, 0, 2 + Math.random() * 2.5);
      sp.fill({ color: uiConfig.colors.bonusAccent, alpha: 0.7 + Math.random() * 0.3 });
      sp.position.set(CW / 2 + Math.cos(angle) * dist, py + ph / 2 + Math.sin(angle) * dist);
      sp.alpha = 0;
      sparkles.push(sp);
    }

    this.addChild(dim, glowOuter, panel, heading, countText, ...sparkles);

    const t0 = performance.now();
    const totalDur = 1800;
    await new Promise<void>((resolve) => {
      const step = (): void => {
        const elapsed = performance.now() - t0;
        const u = Math.min(1, elapsed / totalDur);

        const fadeIn = Math.min(1, u * 4);
        dim.clear();
        dim.rect(0, 0, CW, CH);
        dim.fill({ color: 0x0a0800, alpha: 0.6 * fadeIn });

        const panelIn = Math.min(1, Math.max(0, (u - 0.05) * 5));
        const panelEase = 1 - Math.pow(1 - panelIn, 3);
        panel.alpha = panelEase;
        panel.scale.set(0.9 + 0.1 * panelEase);
        panel.pivot.set(CW / 2, py + ph / 2);
        panel.position.set(CW / 2, py + ph / 2);

        glowOuter.alpha = panelEase * 0.6;
        glowOuter.scale.set(panel.scale.x);
        glowOuter.pivot.set(panel.pivot.x, panel.pivot.y);
        glowOuter.position.set(panel.position.x, panel.position.y);

        const headIn = Math.min(1, Math.max(0, (u - 0.15) * 5));
        heading.alpha = headIn;
        heading.position.y = py + 60 - (1 - headIn) * 12;

        const numIn = Math.min(1, Math.max(0, (u - 0.28) * 4));
        const numEase = 1 - Math.pow(1 - numIn, 3);
        countText.alpha = numEase;
        countText.scale.set(0.7 + 0.3 * numEase);

        for (let i = 0; i < sparkles.length; i++) {
          const sp = sparkles[i]!;
          const delay = 0.2 + (i / sparkles.length) * 0.25;
          const spU = Math.min(1, Math.max(0, (u - delay) * 3));
          sp.alpha = spU * (1 - Math.max(0, (u - 0.75) * 4));
          const drift = spU * 12;
          const angle = (i / sparkles.length) * Math.PI * 2;
          const baseDist = 120 + (i % 3) * 20;
          sp.position.set(
            CW / 2 + Math.cos(angle) * (baseDist + drift),
            py + ph / 2 + Math.sin(angle) * (baseDist + drift),
          );
        }

        if (u >= 0.92) {
          const exitU = (u - 0.92) / 0.08;
          const exitAlpha = 1 - exitU;
          dim.alpha = exitAlpha;
          panel.alpha = exitAlpha;
          glowOuter.alpha = exitAlpha * 0.6;
          heading.alpha = exitAlpha;
          countText.alpha = exitAlpha;
        }

        if (u < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

    this.removeChildren();
    for (const sp of sparkles) sp.destroy();
    dim.destroy();
    panel.destroy();
    glowOuter.destroy();
    heading.destroy();
    countText.destroy();
  }
}
