import { NPC_X, NPC_Y } from '../constants.js';

const ARM_W = 22;
const HAMMER_W = 14;
const HAMMER_H = 22;

export class NPC {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene  = scene;
    this._gfx   = scene.add.graphics();
    this._swing = false;
    this._draw();
  }

  /** Play swing animation then call onSwing callback. */
  doSwing(onSwing) {
    if (this._swinging) return;
    this._swinging = true;
    this._swing = true;
    this._draw();

    // Camera micro-shake on impact
    this.scene.time.delayedCall(160, () => {
      this.scene.cameras.main.shake(80, 0.004);
      if (onSwing) onSwing();
    });
    this.scene.time.delayedCall(300, () => {
      this._swing = false;
      this._swinging = false;
      this._draw();
    });
  }

  _draw() {
    const g = this._gfx;
    g.clear();

    const x = NPC_X, y = NPC_Y;

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x + 2, y + 26, 28, 8);

    // Body (rice-ball style, matching player aesthetic)
    g.fillStyle(0xf5e6c8);
    g.fillCircle(x, y - 16, 13);       // head
    g.fillStyle(0x6633aa);              // purple outfit (distinguishes from player)
    g.fillRoundedRect(x - 9, y - 4, 18, 18, 4); // torso

    // Eyes
    g.fillStyle(0x333333);
    g.fillCircle(x - 4, y - 18, 3);
    g.fillCircle(x + 4, y - 18, 3);

    // Cheeks
    g.fillStyle(0xff9999, 0.5);
    g.fillCircle(x - 10, y - 14, 4);
    g.fillCircle(x + 10, y - 14, 4);

    if (this._swing) {
      // Arm extended downward (swinging)
      g.fillStyle(0xf5e6c8);
      g.fillRect(x + 8, y - 2, ARM_W, 5);     // arm right
      g.fillStyle(0x777777);
      g.fillRoundedRect(x + 8 + ARM_W - 2, y - 12, HAMMER_W, HAMMER_H, 3);
    } else {
      // Arm raised (winding up)
      g.fillStyle(0xf5e6c8);
      g.fillRect(x + 8, y - 20, ARM_W, 5);    // arm raised right
      g.fillStyle(0x777777);
      g.fillRoundedRect(x + 8 + ARM_W - 2, y - 34, HAMMER_W, HAMMER_H, 3);
    }
  }

  destroy() { this._gfx.destroy(); }
}
