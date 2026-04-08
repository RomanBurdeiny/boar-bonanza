import { Container, Graphics, Sprite, Texture, Ticker } from 'pixi.js';
import { uiConfig } from '../../../app/config/uiConfig';
import { REEL_LAYOUT } from '../constants/reelLayout';
import { getPixelSymbolTexture } from '../assets/textures';
import type { SymbolId } from '../../domain/enums/SymbolId';
import { symbolRarity, type SymbolRarity } from '../visual/symbolRarity';

const { cellW, cellH } = REEL_LAYOUT;

function rimForRarity(r: SymbolRarity): number {
  switch (r) {
    case 'low':
      return uiConfig.colors.rarity.low;
    case 'mid':
      return uiConfig.colors.rarity.mid;
    case 'high':
      return uiConfig.colors.rarity.high;
    case 'special':
      return uiConfig.colors.rarity.special;
    default:
      return uiConfig.colors.rarity.low;
  }
}

function plateForRarity(r: SymbolRarity): number {
  switch (r) {
    case 'low':
      return uiConfig.colors.rarity.plateLow;
    case 'mid':
      return uiConfig.colors.rarity.plateMid;
    case 'high':
      return uiConfig.colors.rarity.plateHigh;
    case 'special':
      return uiConfig.colors.rarity.plateSpecial;
    default:
      return uiConfig.colors.rarity.plateLow;
  }
}

export class SymbolView extends Container {
  private readonly frame: Graphics;
  private readonly glow: Graphics;
  private readonly sprite: Sprite;
  private currentId: SymbolId | null = null;
  private winPulseOn = false;
  private pulsePhase = 0;
  private readonly pulseTicker = (ticker: Ticker): void => {
    if (!this.winPulseOn) {
      return;
    }
    this.pulsePhase += ticker.deltaMS * 0.007;
    const s = 1 + Math.sin(this.pulsePhase * 6.5) * 0.07;
    const fit = Math.min(cellW - 10, cellH - 10) / 64;
    this.sprite.scale.set(fit * s);
    this.glow.alpha = 0.35 + Math.sin(this.pulsePhase * 5) * 0.22;
  };

  constructor() {
    super();
    this.glow = new Graphics();
    this.glow.roundRect(-4, -4, cellW + 8, cellH + 8, 8);
    this.glow.fill({ color: uiConfig.colors.winGold, alpha: 0.4 });
    this.glow.visible = false;
    this.addChild(this.glow);

    this.frame = new Graphics();
    this.addChild(this.frame);

    this.sprite = new Sprite(Texture.EMPTY);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(cellW / 2, cellH / 2);
    const fit = Math.min(cellW - 10, cellH - 10) / 64;
    this.sprite.scale.set(fit);
    this.addChild(this.sprite);

    this.applyChrome('ACORN');
  }

  private applyChrome(id: SymbolId): void {
    const r = symbolRarity(id);
    const plate = plateForRarity(r);
    const rim = rimForRarity(r);
    this.frame.clear();
    this.frame.roundRect(0, 0, cellW, cellH, 6);
    this.frame.fill({ color: plate, alpha: 1 });
    this.frame.stroke({ width: r === 'special' ? 2.5 : 2, color: rim, alpha: 1 });
    if (r === 'high' || r === 'special') {
      this.frame.roundRect(2, 2, cellW - 4, cellH - 4, 5);
      this.frame.stroke({
        width: 1,
        color: r === 'special' ? 0xffe8a8 : 0xc9a060,
        alpha: r === 'special' ? 0.55 : 0.35,
      });
    }
  }

  setSymbol(id: SymbolId): void {
    if (this.currentId === id) {
      return;
    }
    this.currentId = id;
    this.sprite.texture = getPixelSymbolTexture(id);
    this.applyChrome(id);
  }

  setSymbolForce(id: SymbolId): void {
    this.currentId = id;
    this.sprite.texture = getPixelSymbolTexture(id);
    this.applyChrome(id);
  }

  setDimmed(dim: boolean): void {
    this.alpha = dim ? 0.38 : 1;
  }

  flashWin(): void {
    if (this.winPulseOn) {
      return;
    }
    this.glow.visible = true;
    this.winPulseOn = true;
    this.pulsePhase = 0;
    Ticker.shared.add(this.pulseTicker);
  }

  clearWinTint(): void {
    this.winPulseOn = false;
    Ticker.shared.remove(this.pulseTicker);
    this.glow.visible = false;
    const fit = Math.min(cellW - 10, cellH - 10) / 64;
    this.sprite.scale.set(fit);
    this.alpha = 1;
    this.glow.alpha = 0.55;
    if (this.currentId) {
      this.applyChrome(this.currentId);
    }
  }
}
