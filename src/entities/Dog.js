import { COLOR_DOG } from '../constants.js';

const BODY_R = 10;
const ARRIVE_DIST = 20; // px — stop moving when this close to target

export class Dog {
  /**
   * @param {Phaser.Scene}    scene
   * @param {Player}          player
   * @param {UpgradeSystem}   upgrades
   * @param {FragmentSystem}  fragmentSystem
   */
  constructor(scene, player, upgrades, fragmentSystem) {
    this.scene          = scene;
    this.player         = player;
    this.upgrades       = upgrades;
    this.fragmentSystem = fragmentSystem;

    if (!scene.textures.exists('dog')) {
      _buildDogTexture(scene);
    }

    this.sprite = scene.physics.add.image(
      player.x + 30,
      player.y + 20,
      'dog'
    );
    this.sprite.setCollideWorldBounds(true);
  }

  get body() { return this.sprite; }

  update() {
    const speed  = this.upgrades.get('dogSpeed');
    const radius = this.upgrades.get('dogRadius');
    const magnet = this.upgrades.get('dogMagnet');

    // Magnet ability: pull nearby fragments toward dog
    if (magnet) {
      this._magnetPull(radius * 1.5);
    }

    const target = this._findTarget(radius);
    scene_moveTo(this.scene, this.sprite, target, speed);

    // Flip sprite to face direction of travel
    const vx = this.sprite.body.velocity.x;
    if (Math.abs(vx) > 10) this.sprite.setFlipX(vx < 0);
  }

  _findTarget(radius) {
    // Look for nearest fragment within radius
    const frags = this.fragmentSystem.activeFragments;
    let nearest = null;
    let nearDist = radius;

    for (const f of frags) {
      const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, f.x, f.y);
      if (d < nearDist) { nearDist = d; nearest = f; }
    }

    return nearest ?? this.player.sprite;
  }

  _magnetPull(radius) {
    const frags = this.fragmentSystem.activeFragments;
    for (const f of frags) {
      const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, f.x, f.y);
      if (d < radius && d > 5) {
        const angle = Phaser.Math.Angle.Between(f.x, f.y, this.sprite.x, this.sprite.y);
        f.x += Math.cos(angle) * 8;
        f.y += Math.sin(angle) * 8;
        if (f.body) f.body.reset(f.x, f.y);
      }
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  destroy() { this.sprite.destroy(); }
}

function scene_moveTo(scene, sprite, target, speed) {
  const dx = target.x - sprite.x;
  const dy = target.y - sprite.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < ARRIVE_DIST) {
    sprite.setVelocity(0);
    return;
  }
  sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
}

function _buildDogTexture(scene) {
  const r = BODY_R;
  const g = scene.make.graphics({ add: false });

  // Body
  g.fillStyle(COLOR_DOG);
  g.fillEllipse(r, r + 2, r * 1.8, r * 1.4);

  // Head
  g.fillCircle(r * 1.6, r - 2, r * 0.8);

  // Ears
  g.fillStyle(0xb87830);
  g.fillEllipse(r * 1.4, r - 8, 8, 10);
  g.fillEllipse(r * 2.1, r - 8, 8, 10);

  // Eye
  g.fillStyle(0x333333);
  g.fillCircle(r * 1.8, r - 3, 2);

  // Nose
  g.fillStyle(0x333333);
  g.fillCircle(r * 2.1, r, 2);

  // Tail (wagging arc)
  g.lineStyle(3, 0xb87830, 1);
  g.beginPath();
  g.arc(r * 0.2, r, 10, -0.5, 0.8);
  g.strokePath();

  g.generateTexture('dog', r * 3, r * 2 + 4);
  g.destroy();
}
