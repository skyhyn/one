// Phaser is loaded via CDN script tag in index.html
import { BootScene }    from './scenes/BootScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

const config = {
  type:            Phaser.AUTO,
  width:           GAME_WIDTH,
  height:          GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, GameScene, UpgradeScene],
};

new Phaser.Game(config);
