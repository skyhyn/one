import {
  PLAYER_START_X, PLAYER_START_Y,
  PLAYER_BASE_SPEED,
  COLOR_PLAYER,
  STONE_X, STONE_Y,
  GAME_WIDTH, GAME_HEIGHT,
} from '../constants.js';

const BODY_R  = 14;
const THROW_DURATION = 200;

export class Player {
  /**
   * @param {Phaser.Scene}   scene
   * @param {UpgradeSystem}  upgrades
   */
  constructor(scene, upgrades) {
    this.scene    = scene;
    this.upgrades = upgrades;
    this._facing  = 1; // 1=right, -1=left

    // Build texture once
    if (!scene.textures.exists('player')) {
      _buildPlayerTexture(scene);
    }

    this.sprite = scene.physics.add.image(PLAYER_START_X, PLAYER_START_Y, 'player');
    this.sprite.setCollideWorldBounds(true);

    // Visual for thrown projectile
    this._projectileGfx = null;
  }

  get body() { return this.sprite; }

  /** Called every frame from GameScene.update */
  update(cursors, wasd) {
    const speed = this.upgrades.get('playerSpeed');
    const vx = _axis(cursors.left.isDown || wasd.left.isDown,
                     cursors.right.isDown || wasd.right.isDown);
    const vy = _axis(cursors.up.isDown   || wasd.up.isDown,
                     cursors.down.isDown  || wasd.down.isDown);

    this.sprite.setVelocity(vx * speed, vy * speed);

    if (vx !== 0) {
      this._facing = vx > 0 ? 1 : -1;
      this.sprite.setFlipX(this._facing < 0);
    }
  }

  /** Called by AttackSystem on each attack tick */
  playThrowAnim(weaponTier) {
    // Quick scale-pulse
    this.scene.tweens.add({
      targets:  this.sprite,
      scaleX:   1.25,
      scaleY:   0.85,
      duration: 80,
      yoyo:     true,
      ease:     'Quad.InOut',
    });

    // Spawn a projectile that flies to the stone
    this._spawnProjectile(weaponTier);
  }

  _spawnProjectile(weaponTier) {
    const colors  = [0xaaaaaa, 0x888888, 0x555555, 0xff4400];
    const sizes   = [5, 5, 7, 8];
    const color   = colors[Math.min(weaponTier, colors.length - 1)];
    const size    = sizes[Math.min(weaponTier, sizes.length - 1)];

    const g = this.scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, size);
    g.x = this.sprite.x;
    g.y = this.sprite.y;

    // Add trail effect for higher tiers
    if (weaponTier >= 2) {
      g.lineStyle(2, 0xffcc44, 0.6);
      g.strokeCircle(0, 0, size + 3);
    }

    this.scene.tweens.add({
      targets:  g,
      x:        STONE_X,
      y:        STONE_Y,
      duration: THROW_DURATION,
      ease:     'Quad.In',
      onComplete: () => g.destroy(),
    });
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  destroy() { this.sprite.destroy(); }
}

function _axis(neg, pos) {
  return pos ? 1 : neg ? -1 : 0;
}

function _buildPlayerTexture(scene) {
  const r = BODY_R;
  const g = scene.make.graphics({ add: false });

  // Shadow (kept within texture bounds)
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(r, r * 2, r * 1.6, 6);

  // Body (rice ball shape — rounded)
  g.fillStyle(COLOR_PLAYER);
  g.fillCircle(r, r, r);

  // Eyes
  g.fillStyle(0x333333);
  g.fillCircle(r - 5, r - 2, 3);
  g.fillCircle(r + 5, r - 2, 3);

  // Mouth
  g.fillStyle(0x333333);
  g.fillRect(r - 3, r + 4, 6, 2);

  // Rosy cheeks
  g.fillStyle(0xff9999, 0.6);
  g.fillCircle(r - 9, r + 1, 4);
  g.fillCircle(r + 9, r + 1, 4);

  g.generateTexture('player', r * 2, r * 2 + 4);
  g.destroy();
}
