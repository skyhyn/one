import { SaveManager }   from '../utils/SaveManager.js';
import { fmt }           from '../utils/FormatNumber.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { upgradeCost } from '../data/UpgradeConfigs.js';
import {
  GAME_WIDTH, GAME_HEIGHT,
  COLOR_BTN,
} from '../constants.js';

const CARD_W     = 170;
const CARD_H     = 110;
const COLS       = 4;
const PAD        = 18;
const TOP_OFFSET = 130;

export class UpgradeScene extends Phaser.Scene {
  constructor() { super('UpgradeScene'); }

  init(data) {
    this._earned = data.earned ?? 0;
  }

  create() {
    this.upgrades = new UpgradeSystem();

    // Dark overlay background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d1a0d, 0.97)
      .setOrigin(0);

    // Header
    this._buildHeader();

    // Upgrade cards
    this._cards = [];
    this._buildCards();

    // Continue button
    this._buildContinueBtn();
  }

  _buildHeader() {
    this.add.text(GAME_WIDTH / 2, 28, '升级营地', {
      fontSize: '26px', fontFamily: 'sans-serif',
      color: '#ffe066', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 60, `本局收集：+${fmt(this._earned)} 碎片`, {
      fontSize: '15px', fontFamily: 'monospace', color: '#aaffaa',
    }).setOrigin(0.5);

    this._balanceText = this.add.text(GAME_WIDTH / 2, 86, '', {
      fontSize: '17px', fontFamily: 'monospace', color: '#ffe066',
    }).setOrigin(0.5);
    this._refreshBalance();
  }

  _refreshBalance() {
    this._balanceText.setText(`🪨 碎片：${fmt(SaveManager.state.fragments)}`);
  }

  _buildCards() {
    const configs = this.upgrades.configs;

    configs.forEach((cfg, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x   = PAD + col * (CARD_W + PAD);
      const y   = TOP_OFFSET + row * (CARD_H + PAD);

      const card = this._makeCard(cfg, x, y);
      this._cards.push({ cfg, card });
    });
  }

  _makeCard(cfg, x, y) {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x1e3322).setOrigin(0);
    const border = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x44aa66, 0)
      .setOrigin(0).setStrokeStyle(1.5, 0x44aa66);

    // Title
    const title = this.add.text(8, 8, cfg.label, {
      fontSize: '13px', fontFamily: 'sans-serif', color: '#eeffee',
      wordWrap: { width: CARD_W - 16 },
    });

    // Description
    const desc = this.add.text(8, 30, cfg.desc, {
      fontSize: '11px', fontFamily: 'monospace', color: '#88bb88',
      wordWrap: { width: CARD_W - 16 },
    });

    // Level indicator
    const levelText = this.add.text(8, 52, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
    });

    // Buy button
    const btnBg = this.add.rectangle(8, CARD_H - 28, CARD_W - 16, 22, COLOR_BTN)
      .setOrigin(0);
    const btnText = this.add.text(CARD_W / 2, CARD_H - 17, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#1a1a1a',
    }).setOrigin(0.5);

    container.add([bg, border, title, desc, levelText, btnBg, btnText]);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, CARD_W, CARD_H),
      Phaser.Geom.Rectangle.Contains
    );

    const card = { container, bg, border, btnBg, btnText, levelText, cfg };
    this._refreshCard(card);

    container.on('pointerover', () => {
      if (!this.upgrades.isMaxed(cfg.key)) bg.setFillStyle(0x2a4a30);
    });
    container.on('pointerout', () => bg.setFillStyle(0x1e3322));
    container.on('pointerdown', () => this._onBuy(card));

    return card;
  }

  _refreshCard(card) {
    const { cfg } = card;
    const lvl     = this.upgrades.getLevel(cfg.key);
    const maxed   = this.upgrades.isMaxed(cfg.key);
    const cost    = this.upgrades.getCost(cfg.key);
    const afford  = this.upgrades.canAfford(cfg.key);

    // Level text
    const maxStr = cfg.maxLevel != null ? `/${cfg.maxLevel}` : '';
    let statVal  = this.upgrades.get(cfg.key);
    if (cfg.key === 'dogMagnet') statVal = lvl > 0 ? '已激活' : '未激活';
    card.levelText.setText(`等级 ${lvl}${maxStr}  当前：${statVal}`);

    // Button
    if (maxed) {
      card.btnBg.setFillStyle(0x336633);
      card.btnText.setText('已满级').setColor('#aaffaa');
    } else if (!afford) {
      card.btnBg.setFillStyle(0x553333);
      card.btnText.setText(`🪨 ${fmt(cost)}`).setColor('#ffaaaa');
    } else {
      card.btnBg.setFillStyle(COLOR_BTN);
      card.btnText.setText(`🪨 ${fmt(cost)} 升级`).setColor('#1a1a1a');
    }
  }

  _onBuy(card) {
    const success = this.upgrades.purchase(card.cfg.key);
    if (!success) {
      this.cameras.main.shake(100, 0.005);
      return;
    }
    this._refreshBalance();
    this._cards.forEach(c => this._refreshCard(c.card));

    // Purchase feedback pulse
    this.tweens.add({
      targets:  card.container,
      scaleX:   1.04, scaleY: 1.04,
      duration: 80,
      yoyo:     true,
    });
  }

  _buildContinueBtn() {
    const bw = 200, bh = 46;
    const bx = GAME_WIDTH / 2 - bw / 2;
    const by = GAME_HEIGHT - bh - 16;

    const bg = this.add.rectangle(bx, by, bw, bh, COLOR_BTN).setOrigin(0);
    const t  = this.add.text(GAME_WIDTH / 2, by + bh / 2, '▶ 继续出发！', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#1a1a1a',
    }).setOrigin(0.5);

    [bg, t].forEach(o => {
      o.setInteractive();
      o.on('pointerover', () => bg.setFillStyle(0xffdd44));
      o.on('pointerout',  () => bg.setFillStyle(COLOR_BTN));
      o.on('pointerdown', () => this.scene.start('GameScene'));
    });
  }
}
