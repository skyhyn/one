import { STONE_X, STONE_Y, COLOR_STONE, COLOR_STONE_HI } from '../constants.js';

const STONE_W = 90;
const STONE_H = 80;

export class Stone {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    // Base stone graphic
    this._gfx = scene.add.graphics();
    this._draw(0);

    // Crack overlay (drawn on demand)
    this._crackGfx = scene.add.graphics();
    this._crackLevel = 0;
  }

  /** Shake + crack anim, called on every attack hit */
  hit(weaponTier = 0) {
    scene_shake(this.scene, 3);

    // Tween shake (relative offset so it works regardless of draw position)
    this.scene.tweens.add({
      targets:  [this._gfx, this._crackGfx],
      x:        '+=6',
      duration: 40,
      yoyo:     true,
      repeat:   1,
      onComplete: () => {
        this._gfx.x      = 0;
        this._crackGfx.x = 0;
      },
    });

    // Emit hit particles (small sparks)
    this._emitSparks(weaponTier);
  }

  _draw(crackLevel) {
    const g = this._gfx;
    g.clear();

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(STONE_X + 6, STONE_Y + STONE_H / 2 + 6, STONE_W - 10, 20);

    // Main body
    g.fillStyle(COLOR_STONE);
    g.fillRoundedRect(STONE_X - STONE_W / 2, STONE_Y - STONE_H / 2, STONE_W, STONE_H, 14);

    // Highlight
    g.fillStyle(COLOR_STONE_HI, 0.5);
    g.fillRoundedRect(STONE_X - STONE_W / 2 + 8, STONE_Y - STONE_H / 2 + 8, 28, 14, 6);
  }

  _emitSparks(weaponTier) {
    const count = 3 + weaponTier * 2;
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist  = Phaser.Math.Between(20, 50);
      const spark = this.scene.add.graphics();
      spark.fillStyle(0xffe066, 1);
      spark.fillCircle(0, 0, 3);
      spark.x = STONE_X;
      spark.y = STONE_Y;
      this.scene.tweens.add({
        targets:  spark,
        x:        STONE_X + Math.cos(angle) * dist,
        y:        STONE_Y + Math.sin(angle) * dist,
        alpha:    0,
        duration: 250,
        ease:     'Cubic.Out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  destroy() {
    this._gfx.destroy();
    this._crackGfx.destroy();
  }
}

function scene_shake(scene, intensity) {
  scene.cameras.main.shake(120, intensity / 1000);
}
