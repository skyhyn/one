/**
 * Each upgrade entry:
 *  key        — internal identifier
 *  label      — display name
 *  desc       — short description shown in UI
 *  baseCost   — cost at level 0 → 1
 *  growthRate — cost multiplier per level (exponential curve)
 *  maxLevel   — null = unlimited
 *  effect(level) → current stat value given current level
 */
export const UPGRADE_CONFIGS = [
  {
    key:        'attackSpeed',
    label:      '⚡ 投掷速度',
    desc:       '每秒投掷次数',
    baseCost:   8,
    growthRate: 1.8,
    maxLevel:   20,
    effect: (lvl) => 1 + lvl * 0.5,          // attacks/sec: starts 1, grows by 0.5 each lvl
  },
  {
    key:        'fragmentCount',
    label:      '💥 碎片产量',
    desc:       '每次击中掉落碎片数',
    baseCost:   12,
    growthRate: 1.85,
    maxLevel:   null,
    effect: (lvl) => 3 + lvl * 2,            // fragments per hit
  },
  {
    key:        'playerSpeed',
    label:      '👟 移动速度',
    desc:       '角色移动速度',
    baseCost:   10,
    growthRate: 1.7,
    maxLevel:   10,
    effect: (lvl) => 200 + lvl * 30,         // px/s
  },
  {
    key:        'collectRadius',
    label:      '🤲 拾取半径',
    desc:       '角色拾取碎片的范围',
    baseCost:   15,
    growthRate: 1.75,
    maxLevel:   10,
    effect: (lvl) => 20 + lvl * 12,          // px
  },
  {
    key:        'dogSpeed',
    label:      '🐕 小狗速度',
    desc:       '小狗移动速度',
    baseCost:   10,
    growthRate: 1.7,
    maxLevel:   10,
    effect: (lvl) => 220 + lvl * 30,         // px/s
  },
  {
    key:        'dogRadius',
    label:      '🐾 小狗感知',
    desc:       '小狗自主拾取的感知范围',
    baseCost:   15,
    growthRate: 1.75,
    maxLevel:   10,
    effect: (lvl) => 80 + lvl * 20,          // px
  },
  {
    key:        'weapon',
    label:      '🪓 武器升级',
    desc:       '解锁更强武器，大幅提升碎片产量',
    baseCost:   100,
    growthRate: 5,
    maxLevel:   3,
    // weapon tier 0=石块, 1=弹弓, 2=铁锤, 3=爆炸物
    effect: (lvl) => lvl,
  },
  {
    key:        'dogMagnet',
    label:      '🧲 小狗磁力',
    desc:       '小狗周围碎片自动飞来（需先升小狗感知至5级）',
    baseCost:   200,
    growthRate: 3,
    maxLevel:   1,
    effect: (lvl) => lvl > 0,
  },
];

export const WEAPON_NAMES  = ['石块', '弹弓', '铁锤', '爆炸物'];
export const WEAPON_MULTIPLIERS = [1, 1.5, 3, 8]; // fragment count multiplier per weapon tier

export function upgradeCost(cfg, currentLevel) {
  return Math.floor(cfg.baseCost * Math.pow(cfg.growthRate, currentLevel));
}
