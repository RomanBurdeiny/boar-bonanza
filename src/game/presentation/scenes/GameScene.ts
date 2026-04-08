import { Container } from 'pixi.js';
import { appConfig } from '../../../app/config/appConfig';
import { TIMINGS_MS } from '../../../shared/constants/timings';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { GameController } from '../../application/controllers/GameController';
import { EventBus } from '../../application/events/eventBus';
import { GAME_EVENT, type SpinResultPayload } from '../../application/events/gameEvents';
import type { GameStore } from '../../application/store/gameStore';
import { MathRandomRng } from '../../math/rng/random';
import { BalancePanel } from '../components/BalancePanel';
import { BetPanel } from '../components/BetPanel';
import { BottomBar } from '../components/BottomBar';
import { SceneBackdrop } from '../components/SceneBackdrop';
import { FeatureBanner } from '../components/FeatureBanner';
import { FeatureCelebrationOverlay } from '../components/FeatureCelebrationOverlay';
import { SlotBoard } from '../components/SlotBoard';
import { SpinButton } from '../components/SpinButton';
import { WinBanner } from '../components/WinBanner';
import { WinTickerPanel } from '../components/WinTickerPanel';
import { isBigWin } from '../effects/BigWinEffect';
import { GameEffectsLayer } from '../effects/GameEffectsLayer';
import { playReels } from '../effects/ReelSpinEffect';
import { slotBoardOuterSize } from '../constants/slotCabinetLayout';

const CW = appConfig.canvas.width;
const CH = appConfig.canvas.height;

export class GameScene extends Container {
  private readonly board: SlotBoard;
  private readonly spin: SpinButton;
  private readonly balance: BalancePanel;
  private readonly bet: BetPanel;
  private readonly winBanner: WinBanner;
  private readonly feature: FeatureBanner;
  private readonly featureCelebration: FeatureCelebrationOverlay;
  private readonly fxLayer: GameEffectsLayer;
  private readonly winTicker: WinTickerPanel;
  private animating = false;
  private balancePrimed = false;
  private lastBalance = -1;

  constructor(
    private readonly store: GameStore,
    private readonly bus: EventBus,
    private readonly controller: GameController,
  ) {
    super();
    this.sortableChildren = true;

    const backdrop = new SceneBackdrop(CW, CH);
    this.addChild(backdrop);

    const bottomBar = new BottomBar();
    bottomBar.position.set(0, CH - BottomBar.HEIGHT);
    bottomBar.zIndex = Z_INDEX.uiPanels - 1;
    this.addChild(bottomBar);

    this.board = new SlotBoard();
    const { w: boardW, h: boardH } = slotBoardOuterSize();
    const boardX = Math.round((CW - boardW) / 2);
    const topPanelArea = 52;
    const bottomBarArea = BottomBar.HEIGHT;
    const availableH = CH - topPanelArea - bottomBarArea;
    const boardY = topPanelArea + Math.round((availableH - boardH) / 2);
    this.board.position.set(boardX, boardY);
    this.addChild(this.board);

    this.fxLayer = new GameEffectsLayer();
    this.fxLayer.zIndex = Z_INDEX.winHighlight;
    this.addChild(this.fxLayer);

    const topY = 8;
    this.balance = new BalancePanel();
    this.balance.position.set(24, topY);
    this.balance.zIndex = Z_INDEX.uiPanels;
    this.addChild(this.balance);

    this.bet = new BetPanel();
    this.bet.position.set(24 + 212 + 12, topY);
    this.bet.zIndex = Z_INDEX.uiPanels;
    this.bet.onChange = (d) => this.controller.nudgeBet(d);
    this.addChild(this.bet);

    this.winTicker = new WinTickerPanel();
    this.winTicker.position.set(CW - 212 - 24, topY);
    this.winTicker.zIndex = Z_INDEX.uiPanels;
    this.addChild(this.winTicker);

    this.spin = new SpinButton();
    this.spin.position.set(Math.round(CW / 2 - 90), CH - BottomBar.HEIGHT + 7);
    this.spin.zIndex = Z_INDEX.uiPanels;
    this.spin.setCallback(() => void this.handleSpinClick());
    this.addChild(this.spin);

    this.feature = new FeatureBanner();
    this.feature.position.set(24, CH - BottomBar.HEIGHT + 22);
    this.feature.zIndex = Z_INDEX.uiPanels;
    this.addChild(this.feature);

    this.winBanner = new WinBanner();
    this.winBanner.position.set(0, 0);
    this.winBanner.zIndex = Z_INDEX.banners;
    this.addChild(this.winBanner);

    this.featureCelebration = new FeatureCelebrationOverlay();
    this.featureCelebration.zIndex = Z_INDEX.banners + 10;
    this.addChild(this.featureCelebration);

    this.store.subscribe(() => this.syncUi());
    this.bus.on<SpinResultPayload>(GAME_EVENT.SPIN_RESULT, (p) => void this.handleSpinResult(p));
    this.syncUi();
    this.board.setStaticGrid(this.defaultGrid());
  }

  private defaultGrid(): import('../../domain/enums/SymbolId').SymbolId[][] {
    return Array.from({ length: 5 }, () => ['ACORN', 'MUSHROOM', 'FOREST_LEAF'] as const);
  }

  private syncUi(): void {
    const s = this.store.getSnapshot();
    if (!this.balancePrimed) {
      this.balance.setBalanceImmediate(s.balance);
      this.balancePrimed = true;
      this.lastBalance = s.balance;
    } else if (s.balance !== this.lastBalance) {
      this.lastBalance = s.balance;
      this.balance.animateToBalance(s.balance);
    }
    this.bet.setBet(s.bet);
    this.feature.setFreeSpinsMessage(s.bonus.freeSpins?.remaining ?? 0);
    const inFree = (s.bonus.freeSpins?.remaining ?? 0) > 0;
    this.board.setFreeSpinsMode(inFree);
    const affordable = inFree || s.balance >= s.bet;
    const idle = this.controller.getFsmState() === 'IDLE';
    const canSpin = idle && !this.animating && affordable;
    this.spin.setDisabled(!canSpin);
    this.bet.setDisabled(!idle || this.animating);
  }

  private async handleSpinClick(): Promise<void> {
    if (this.animating || this.controller.getFsmState() !== 'IDLE') {
      return;
    }
    this.animating = true;
    this.syncUi();
    const ok = this.controller.requestSpin();
    if (!ok) {
      this.animating = false;
      this.syncUi();
    }
  }

  private async handleSpinResult(payload: SpinResultPayload): Promise<void> {
    const { result } = payload;
    try {
      await playReels(this.board, result.grid);

      const scMap = this.board.scatterRowSets(result.wins);
      if (scMap.size > 0) {
        this.board.pulseScatterPattern(scMap);
        for (const p of this.board.getGlobalScatterCenters(result.wins)) {
          this.fxLayer.burst(p.x, p.y, 0xff7733, 22);
        }
        await sleep(TIMINGS_MS.scatterPulseMs);
      }

      if (result.triggeredFeatures.includes('FREE_SPINS')) {
        const n = result.freeSpinsGranted ?? 0;
        if (n > 0) {
          await this.featureCelebration.showFreeSpinsAwarded(n);
        }
      }

      const lineWins = result.wins.filter((w) => w.type === 'line' && w.paylineIndex !== undefined);
      if (lineWins.length > 0) {
        for (const w of lineWins) {
          this.board.presentLineWin(w);
          const idx = w.paylineIndex;
          if (idx !== undefined) {
            this.board.lineOverlay.showPayline(idx, this.board.getPaylinePolyline(idx));
          }
          await sleep(TIMINGS_MS.winLinePerWinMs);
        }
      } else if (result.wins.length > 0 && result.totalWin > 0) {
        this.board.presentAllWinMarks(result.wins);
      }

      if (result.totalWin > 0) {
        const big = isBigWin(result.totalWin, result.totalBet || this.store.getSnapshot().bet);
        if (big) {
          this.fxLayer.setDimAlpha(0.48);
        }
        await this.winBanner.show(result.totalWin, big, big ? 1200 : 520);
        this.fxLayer.setDimAlpha(0);
      }

      this.winTicker.setLastWin(result.totalWin);
      this.syncUi();
      await sleep(Math.max(200, TIMINGS_MS.winBannerVisible - 600));
      this.winBanner.hide();
      this.fxLayer.setDimAlpha(0);
      this.board.clearWinFx();
      this.controller.completePresentation();
    } finally {
      this.fxLayer.setDimAlpha(0);
      this.animating = false;
      this.syncUi();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function createPlayerRng(): MathRandomRng {
  return new MathRandomRng();
}
