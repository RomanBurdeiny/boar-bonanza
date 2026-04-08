import { Application } from 'pixi.js';
import { appConfig } from '../config/appConfig';
import { GameController } from '../../game/application/controllers/GameController';
import { EventBus } from '../../game/application/events/eventBus';
import { GameStore } from '../../game/application/store/gameStore';
import { preloadAllSymbolTextures } from '../../game/presentation/assets/textures';
import { createPlayerRng, GameScene } from '../../game/presentation/scenes/GameScene';

export interface GameRuntime {
  app: Application;
  store: GameStore;
  bus: EventBus;
  controller: GameController;
  destroy: () => void;
}

export async function bootstrapGame(root: HTMLElement): Promise<GameRuntime> {
  const app = new Application();
  await app.init({
    width: appConfig.canvas.width,
    height: appConfig.canvas.height,
    background: appConfig.canvas.background,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  root.replaceChildren(app.canvas);
  preloadAllSymbolTextures();

  const store = new GameStore();
  const bus = new EventBus();
  const controller = new GameController(store, bus, createPlayerRng);
  const scene = new GameScene(store, bus, controller);
  app.stage.addChild(scene);

  const destroy = (): void => {
    app.destroy(true);
  };

  return { app, store, bus, controller, destroy };
}
