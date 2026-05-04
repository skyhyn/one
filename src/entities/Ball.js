import {
  BALL_RADIUS, GAME_WIDTH, HUD_HEIGHT, PLAYER_Y,
} from '../constants.js';

// Tier colors for weapon-tinted balls
const BALL_COLORS = [0xffffff, 0xddffdd, 0xaaddff, 0xffee88];

export class Ball {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x  spawn X
   * @param {number} y  spawn Y
   * @param {number} vx velocity X (px/s)
   * @param {number} vy velocity Y (px/s)
   * @param {number} bouncesLeft  how many more stone-hits before destruction
   * @param {number} weaponTier   cosmetic tint
   */
  constructor(scene, x, y, vx, vy, bouncesLeft, weaponTier = 0) {
    this.scene         = scene;
    this.x             = x;
    this.y             = y;
    this.vx            = vx;
    this.vy            = vy;
    this.bouncesLeft   = bouncesLeft;
    this._color        = BALL_COLORS[Math.min(weaponTier, BALL_COLORS.length - 1)];
    this._alive        = true;
    this._hitCooldowns = new Map(); // stone.id → timestamp

    this._gfx = scene.add.graphics();
    this._render();
  }

  update(delta) {
    if (!this._alive) return;
    const dt = delta / 1000;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const R = BALL_RADIUS;

    // Wall bouncing (free — doesn't consume bouncesLeft)
    if (this.x - R < 0)           { this.x = R;                this.vx =  Math.abs(this.vx); }
    if (this.x + R > GAME_WIDTH)  { this.x = GAME_WIDTH - R;   this.vx = -Math.abs(this.vx); }
    if (this.y - R < HUD_HEIGHT)  { this.y = HUD_HEIGHT + R;   this.vy =  Math.abs(this.vy); }

    // Ball falls past player → destroy
    if (this.y > PLAYER_Y + 40) {
      this.destroy();
      return;
    }

    this._render();
  }

  /**
   * Try to collide with a medium stone.
   * @param {MediumStone} stone
   * @returns {boolean} true if a hit was registered
   */
  tryHit(stone) {
    if (!this._alive || !stone.alive) return false;

    // Per-stone cooldown: prevent multi-hit in same pass
    const now = this.scene.time.now;
    const last = this._hitCooldowns.get(stone.id) ?? 0;
    if (now - last < 250) return false;

    const dx   = this.x - stone.x;
    const dy   = this.y - stone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > BALL_RADIUS + stone.radius) return false;

    // Register hit
    this._hitCooldowns.set(stone.id, now);

    // Reflect ball off stone surface (normal from stone-center → ball-center)
    const nx  = dx / dist;
    const ny  = dy / dist;
    const dot = this.vx * nx + this.vy * ny;
    this.vx   = this.vx - 2 * dot * nx;
    this.vy   = this.vy - 2 * dot * ny;

    // Push ball outside the stone to prevent sticking
    this.x = stone.x + nx * (BALL_RADIUS + stone.radius + 1);
    this.y = stone.y + ny * (BALL_RADIUS + stone.radius + 1);

    this.bouncesLeft--;
    if (this.bouncesLeft < 0) {
      this.destroy();
    }

    return true;
  }

  _render() {
    const g = this._gfx;
    g.clear();
    const { x, y } = this;
    const R = BALL_RADIUS;

    // Glow halo
    g.fillStyle(this._color, 0.18);
    g.fillCircle(x, y, R + 5);

    // Ball body
    g.fillStyle(this._color, 0.95);
    g.fillCircle(x, y, R);

    // Specular highlight
    g.fillStyle(0xffffff, 0.55);
    g.fillCircle(x - R * 0.32, y - R * 0.35, R * 0.32);
  }

  get alive() { return this._alive; }

  destroy() {
    if (!this._alive) return;
    this._alive = false;
    // Pop burst
    this.scene.tweens.add({
      targets: this._gfx,
      scaleX: 2.2, scaleY: 2.2, alpha: 0,
      duration: 140,
      ease: 'Quad.Out',
      onComplete: () => this._gfx.destroy(),
    });
  }
}
