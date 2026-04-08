import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { appConfig } from '../../../app/config/appConfig';
import { formatMoney } from '../../../shared/utils/formatMoney';
import { uiConfig } from '../../../app/config/uiConfig';

const CW = appConfig.canvas.width;

type WinTier = 'small' | 'big' | 'mega';

const TIER_CONFIG: Record<WinTier, { label: string; fontSize: number; glowColor: number; rimColor: number; panelAlpha: number }> = {
  small: { label: 'WIN', fontSize: 32, glowColor: uiConfig.colors.winGold, rimColor: 0xd4a028, panelAlpha: 0.82 },
  big:   { label: 'BIG WIN!', fontSize: 44, glowColor: 0xffb838, rimColor: 0xffb030, panelAlpha: 0.88 },
  mega:  { label: 'MEGA WIN!', fontSize: 52, glowColor: 0xff6020, rimColor: 0xff8838, panelAlpha: 0.92 },
};

export class WinBanner extends Container {
  private readonly panel = new Graphics();
  private readonly glowRing = new Graphics();
  private readonly tierLabel: Text;
  private readonly amountLabel: Text;
  private phase = 0;
  private tier: WinTier = 'small';
  private showActive = false;
  private readonly tick = (t: Ticker): void => {
    if (!this.showActive) return;
    this.phase += t.deltaMS * 0.005;
    const s = 1 + Math.sin(this.phase * 5) * (this.tier === 'mega' ? 0.04 : 0.02);
    this.amountLabel.scale.set(s);
    const ga = 0.15 + Math.sin(this.phase * 4) * 0.08;
    this.glowRing.alpha = this.tier === 'small' ? 0 : ga;
  };

  constructor() {
    super();
    this.visible = false;

    this.addChild(this.glowRing);
    this.addChild(this.panel);

    this.tierLabel = new Text({
      text: '',
      style: {
        fill: 0xfff0c0,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 6,
        dropShadow: { blur: 3, color: 0x000000, alpha: 0.6, distance: 1 },
      },
    });
    this.tierLabel.anchor.set(0.5);
    this.tierLabel.position.set(CW / 2, 90);
    this.addChild(this.tierLabel);

    this.amountLabel = new Text({
      text: '',
      style: {
        fill: 0xfff8d0,
        fontSize: 36,
        fontWeight: 'bold',
        dropShadow: { blur: 5, color: 0x301800, alpha: 0.7, distance: 2 },
      },
    });
    this.amountLabel.anchor.set(0.5);
    this.amountLabel.position.set(CW / 2, 120);
    this.addChild(this.amountLabel);

    Ticker.shared.add(this.tick);
  }

  async show(amount: number, _big: boolean, durationMs: number): Promise<void> {
    const bet = amount;
    this.tier = _big ? (amount / Math.max(1, bet) >= 30 ? 'mega' : 'big') : 'small';
    if (_big) {
      this.tier = 'big';
    }
    const cfg = TIER_CONFIG[this.tier];

    this.visible = true;
    this.showActive = true;
    this.phase = 0;

    this.tierLabel.text = cfg.label;
    this.tierLabel.style.fontSize = this.tier === 'small' ? 14 : 18;
    this.amountLabel.style.fontSize = cfg.fontSize;

    this.panel.clear();
    const pw = this.tier === 'mega' ? 760 : this.tier === 'big' ? 740 : 640;
    const ph = this.tier === 'mega' ? 110 : this.tier === 'big' ? 100 : 80;
    const px = (CW - pw) / 2;
    const py = this.tier === 'mega' ? 62 : 72;
    this.panel.roundRect(px, py, pw, ph, 16);
    this.panel.fill({ color: 0x1a1208, alpha: cfg.panelAlpha });
    this.panel.stroke({ width: 3, color: cfg.rimColor, alpha: 1 });
    this.panel.roundRect(px + 4, py + 4, pw - 8, ph - 8, 12);
    this.panel.stroke({ width: 1, color: cfg.glowColor, alpha: 0.28 });

    this.glowRing.clear();
    if (this.tier !== 'small') {
      this.glowRing.roundRect(px - 6, py - 6, pw + 12, ph + 12, 20);
      this.glowRing.stroke({ width: 8, color: cfg.glowColor, alpha: 0.22 });
    }

    this.tierLabel.position.y = py + (this.tier === 'small' ? 18 : 22);
    this.amountLabel.position.y = py + ph / 2 + (this.tier === 'small' ? 8 : 12);

    await this.animateCountUp(amount, durationMs);
  }

  hide(): void {
    this.visible = false;
    this.showActive = false;
  }

  private async animateCountUp(target: number, totalMs: number): Promise<void> {
    const dur = Math.min(totalMs * 0.7, 800);
    const holdMs = totalMs - dur;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (): void => {
        const u = Math.min(1, (performance.now() - t0) / dur);
        const ease = 1 - Math.pow(1 - u, 3);
        const cur = target * ease;
        this.amountLabel.text = formatMoney(cur);
        const entryScale = Math.min(1, u * 1.5);
        this.scale.set(0.85 + 0.15 * entryScale);
        this.alpha = Math.min(1, u * 2.5);
        if (u < 1) {
          requestAnimationFrame(step);
        } else {
          this.amountLabel.text = formatMoney(target);
          this.scale.set(1);
          this.alpha = 1;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
    if (holdMs > 0) {
      await new Promise<void>((r) => setTimeout(r, holdMs));
    }
  }
}
