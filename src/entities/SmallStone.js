import {
  SMALL_STONE_RADIUS, SMALL_STONE_LIFETIME,
  PLAY_AREA_BOTTOM, HUD_HEIGHT, GAME_WIDTH,
} from '../constants.js';

export class SmallStone {
  /** @param {Phaser.Scene} scene */
  constructor(scene, x, y) {
    this.scene  = scene;
    this.x      = x;
    this.y      = y;
    this._alive = true;

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const spd   = Phaser.Math.Between(50, 140);
    this.vx = Math.cos(angle) * spd;
    this.vy = Math.sin(angle) * spd;

    this._gfx = scene.add.graphics();
    this._render();

    // Fade out near end of lifetime
    scene.time.delayedCall(SMALL_STONE_LIFETIME - 800, () => {
      if (!this._alive) return;
      scene.tweens.add({
        targets: this._gfx,
        alpha: 0,
        duration: 800,
        onComplete: () => this.destroy(),
      });
    });
  }

  update(delta) {
    if (!this._alive) return;
    const dt   = delta / 1000;
    const drag = Math.pow(0.80, dt * 4);

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= drag;
    this.vy *= drag;

    const R = SMALL_STONE_RADIUS;
    if (this.x - R < 0)           { this.x = R;                this.vx =  Math.abs(this.vx) * 0.5; }
    if (this.x + R > GAME_WIDTH)  { this.x = GAME_WIDTH - R;   this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y - R < HUD_HEIGHT)  { this.y = HUD_HEIGHT + R;   this.vy =  Math.abs(this.vy) * 0.5; }
    if (this.y + R > PLAY_AREA_BOTTOM) { this.y = PLAY_AREA_BOTTOM - R; this.vy = -Math.abs(this.vy) * 0.5; }

    this._render();
  }

  _render() {
    this._gfx.clear();
    this._gfx.fillStyle(0xddccbb, 0.9);
    this._gfx.fillCircle(this.x, this.y, SMALL_STONE_RADIUS);
    this._gfx.fillStyle(0xffffff, 0.3);
    this._gfx.fillCircle(this.x - 2, this.y - 2, SMALL_STONE_RADIUS * 0.3);
  }

  get alive() { return this._alive; }

  destroy() {
    if (!this._alive) return;
    this._alive = false;
    this._gfx.destroy();
  }
}
