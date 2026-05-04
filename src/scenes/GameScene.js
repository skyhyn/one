import { SaveManager }   from '../utils/SaveManager.js';
import { fmt }           from '../utils/FormatNumber.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { Player }        from '../entities/Player.js';
import { Dog }           from '../entities/Dog.js';
import { NPC }           from '../entities/NPC.js';
import { Ball }          from '../entities/Ball.js';
import { MediumStone }   from '../entities/MediumStone.js';
import { SmallStone }    from '../entities/SmallStone.js';
import {
  GAME_WIDTH, GAME_HEIGHT, ROUND_DURATION,
  STONE_AREA_Y, NPC_X, NPC_Y,
  PLAY_AREA_TOP, PLAY_AREA_BOTTOM,
  PLAYER_Y, NPC_INTERVAL_BASE, NPC_INTERVAL_MIN,
  MAX_STONES, STONE_TIERS,
  COLOR_BG, COLOR_GROUND, COLOR_PLATFORM,
} from '../constants.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    SaveManager.load();
    SaveManager.beginRound();

    this.upgrades     = new UpgradeSystem();
    this._roundActive = true;
    this._collected   = 0;

    // Object lists (manually managed, no arcade physics group)
    this.balls        = [];
    this.mediumStones = [];
    this.smallStones  = [];

    // ── Draw world ──────────────────────────────────────────────────────────
    this._drawWorld();

    // ── Big stone (decorative) ──────────────────────────────────────────────
    this._drawBigStone();

    // ── NPC ─────────────────────────────────────────────────────────────────
    this.npc = new NPC(this);

    // ── Player & Dog ────────────────────────────────────────────────────────
    this.player = new Player(this, this.upgrades);
    this.dog    = new Dog(this, this.player, this.upgrades, (n) => {
      this._collected += n;
      this._refreshCounter();
      this._floatText(`+${n}`, this.dog.x, this.dog.y - 18, 0xffee66);
    });

    // ── Aim graphics ─────────────────────────────────────────────────────────
    this._aimGfx = this.add.graphics().setDepth(15);

    // ── Input ────────────────────────────────────────────────────────────────
    this._keys = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.input.on('pointerdown', this._onPointerDown, this);

    // ── HUD ──────────────────────────────────────────────────────────────────
    this._buildHUD();

    // ── NPC hammer timer ────────────────────────────────────────────────────
    this._scheduleHammer();

    // ── 20-second countdown ──────────────────────────────────────────────────
    this._timeLeft = ROUND_DURATION;
    this.time.addEvent({
      delay:    1000,
      repeat:   ROUND_DURATION - 1,
      callback: this._onTick,
      callbackScope: this,
    });

    // Fade in
    this.cameras.main.fadeIn(200);
  }

  // ─── NPC hammer ───────────────────────────────────────────────────────────

  _scheduleHammer() {
    const round    = SaveManager.state.roundNumber;
    const interval = Math.max(NPC_INTERVAL_MIN, NPC_INTERVAL_BASE - round * 80);
    this.time.delayedCall(interval, () => {
      if (!this._roundActive) return;
      this.npc.doSwing(() => this._spawnMediumStones());
      this._scheduleHammer();
    });
  }

  _spawnMediumStones() {
    const round   = SaveManager.state.roundNumber;
    const count   = Phaser.Math.Between(2, 3 + Math.floor(round / 4));
    const maxTier = Math.min(STONE_TIERS.length - 1, Math.floor(round / 5));

    for (let i = 0; i < count; i++) {
      const live = this.mediumStones.filter(s => s.alive).length;
      if (live >= MAX_STONES) break;

      // Weight lower tiers more at early game
      const tier = Phaser.Math.Between(0, maxTier);
      this.mediumStones.push(new MediumStone(this, NPC_X, STONE_AREA_Y, tier));
    }
  }

  // ─── Throw ball on click ──────────────────────────────────────────────────

  _onPointerDown(pointer) {
    if (!this._roundActive) return;

    const descs = this.player.buildThrow(pointer.x, pointer.y);
    if (!descs) return;

    const tier = 0; // weapon tier not in upgrade tree yet
    for (const d of descs) {
      this.balls.push(new Ball(
        this, this.player.x, this.player.y - 22,
        d.vx, d.vy, d.bouncesLeft, tier
      ));
    }
  }

  // ─── Timer ────────────────────────────────────────────────────────────────

  _onTick() {
    this._timeLeft--;
    this._refreshTimerHUD();
    if (this._timeLeft <= 0) this._endRound();
  }

  _endRound() {
    if (!this._roundActive) return;
    this._roundActive = false;

    // Remove all loose objects
    this.balls.forEach(b => b.alive && b.destroy());
    this.mediumStones.forEach(s => s.alive && s._gfx.destroy());
    this.smallStones.forEach(s => s.alive && s.destroy());

    const earned = SaveManager.state.roundFragments;
    SaveManager.endRound();

    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('UpgradeScene', { earned });
    });
  }

  // ─── Frame update ─────────────────────────────────────────────────────────

  update(_, delta) {
    this.player.update(this._keys);
    this.dog.update(this.smallStones.filter(s => s.alive));

    // Update balls
    for (const ball of this.balls) ball.update(delta);

    // Update medium stones
    for (const stone of this.mediumStones) stone.update(delta);

    // Update small stones
    for (const ss of this.smallStones) ss.update(delta);

    // Ball ↔ stone collision
    for (const ball of this.balls) {
      if (!ball.alive) continue;
      for (const stone of this.mediumStones) {
        if (!stone.alive) continue;
        const hit = ball.tryHit(stone);
        if (hit) {
          const destroyed = stone.takeDamage(1);
          if (destroyed) {
            this._onStoneDestroyed(stone);
          }
        }
      }
    }

    // Prune dead objects (keep lists lean)
    this.balls        = this.balls.filter(b => b.alive);
    this.mediumStones = this.mediumStones.filter(s => s.alive);
    this.smallStones  = this.smallStones.filter(s => s.alive);

    // Draw aim line
    this._drawAimLine();
  }

  // ─── Stone destroyed → drop small stones ─────────────────────────────────

  _onStoneDestroyed(stone) {
    for (let i = 0; i < stone.drops; i++) {
      this.smallStones.push(new SmallStone(this, stone.x, stone.y));
    }
    this._floatText(`×${stone.drops}`, stone.x, stone.y - 30, stone.color);
  }

  // ─── Aim indicator ────────────────────────────────────────────────────────

  _drawAimLine() {
    this._aimGfx.clear();
    if (!this._roundActive) return;

    const px = this.player.x;
    const py = this.player.y - 22;
    const mx = this.input.activePointer.x;
    const my = this.input.activePointer.y;

    let dx = mx - px;
    let dy = my - py;
    if (dy > -30) dy = -30;

    const len = Math.sqrt(dx * dx + dy * dy);
    const nx  = dx / len;
    const ny  = dy / len;

    this._aimGfx.fillStyle(0xffffff, 0.45);
    const step = 22;
    for (let i = 1; i <= 7; i++) {
      const alpha = 0.45 * (1 - i / 8);
      const r     = 3 - i * 0.25;
      this._aimGfx.fillStyle(0xffffff, alpha);
      this._aimGfx.fillCircle(px + nx * step * i, py + ny * step * i, Math.max(1, r));
    }
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  _buildHUD() {
    const H = 54;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x000000, 0.6);
    g.fillRect(0, 0, GAME_WIDTH, H);
    g.fillStyle(0x333333);
    g.fillRoundedRect(20, 14, GAME_WIDTH - 40, 16, 6);

    this._timerBar = this.add.graphics().setDepth(21);
    this._timerText = this.add.text(GAME_WIDTH / 2, 22, `${this._timeLeft}s`, {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#ffffff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(22);

    this._counterText = this.add.text(GAME_WIDTH - 16, 10, '🪨 0', {
      fontSize: '16px', fontFamily: 'sans-serif',
      color: '#ffe066', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(22);

    this.add.text(16, 10, `Round ${SaveManager.state.roundNumber}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setDepth(22);

    this._refreshTimerHUD();
  }

  _refreshTimerHUD() {
    this._timerText.setText(`${this._timeLeft}s`);
    this._timerBar.clear();
    const frac  = this._timeLeft / ROUND_DURATION;
    const color = frac > 0.5 ? 0x55cc44 : frac > 0.25 ? 0xeecc22 : 0xee4422;
    const w     = Math.max(0, (GAME_WIDTH - 40) * frac);
    this._timerBar.fillStyle(color);
    this._timerBar.fillRoundedRect(20, 14, w, 16, 6);
  }

  _refreshCounter() {
    this._counterText.setText(`🪨 ${fmt(this._collected)}`);
  }

  _floatText(text, x, y, color) {
    const hex = '#' + (color >>> 0).toString(16).padStart(6, '0');
    const t   = this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'monospace',
      color: hex, stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: t, y: y - 38, alpha: 0, duration: 750, ease: 'Quad.Out',
      onComplete: () => t.destroy(),
    });
  }

  // ─── World drawing ────────────────────────────────────────────────────────

  _drawWorld() {
    const g = this.add.graphics();

    // Sky/background
    g.fillStyle(COLOR_BG);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Play-area ground tint
    g.fillStyle(COLOR_GROUND, 0.35);
    g.fillRect(0, PLAY_AREA_TOP, GAME_WIDTH, PLAY_AREA_BOTTOM - PLAY_AREA_TOP);

    // Thin separator line at play area top
    g.lineStyle(1, 0x448844, 0.4);
    g.lineBetween(0, PLAY_AREA_TOP, GAME_WIDTH, PLAY_AREA_TOP);

    // Player platform (bottom strip)
    g.fillStyle(COLOR_PLATFORM);
    g.fillRect(0, PLAY_AREA_BOTTOM, GAME_WIDTH, GAME_HEIGHT - PLAY_AREA_BOTTOM);

    // Platform top edge highlight
    g.lineStyle(2, 0x55aa55, 0.6);
    g.lineBetween(0, PLAY_AREA_BOTTOM, GAME_WIDTH, PLAY_AREA_BOTTOM);

    // Grass tufts on platform
    g.lineStyle(2, 0x44bb44, 0.5);
    for (let i = 0; i < 20; i++) {
      const x = 20 + i * 38 + Phaser.Math.Between(-8, 8);
      g.lineBetween(x, PLAY_AREA_BOTTOM, x - 4, PLAY_AREA_BOTTOM - 8);
      g.lineBetween(x, PLAY_AREA_BOTTOM, x + 4, PLAY_AREA_BOTTOM - 8);
    }

    // Top-area background (darker, where NPC lives)
    g.fillStyle(0x0d1a0d, 0.55);
    g.fillRect(0, 54, GAME_WIDTH, PLAY_AREA_TOP - 54);
  }

  _drawBigStone() {
    const g = this.add.graphics();
    const x = NPC_X - 38, y = STONE_AREA_Y - 14;
    const w = 56, h = 50;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(x + w / 2 + 5, y + h + 5, w * 1.3, 16);

    // Stone body
    g.fillStyle(0x7a7a7a);
    g.fillRoundedRect(x, y, w, h, 10);

    // Highlight
    g.fillStyle(0xaaaaaa, 0.45);
    g.fillRoundedRect(x + 6, y + 6, 18, 10, 5);

    // Cracks (decorative)
    g.lineStyle(1.5, 0x555555, 0.6);
    g.lineBetween(x + 20, y + 15, x + 28, y + 35);
    g.lineBetween(x + 28, y + 20, x + 40, y + 28);
  }
}
