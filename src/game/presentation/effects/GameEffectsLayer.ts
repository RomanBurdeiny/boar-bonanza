import { Container, Graphics, Ticker } from 'pixi.js';
import { appConfig } from '../../../app/config/appConfig';

interface Particle {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export class GameEffectsLayer extends Container {
  private readonly dim: Graphics;
  private readonly particles: Particle[] = [];
  private readonly driverBound = (t: Ticker): void => this.updateParticles(t);
  private driverActive = false;

  constructor() {
    super();
    const { width, height } = appConfig.canvas;
    this.dim = new Graphics();
    this.dim.eventMode = 'none';
    this.dim.rect(0, 0, width, height);
    this.dim.fill({ color: 0x000000, alpha: 0 });
    this.dim.visible = false;
    this.addChild(this.dim);
  }

  setDimAlpha(alpha: number): void {
    if (alpha <= 0.01) {
      this.dim.visible = false;
      return;
    }
    this.dim.visible = true;
    this.dim.clear();
    this.dim.rect(0, 0, appConfig.canvas.width, appConfig.canvas.height);
    this.dim.fill({ color: 0x0a0800, alpha: Math.min(0.72, alpha) });
  }

  burst(cx: number, cy: number, color: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 100;
      const radius = 1.5 + Math.random() * 3;
      const g = new Graphics();
      g.circle(0, 0, radius);
      g.fill({ color, alpha: 0.85 });
      g.position.set(cx, cy);
      this.addChild(g);

      const life = 350 + Math.random() * 350;
      this.particles.push({
        g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        gravity: 40 + Math.random() * 30,
      });
    }
    this.ensureDriver();
  }

  private ensureDriver(): void {
    if (!this.driverActive) {
      this.driverActive = true;
      Ticker.shared.add(this.driverBound);
    }
  }

  private updateParticles(t: Ticker): void {
    const dt = t.deltaMS / 1000;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= t.deltaMS;
      if (p.life <= 0) {
        p.g.destroy();
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.vx *= 0.98;
      p.g.position.x += p.vx * dt;
      p.g.position.y += p.vy * dt;
      const frac = p.life / p.maxLife;
      p.g.alpha = frac * 0.85;
      p.g.scale.set(0.3 + frac * 0.7);
    }
    if (this.particles.length === 0) {
      Ticker.shared.remove(this.driverBound);
      this.driverActive = false;
    }
  }
}
