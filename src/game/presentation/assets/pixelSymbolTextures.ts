import { Texture } from 'pixi.js';
import type { SymbolId } from '../../domain/enums/SymbolId';

const SIZE = 64;
const PX = 2;
const GRID = SIZE / PX;
const cache = new Map<SymbolId, Texture>();

type Ctx = CanvasRenderingContext2D;

const PAL = {
  outline: '#21160f',

  panel: '#f4eadb',
  panelLight: '#fff8ef',
  panelShade: '#d8c6af',
  panelInner: '#efe2cf',

  brown: '#a36e42',
  brownDark: '#6f4728',
  brownLight: '#cb9669',

  green: '#2f8e4f',
  greenDark: '#1d5b31',
  greenLight: '#7ac56d',

  red: '#d84b49',
  redDark: '#8f2a29',
  redLight: '#ff8b88',

  gold: '#e2b33f',
  goldDark: '#9a701e',
  goldLight: '#fff0a0',

  blue: '#5a7fd8',
  blueDark: '#344b8c',
  blueLight: '#a8bfff',

  gray: '#90857b',
  grayDark: '#5a544f',
  grayLight: '#c7beb2',

  pink: '#e78cb0',
  pinkDark: '#9d536f',
  pinkLight: '#ffd0df',

  ivory: '#f5ede2',
  ivoryShade: '#d6c5b1',

  purple: '#8a5bd6',
  purpleDark: '#56338f',
  purpleLight: '#ccb2ff',

  ember: '#ff7d2b',
  emberDark: '#a7420c',
  emberLight: '#ffe27d',

  wood: '#8a6245',
  woodDark: '#503726',
  woodLight: '#b08767',
} as const;

function setup(ctx: Ctx): void {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, SIZE, SIZE);
}

function px(
  ctx: Ctx,
  x: number,
  y: number,
  w = 1,
  h = 1,
  fill: string = PAL.outline,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
}

function panel(ctx: Ctx): void {
  px(ctx, 4, 4, 24, 24, PAL.outline);
  px(ctx, 5, 5, 22, 22, PAL.panel);
  px(ctx, 6, 6, 20, 20, PAL.panelInner);

  px(ctx, 5, 5, 22, 1, PAL.panelLight);
  px(ctx, 5, 5, 1, 22, PAL.panelLight);

  px(ctx, 5, 26, 22, 1, PAL.panelShade);
  px(ctx, 26, 5, 1, 22, PAL.panelShade);

  px(ctx, 7, 7, 18, 1, '#ffffff55');
}

function withSymbolTransform(
  ctx: Ctx,
  draw: (ctx: Ctx) => void,
  options?: {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
  },
): void {
  const scale = options?.scale ?? 1.2;
  const offsetX = options?.offsetX ?? 0;
  const offsetY = options?.offsetY ?? 0;

  ctx.save();
  ctx.translate(
    (GRID / 2 + offsetX) * PX,
    (GRID / 2 + offsetY) * PX,
  );
  ctx.scale(scale, scale);
  draw(ctx);
  ctx.restore();
}

function cpx(
  ctx: Ctx,
  x: number,
  y: number,
  w = 1,
  h = 1,
  fill: string = PAL.outline,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
}

function crect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  shade?: string,
  light?: string,
): void {
  cpx(ctx, x, y, w, h, fill);

  if (light) {
    cpx(ctx, x, y, w, 1, light);
    cpx(ctx, x, y, 1, h, light);
  }

  if (shade) {
    cpx(ctx, x, y + h - 1, w, 1, shade);
    cpx(ctx, x + w - 1, y, 1, h, shade);
  }
}

function faceEyes(ctx: Ctx, x1: number, x2: number, y: number): void {
  cpx(ctx, x1, y, 1, 1, PAL.outline);
  cpx(ctx, x2, y, 1, 1, PAL.outline);
}

function boarHead(
  ctx: Ctx,
  main: string,
  dark: string,
  light: string,
  options?: {
    tusks?: boolean;
    snout?: string;
  },
): void {
  const snout = options?.snout ?? '#e7c4a3';

  crect(ctx, -4, -9, 3, 2, main, dark, light);
  crect(ctx, 1, -9, 3, 2, main, dark, light);

  crect(ctx, -6, -7, 12, 8, main, dark, light);
  crect(ctx, -3, -1, 6, 4, snout, dark, PAL.ivory);

  faceEyes(ctx, -3, 2, -4);

  cpx(ctx, -1, 0, 1, 1, dark);
  cpx(ctx, 1, 0, 1, 1, dark);

  if (options?.tusks) {
    cpx(ctx, -4, 2, 1, 2, PAL.ivory);
    cpx(ctx, 3, 2, 1, 2, PAL.ivory);
  }
}

function acornIcon(ctx: Ctx): void {
  crect(ctx, -4, -8, 8, 4, PAL.brownDark, '#49301c', '#8a5a35');
  crect(ctx, -5, -4, 10, 10, PAL.brown, PAL.brownDark, PAL.brownLight);
  crect(ctx, -1, -11, 2, 3, PAL.green, PAL.greenDark, PAL.greenLight);
}

function mushroomIcon(ctx: Ctx): void {
  crect(ctx, -3, 0, 6, 5, PAL.ivory, PAL.ivoryShade, '#fffaf4');
  crect(ctx, -6, -6, 12, 5, PAL.red, PAL.redDark, PAL.redLight);
  cpx(ctx, -4, -5, 2, 2, '#ffe8ef');
  cpx(ctx, 2, -5, 2, 2, '#ffe8ef');
  cpx(ctx, -1, -3, 1, 1, '#ffe8ef');
}

function leafIcon(ctx: Ctx): void {
  crect(ctx, -4, -8, 8, 11, PAL.green, PAL.greenDark, PAL.greenLight);
  crect(ctx, 4, -9, 4, 8, PAL.greenLight, PAL.greenDark, '#b7f29b');
  cpx(ctx, 0, -7, 1, 11, '#d6ffd0');
}

function fireIcon(ctx: Ctx): void {
  crect(ctx, -3, 2, 6, 2, PAL.wood, PAL.woodDark, PAL.woodLight);
  crect(ctx, -2, -3, 4, 5, PAL.ember, PAL.emberDark, PAL.emberLight);
  crect(ctx, -1, -6, 2, 4, PAL.emberLight, '#ca9c22', '#fff4b8');
  cpx(ctx, -2, -4, 1, 1, PAL.ember);
  cpx(ctx, 1, -4, 1, 1, PAL.ember);
}

function tuskIcon(ctx: Ctx): void {
  crect(ctx, -6, 1, 12, 4, PAL.purple, PAL.purpleDark, PAL.purpleLight);
  crect(ctx, -4, -6, 3, 8, PAL.ivory, PAL.ivoryShade, '#fffaf2');
  crect(ctx, 1, -6, 3, 8, PAL.ivory, PAL.ivoryShade, '#fffaf2');
  cpx(ctx, -2, -7, 1, 1, PAL.gold);
  cpx(ctx, 3, -7, 1, 1, PAL.gold);
}

function crown(ctx: Ctx): void {
  crect(ctx, -6, -11, 12, 3, PAL.gold, PAL.goldDark, PAL.goldLight);
  cpx(ctx, -5, -13, 2, 2, PAL.goldLight);
  cpx(ctx, -1, -14, 2, 3, PAL.goldLight);
  cpx(ctx, 3, -13, 2, 2, PAL.goldLight);
}

function hunterHat(ctx: Ctx): void {
  crect(ctx, -7, -11, 14, 4, PAL.blue, PAL.blueDark, PAL.blueLight);
  crect(ctx, -4, -14, 8, 3, '#9f3d32', '#682219', '#d26e61');
}

function wildBadge(ctx: Ctx): void {
  crect(ctx, -8, -11, 16, 17, '#70d696', '#2f8f4e', '#d3ffe5');
  boarHead(ctx, PAL.pink, PAL.pinkDark, PAL.pinkLight, {
    snout: '#ffd5e3',
  });
  crect(ctx, -7, 3, 14, 3, PAL.gold, PAL.goldDark, PAL.goldLight);
}

function scatterFrame(ctx: Ctx): void {
  crect(ctx, -9, -10, 18, 18, '#fff0c8', '#d0a94c', '#fff8df');
  cpx(ctx, -8, -9, 16, 16, '#ffffff22');
}

function bonusFrame(ctx: Ctx): void {
  crect(ctx, -9, -10, 18, 18, '#efe4ff', '#9a78da', '#ffffff');
}

const drawById: Record<SymbolId, (ctx: Ctx) => void> = {
  ACORN: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(ctx, acornIcon, { scale: 1.22, offsetY: 1 });
  },

  MUSHROOM: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(ctx, mushroomIcon, { scale: 1.22, offsetY: 1 });
  },

  FOREST_LEAF: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(ctx, leafIcon, { scale: 1.22, offsetX: -0.2, offsetY: 1 });
  },

  BIG_BOAR: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(
      ctx,
      (inner) => boarHead(inner, PAL.brown, PAL.brownDark, PAL.brownLight, { tusks: true }),
      { scale: 1.24, offsetY: 1 },
    );
  },

  BOAR_HUNTER: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(
      ctx,
      (inner) => {
        hunterHat(inner);
        boarHead(inner, PAL.gray, PAL.grayDark, PAL.grayLight);
      },
      { scale: 1.22, offsetY: 2 },
    );
  },

  BOAR_KING: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(
      ctx,
      (inner) => {
        crown(inner);
        boarHead(inner, '#ba7b49', PAL.brownDark, '#d9a271', { tusks: true });
      },
      { scale: 1.22, offsetY: 2 },
    );
  },

  WILD_PIGLET: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(ctx, wildBadge, { scale: 1.2, offsetY: 1.5 });
  },

  SCATTER_FIRE: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(
      ctx,
      (inner) => {
        scatterFrame(inner);
        fireIcon(inner);
      },
      { scale: 1.18, offsetY: 1 },
    );
  },

  BONUS_TUSK: (ctx) => {
    setup(ctx);
    panel(ctx);
    withSymbolTransform(
      ctx,
      (inner) => {
        bonusFrame(inner);
        tuskIcon(inner);
      },
      { scale: 1.18, offsetY: 1.5 },
    );
  },
};

function makeTexture(id: SymbolId): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context');
  }

  drawById[id](ctx);

  const tex = Texture.from(canvas);
  const src = tex.source;

  if (src) {
    src.scaleMode = 'nearest';
    if (typeof src.update === 'function') {
      src.update();
    }
  }

  return tex;
}

export function getPixelSymbolTexture(id: SymbolId): Texture {
  let t = cache.get(id);
  if (!t) {
    t = makeTexture(id);
    cache.set(id, t);
  }
  return t;
}

const ALL_IDS: SymbolId[] = [
  'ACORN',
  'MUSHROOM',
  'FOREST_LEAF',
  'BIG_BOAR',
  'BOAR_HUNTER',
  'BOAR_KING',
  'WILD_PIGLET',
  'SCATTER_FIRE',
  'BONUS_TUSK',
];

export function preloadAllSymbolTextures(): void {
  for (const id of ALL_IDS) {
    getPixelSymbolTexture(id);
  }
}