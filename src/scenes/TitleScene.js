import { GAME_WIDTH, GAME_HEIGHT, COLOR_BTN, STONE_TIERS } from '../constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d1a0d);
    bg.fillRect(0, 0, W, H);
    bg.fillStyle(0x1a3520, 0.6);
    bg.fillEllipse(W / 2, H * 0.4, W * 0.9, H * 0.7);

    // Floating stone particles from the bottom
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 400, () => this._spawnParticle());
    }

    // Glow ring behind title
    const glow = this.add.graphics();
    glow.fillStyle(0x44cc44, 0.06);
    glow.fillCircle(W / 2, H * 0.3, 190);

    // Title
    this.add.text(W / 2, H * 0.28, 'ONE', {
      fontSize: '110px',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#ffe066',
      stroke: '#1a3520',
      strokeThickness: 12,
      shadow: { offsetX: 3, offsetY: 6, color: '#000000', blur: 12, fill: true },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(W / 2, H * 0.46, '糯米团子破石纪', {
      fontSize: '21px',
      fontFamily: 'sans-serif',
      color: '#88dd88',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Flavor text
    this.add.text(W / 2, H * 0.545, '击碎彩石  收集碎屑  升级团子', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#558855',
    }).setOrigin(0.5);

    // Start button
    this._buildStartBtn(W / 2, H * 0.685);

    // Controls hint
    this.add.text(W / 2, H * 0.88, 'A / D  移动      鼠标瞄准      点击  投球', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#446644',
    }).setOrigin(0.5);

    // Version
    this.add.text(W - 10, H - 10, 'v0.1', {
      fontSize: '10px', fontFamily: 'monospace', color: '#334433',
    }).setOrigin(1, 1);
  }

  _buildStartBtn(x, y) {
    const bw = 220, bh = 52;

    const bg = this.add.graphics();
    bg.fillStyle(COLOR_BTN);
    bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);

    const t = this.add.text(x, y, '▶  开 始 游 戏', {
      fontSize: '20px', fontFamily: 'sans-serif',
      color: '#1a1a1a', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Invisible hit zone for interaction
    const zone = this.add.zone(x, y, bw, bh).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xffdd44);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(COLOR_BTN);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, 10);
    });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(220, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Breathing pulse on button graphics + text
    this.tweens.add({
      targets: [t],
      scaleX: 1.04, scaleY: 1.04,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });
  }

  _spawnParticle() {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const colors = STONE_TIERS.map(t => t.color);
    const color  = Phaser.Utils.Array.GetRandom(colors);
    const r      = Phaser.Math.Between(6, 16);
    const x      = Phaser.Math.Between(r, W - r);

    const g = this.add.graphics();
    g.fillStyle(color, 0.75);
    g.fillCircle(r, r, r);
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(r - r * 0.35, r - r * 0.35, r * 0.28);
    g.x = x - r;
    g.y = H + r;

    const duration = Phaser.Math.Between(3500, 7000);
    this.tweens.add({
      targets: g,
      y: -r * 2 - 20,
      duration,
      ease: 'Linear',
      onComplete: () => { g.destroy(); this._spawnParticle(); },
    });
  }
}
