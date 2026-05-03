export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // No external assets — all textures generated in-code.
    // Could load audio here in future.
  }

  create() {
    this.scene.start('GameScene');
  }
}
