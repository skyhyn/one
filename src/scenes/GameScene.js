import { SaveManager }    from '../utils/SaveManager.js';
import { fmt }            from '../utils/FormatNumber.js';
import { UpgradeSystem }  from '../systems/UpgradeSystem.js';
import { FragmentSystem } from '../systems/FragmentSystem.js';
import { AttackSystem }   from '../systems/AttackSystem.js';
import { CollectSystem }  from '../systems/CollectSystem.js';
import { Player }         from '../entities/Player.js';
import { Dog }            from '../entities/Dog.js';
import { Stone }          from '../entities/Stone.js';
import {
  GAME_WIDTH, GAME_HEIGHT,
  ROUND_DURATION,
  COLOR_BG, COLOR_GROUND,
  STONE_X, STONE_Y,
} from '../constants.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    SaveManager.load();
    SaveManager.beginRound();

    this.upgrades = new UpgradeSystem();

    // Background
    this._drawBackground();

    // Stone (decorative only, behind everything)
    this.stone = new Stone(this);

    // Player & Dog
    this.player = new Player(this, this.upgrades);
    this.dog    = new Dog(this, this.player, this.upgrades, null); // fragmentSystem set below

    // Fragment system
    this.fragmentSystem = new FragmentSystem(this);
    this.dog.fragmentSystem = this.fragmentSystem;

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Collect system (sets up physics overlaps)
    this._collected = 0;
    this.collectSystem = new CollectSystem(
      this,
      this.player.body,
      this.dog.body,
      this.fragmentSystem,
      () => this.upgrades.get('collectRadius'),
      (n) => {
        this._collected += n;
        this._updateCounterText();
        this._spawnFloatText('+' + n, this.player.x, this.player.y - 20, 0xffe066);
      }
    );

    // Attack system
    this.attackSystem = new AttackSystem(
      this,
      () => this._onAttack(),
      () => this.upgrades.get('attackSpeed')
    );
    this.attackSystem.start();

    // Timer
    this._timeLeft  = ROUND_DURATION;
    this._timerEvt  = this.time.addEvent({
      delay:    1000,
      repeat:   ROUND_DURATION - 1,
      callback: this._onTick,
      callbackScope: this,
    });

    // HUD
    this._buildHUD();

    // World bounds
    this.physics.world.setBounds(0, 60, GAME_WIDTH, GAME_HEIGHT - 60);
  }

  // ─── Attack callback ───────────────────────────────────────────────────────

  _onAttack() {
    const weaponTier = this.upgrades.get('weapon');
    this.stone.hit(weaponTier);
    this.player.playThrowAnim(weaponTier);

    const count = this.upgrades.getFragmentsPerHit();
    this.fragmentSystem.spawn(STONE_X, STONE_Y, count);
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────

  _onTick() {
    this._timeLeft--;
    this._updateTimerText();
    if (this._timeLeft <= 0) {
      this._endRound();
    }
  }

  _endRound() {
    this.attackSystem.stop();
    this.fragmentSystem.clear();

    const earned = SaveManager.state.roundFragments;
    SaveManager.endRound();

    this.scene.start('UpgradeScene', { earned });
  }

  // ─── HUD ───────────────────────────────────────────────────────────────────

  _buildHUD() {
    const panelH = 54;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.55);
    g.fillRect(0, 0, GAME_WIDTH, panelH);
    g.setDepth(10);

    // Timer bar background
    g.fillStyle(0x444444);
    g.fillRoundedRect(20, 14, GAME_WIDTH - 40, 16, 6);

    this._timerBar = this.add.graphics().setDepth(11);
    this._timerFill = GAME_WIDTH - 40;
    this._drawTimerBar();

    // Timer text
    this._timerText = this.add.text(GAME_WIDTH / 2, 22, `${this._timeLeft}s`, {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(12);

    // Fragment counter
    this._counterText = this.add.text(GAME_WIDTH - 20, 10, '🪨 0', {
      fontSize: '16px', fontFamily: 'sans-serif',
      color: '#ffe066', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(12);

    // Round label
    this.add.text(20, 10, `Round ${SaveManager.state.roundNumber}`, {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#cccccc',
    }).setDepth(12);
  }

  _drawTimerBar() {
    this._timerBar.clear();
    const frac = this._timeLeft / ROUND_DURATION;
    const color = frac > 0.5 ? 0x55cc44 : frac > 0.25 ? 0xeecc22 : 0xee4422;
    const w = Math.max(0, (GAME_WIDTH - 40) * frac);
    this._timerBar.fillStyle(color, 1);
    this._timerBar.fillRoundedRect(20, 14, w, 16, 6);
  }

  _updateTimerText() {
    this._timerText.setText(`${this._timeLeft}s`);
    this._drawTimerBar();
  }

  _updateCounterText() {
    this._counterText.setText(`🪨 ${fmt(this._collected)}`);
  }

  _spawnFloatText(text, x, y, color) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'monospace',
      color: hex, stroke: '#000000', strokeThickness: 2,
    }).setDepth(20).setOrigin(0.5);

    this.tweens.add({
      targets:  t,
      y:        y - 35,
      alpha:    0,
      duration: 700,
      ease:     'Quad.Out',
      onComplete: () => t.destroy(),
    });
  }

  // ─── Background ────────────────────────────────────────────────────────────

  _drawBackground() {
    const g = this.add.graphics();

    // Grass ground
    g.fillStyle(COLOR_BG);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Inner grass patch around stone
    g.fillStyle(COLOR_GROUND, 0.5);
    g.fillEllipse(STONE_X, STONE_Y + 20, 380, 220);

    // Ground texture marks
    g.lineStyle(1, 0x3a6a28, 0.3);
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
      const y = Phaser.Math.Between(70, GAME_HEIGHT - 20);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-4, 4));
      g.strokePath();
    }
  }

  // ─── Frame update ──────────────────────────────────────────────────────────

  update() {
    this.player.update(this.cursors, this.wasd);
    this.dog.update();
  }
}
