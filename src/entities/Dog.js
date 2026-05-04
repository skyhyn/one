import { COLOR_DOG, SMALL_STONE_RADIUS } from '../constants.js';
import { SaveManager } from '../utils/SaveManager.js';

const COLLECT_DIST = SMALL_STONE_RADIUS + 14;
const ARRIVE_DIST  = 18;
const BODY_R       = 10;

export class Dog {
  /**
   * @param {Phaser.Scene}    scene
   * @param {Player}          player
   * @param {UpgradeSystem}   upgrades
   * @param {(n:number)=>void} onCollect
   */
  constructor(scene, player, upgrades, onCollect) {
    this.scene     = scene;
    this.player    = player;
    this.upgrades  = upgrades;
    this.onCollect = onCollect;

    if (!scene.textures.exists('dog2')) _buildTexture(scene);

    this.sprite = scene.physics.add.image(
      player.x + 35, player.y, 'dog2'
    );
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.allowGravity = false;
  }

  get body() { return this.sprite; }
  get x()    { return this.sprite.x; }
  get y()    { return this.sprite.y; }

  /**
   * @param {SmallStone[]} smallStones  live list from GameScene
   */
  update(smallStones) {
    const speed  = this.upgrades.get('dogSpeed');
    const radius = this.upgrades.get('dogRadius');
    const magnet = this.upgrades.get('dogMagnet');

    // Magnet: pull nearby small stones toward dog
    if (magnet) {
      for (const s of smallStones) {
        if (!s.alive) continue;
        const d = _dist(this, s);
        if (d < radius * 1.5 && d > 5) {
          const angle = Math.atan2(this.y - s.y, this.x - s.x);
          s.x += Math.cos(angle) * 10;
          s.y += Math.sin(angle) * 10;
        }
      }
    }

    // Find nearest small stone within radius
    let nearest = null, nearDist = radius;
    for (const s of smallStones) {
      if (!s.alive) continue;
      const d = _dist(this, s);
      if (d < nearDist) { nearDist = d; nearest = s; }
    }

    // Move toward nearest stone, or follow player
    const target = nearest ?? { x: this.player.x, y: this.player.y };
    _moveToward(this.sprite, target, speed);

    // Face movement direction
    const vx = this.sprite.body.velocity.x;
    if (Math.abs(vx) > 15) this.sprite.setFlipX(vx < 0);

    // Collect stones that are close enough
    for (const s of smallStones) {
      if (!s.alive) continue;
      if (_dist(this, s) < COLLECT_DIST) {
        s.destroy();
        SaveManager.addFragments(1);
        if (this.onCollect) this.onCollect(1);
      }
    }
  }

  destroy() { this.sprite.destroy(); }
}

function _dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function _moveToward(sprite, target, speed) {
  const dx = target.x - sprite.x;
  const dy = target.y - sprite.y;
  const d  = Math.sqrt(dx * dx + dy * dy);
  if (d < ARRIVE_DIST) { sprite.setVelocity(0, 0); return; }
  sprite.setVelocity((dx / d) * speed, (dy / d) * speed);
}

function _buildTexture(scene) {
  const r = BODY_R;
  const g = scene.make.graphics({ add: false });

  // Body (oval)
  g.fillStyle(COLOR_DOG);
  g.fillEllipse(r, r + 3, r * 1.9, r * 1.4);

  // Head
  g.fillStyle(COLOR_DOG);
  g.fillCircle(r * 1.65, r - 1, r * 0.85);

  // Ears
  g.fillStyle(0xb87830);
  g.fillEllipse(r * 1.35, r - 9, 9, 12);
  g.fillEllipse(r * 2.1,  r - 9, 9, 12);

  // Eye
  g.fillStyle(0x333333);
  g.fillCircle(r * 1.85, r - 2, 2.5);

  // Nose
  g.fillStyle(0x333333);
  g.fillCircle(r * 2.15, r + 2, 2);

  // Tail
  g.lineStyle(3, 0xb87830, 1);
  g.beginPath();
  g.arc(r * 0.15, r + 2, 11, -0.6, 0.7);
  g.strokePath();

  g.generateTexture('dog2', r * 3, r * 2 + 6);
  g.destroy();
}
