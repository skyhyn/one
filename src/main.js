// Phaser loaded via CDN in index.html
import { TitleScene }   from './scenes/TitleScene.js';
import { BootScene }    from './scenes/BootScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

const config = {
  type:            Phaser.AUTO,
  width:           GAME_WIDTH,
  height:          GAME_HEIGHT,
  backgroundColor: '#0d1a0d',
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, TitleScene, GameScene, UpgradeScene],
};

new Phaser.Game(config);
