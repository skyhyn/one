import {
  PLAYER_START_X, PLAYER_Y,
  COLOR_PLAYER, GAME_WIDTH,
} from '../constants.js';

const BODY_R = 15;

export class Player {
  /**
   * @param {Phaser.Scene}  scene
   * @param {UpgradeSystem} upgrades
   */
  constructor(scene, upgrades) {
    this.scene    = scene;
    this.upgrades = upgrades;
    this._lastThrow = -99999;

    if (!scene.textures.exists('player2')) _buildTexture(scene);

    this.sprite = scene.physics.add.image(PLAYER_START_X, PLAYER_Y, 'player2');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.allowGravity = false;
  }

  get body()  { return this.sprite; }
  get x()     { return this.sprite.x; }
  get y()     { return this.sprite.y; }

  /** Called every frame. keys = { left, right, a, d } (Phaser Key objects). */
  update(keys) {
    const speed = this.upgrades.get('playerSpeed');
    let vx = 0;
    if (keys.left.isDown || keys.a.isDown)  vx = -speed;
    if (keys.right.isDown || keys.d.isDown) vx =  speed;

    this.sprite.setVelocityX(vx);
    this.sprite.setVelocityY(0);

    if (vx < 0) this.sprite.setFlipX(true);
    else if (vx > 0) this.sprite.setFlipX(false);
  }

  canThrow() {
    const cd = this.upgrades.get('throwCooldown');
    return (this.scene.time.now - this._lastThrow) >= cd;
  }

  /**
   * Returns an array of {vx, vy, bouncesLeft} ball descriptors, or null if on cooldown.
   * @param {number} mx  mouse world X
   * @param {number} my  mouse world Y
   */
  buildThrow(mx, my) {
    if (!this.canThrow()) return null;
    this._lastThrow = this.scene.time.now;

    const dx = mx - this.x;
    let   dy = my - this.y;
    // Force upward — prevent shooting downward
    if (dy > -30) dy = -30;

    const len   = Math.sqrt(dx * dx + dy * dy);
    const nx    = dx / len;
    const ny    = dy / len;
    const speed = this.upgrades.get('ballSpeed');
    const bounces = this.upgrades.get('ballBounces');
    const count   = this.upgrades.get('ballCount');

    // Throw animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.25, scaleX: 0.8,
      duration: 70, yoyo: true,
    });

    const balls = [];
    for (let i = 0; i < count; i++) {
      // Spread angle for multi-ball (±12° total)
      const spread = count > 1 ? ((i / (count - 1)) - 0.5) * 0.42 : 0;
      const cos    = Math.cos(spread);
      const sin    = Math.sin(spread);
      balls.push({
        vx: (nx * cos - ny * sin) * speed,
        vy: (nx * sin + ny * cos) * speed,
        bouncesLeft: bounces,
      });
    }
    return balls;
  }

  destroy() { this.sprite.destroy(); }
}

function _buildTexture(scene) {
  const r = BODY_R;
  const g = scene.make.graphics({ add: false });

  // Shadow
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(r, r * 2 + 2, r * 1.7, 7);

  // Body
  g.fillStyle(COLOR_PLAYER);
  g.fillCircle(r, r, r);

  // Eyes
  g.fillStyle(0x333333);
  g.fillCircle(r - 5, r - 2, 3);
  g.fillCircle(r + 5, r - 2, 3);

  // Smile
  g.fillStyle(0x333333);
  g.fillRect(r - 4, r + 4, 8, 2);
  g.fillRect(r - 5, r + 3, 2, 2);
  g.fillRect(r + 3,  r + 3, 2, 2);

  // Rosy cheeks
  g.fillStyle(0xff9999, 0.55);
  g.fillCircle(r - 10, r,     4);
  g.fillCircle(r + 10, r,     4);

  // Headband (tiny stripe)
  g.fillStyle(0xff6655, 0.75);
  g.fillRect(r - r, r - r + 3, r * 2, 3);

  g.generateTexture('player2', r * 2, r * 2 + 4);
  g.destroy();
}
