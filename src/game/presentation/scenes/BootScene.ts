import { Container, Text } from 'pixi.js';

/** Optional splash — MVP loads straight into `GameScene` */
export class BootScene extends Container {
  constructor() {
    super();
    this.addChild(
      new Text({
        text: 'Boar Bonanza',
        style: { fill: 0xe8d8c8, fontSize: 28 },
        position: { x: 120, y: 120 },
      }),
    );
  }
}
