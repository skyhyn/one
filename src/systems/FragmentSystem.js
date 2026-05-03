import {
  FRAGMENT_LIFETIME,
  FRAGMENT_SCATTER_MIN,
  FRAGMENT_SCATTER_MAX,
  COLOR_FRAGMENT,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../constants.js';

const FRAGMENT_RADIUS = 7;

export class FragmentSystem {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
  }

  spawn(originX, originY, count) {
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist  = Phaser.Math.Between(FRAGMENT_SCATTER_MIN, FRAGMENT_SCATTER_MAX);
      const tx    = Phaser.Math.Clamp(originX + Math.cos(angle) * dist, 30, GAME_WIDTH  - 30);
      const ty    = Phaser.Math.Clamp(originY + Math.sin(angle) * dist, 80, GAME_HEIGHT - 30);

      const frag = this._createFragment(originX, originY);

      // Fly out and land
      this.scene.tweens.add({
        targets:  frag,
        x:        tx,
        y:        ty,
        duration: Phaser.Math.Between(180, 320),
        ease:     'Cubic.Out',
        onComplete: () => {
          if (!frag.active) return;
          // Fade out after lifetime
          this.scene.time.delayedCall(FRAGMENT_LIFETIME, () => {
            if (!frag.active) return;
            this.scene.tweens.add({
              targets:  frag,
              alpha:    0,
              duration: 600,
              onComplete: () => this._recycle(frag),
            });
          });
        },
      });
    }
  }

  _createFragment(x, y) {
    // Reuse from group if a dead one exists
    const existing = this.group.getFirstDead(false);
    if (existing) {
      existing.setActive(true).setVisible(true).setAlpha(1);
      existing.setPosition(x, y);
      existing.body.reset(x, y);
      return existing;
    }

    // Draw circle texture once
    if (!this.scene.textures.exists('fragment')) {
      const g = this.scene.make.graphics({ add: false });
      g.fillStyle(COLOR_FRAGMENT);
      g.fillCircle(FRAGMENT_RADIUS, FRAGMENT_RADIUS, FRAGMENT_RADIUS);
      g.generateTexture('fragment', FRAGMENT_RADIUS * 2, FRAGMENT_RADIUS * 2);
      g.destroy();
    }

    const frag = this.scene.physics.add.image(x, y, 'fragment');
    this.group.add(frag);
    return frag;
  }

  _recycle(frag) {
    frag.setActive(false).setVisible(false);
  }

  get activeFragments() {
    return this.group.getChildren().filter(f => f.active);
  }

  clear() {
    this.group.getChildren().forEach(f => this._recycle(f));
  }
}
