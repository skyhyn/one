import {
  STONE_TIERS, STONE_RADIUS,
  PLAY_AREA_TOP, PLAY_AREA_BOTTOM,
  GAME_WIDTH,
} from '../constants.js';

let _nextId = 0;

function darken(hex) {
  const r = Math.floor(((hex >> 16) & 0xff) * 0.65);
  const g = Math.floor(((hex >>  8) & 0xff) * 0.65);
  const b = Math.floor((hex & 0xff) * 0.65);
  return (r << 16) | (g << 8) | b;
}

export class MediumStone {
  /** @param {Phaser.Scene} scene */
  constructor(scene, x, y, tier) {
    this.scene  = scene;
    this.id     = _nextId++;
    this.x      = x;
    this.y      = y;
    this.tier   = tier;

    const cfg    = STONE_TIERS[tier];
    this.hp      = cfg.hp;
    this.maxHp   = cfg.hp;
    this.color   = cfg.color;
    this.drops   = cfg.drops;
    this.radius  = STONE_RADIUS;
    this._alive  = true;
    this._flashAlpha = 1;

    // Scatter outward from spawn point
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const spd   = Phaser.Math.Between(130, 310);
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd - 60; // slight upward bias

    this._gfx = scene.add.graphics();
    this._render();
  }

  update(delta) {
    if (!this._alive) return;
    const dt = delta / 1000;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Exponential drag — stones slow to near-stop
    const drag = Math.pow(0.88, dt * 4);
    this.vx *= drag;
    this.vy *= drag;

    // Wall bouncing
    const R = this.radius;
    if (this.x - R < 0)           { this.x = R;                this.vx =  Math.abs(this.vx) * 0.65; }
    if (this.x + R > GAME_WIDTH)  { this.x = GAME_WIDTH - R;   this.vx = -Math.abs(this.vx) * 0.65; }
    if (this.y - R < PLAY_AREA_TOP)    { this.y = PLAY_AREA_TOP + R;    this.vy =  Math.abs(this.vy) * 0.65; }
    if (this.y + R > PLAY_AREA_BOTTOM) { this.y = PLAY_AREA_BOTTOM - R; this.vy = -Math.abs(this.vy) * 0.65; }

    this._render();
  }

  _render() {
    const g = this._gfx;
    g.clear();

    const { x, y, radius, color, hp, maxHp, _flashAlpha } = this;

    // Shadow
    g.fillStyle(0x000000, 0.25 * _flashAlpha);
    g.fillEllipse(x + 4, y + radius - 2, radius * 1.8, 9);

    // Stone body
    g.fillStyle(color, _flashAlpha);
    g.fillCircle(x, y, radius);

    // Dark border for depth
    g.lineStyle(2.5, darken(color), 0.85 * _flashAlpha);
    g.strokeCircle(x, y, radius);

    // Inner highlight
    g.fillStyle(0xffffff, 0.22 * _flashAlpha);
    g.fillCircle(x - radius * 0.3, y - radius * 0.32, radius * 0.28);

    // HP bar (only when damaged)
    if (hp < maxHp) {
      const bw = radius * 1.8;
      const bx = x - bw / 2;
      const by = y - radius - 10;
      g.fillStyle(0x222222, 0.75);
      g.fillRect(bx, by, bw, 5);
      g.fillStyle(color);
      g.fillRect(bx, by, bw * (hp / maxHp), 5);
    }
  }

  /** @returns {boolean} true if stone was destroyed */
  takeDamage(amount = 1) {
    if (!this._alive) return false;
    this.hp -= amount;

    // Flash white
    this._flashAlpha = 0.35;
    this.scene.tweens.add({
      targets: this,
      _flashAlpha: 1,
      duration: 100,
      ease: 'Linear',
    });

    if (this.hp <= 0) {
      this._destroyWithAnim();
      return true;
    }
    return false;
  }

  _destroyWithAnim() {
    this._alive = false;
    this.scene.tweens.add({
      targets: this._gfx,
      scaleX: 1.7, scaleY: 1.7, alpha: 0,
      duration: 220,
      ease: 'Quad.Out',
      onComplete: () => this._gfx.destroy(),
    });
    // Burst sparks
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const spark = this.scene.add.graphics();
      spark.fillStyle(this.color, 0.9);
      spark.fillCircle(0, 0, 5);
      spark.x = this.x;
      spark.y = this.y;
      this.scene.tweens.add({
        targets: spark,
        x: this.x + Math.cos(angle) * 45,
        y: this.y + Math.sin(angle) * 45,
        alpha: 0, scaleX: 0.4, scaleY: 0.4,
        duration: 280,
        ease: 'Quad.Out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  get alive() { return this._alive; }
}
