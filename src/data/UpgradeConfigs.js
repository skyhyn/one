export const UPGRADE_CONFIGS = [
  {
    key:        'ballBounces',
    label:      '🎱 反弹次数',
    desc:       '球击中石头后继续飞行的次数',
    baseCost:   20,
    growthRate: 2.2,
    maxLevel:   5,
    effect: lvl => 1 + lvl,            // default 1 bounce, up to 6
  },
  {
    key:        'ballSpeed',
    label:      '⚡ 球速',
    desc:       '球的飞行速度（像素/秒）',
    baseCost:   12,
    growthRate: 1.8,
    maxLevel:   10,
    effect: lvl => 680 + lvl * 60,
  },
  {
    key:        'ballCount',
    label:      '💥 同发球数',
    desc:       '每次发射的球数量',
    baseCost:   80,
    growthRate: 3.5,
    maxLevel:   3,
    effect: lvl => 1 + lvl,            // 1 → 2 → 3 → 4
  },
  {
    key:        'throwCooldown',
    label:      '🕹️ 投球速率',
    desc:       '投球冷却时间（越低越快）',
    baseCost:   15,
    growthRate: 1.75,
    maxLevel:   8,
    effect: lvl => Math.max(150, 600 - lvl * 55), // ms
  },
  {
    key:        'playerSpeed',
    label:      '👟 移动速度',
    desc:       '角色左右移动速度',
    baseCost:   10,
    growthRate: 1.65,
    maxLevel:   8,
    effect: lvl => 260 + lvl * 35,
  },
  {
    key:        'dogSpeed',
    label:      '🐕 小狗速度',
    desc:       '小狗追拾碎石的速度',
    baseCost:   10,
    growthRate: 1.65,
    maxLevel:   8,
    effect: lvl => 240 + lvl * 35,
  },
  {
    key:        'dogRadius',
    label:      '🐾 小狗感知',
    desc:       '小狗感应碎石的范围',
    baseCost:   14,
    growthRate: 1.7,
    maxLevel:   8,
    effect: lvl => 100 + lvl * 25,
  },
  {
    key:        'dogMagnet',
    label:      '🧲 磁力小狗',
    desc:       '小狗周围碎石自动向其靠近',
    baseCost:   250,
    growthRate: 1,
    maxLevel:   1,
    effect: lvl => lvl > 0,
  },
];

export function upgradeCost(cfg, level) {
  return Math.floor(cfg.baseCost * Math.pow(cfg.growthRate, level));
}

// Weapon multipliers kept for UpgradeSystem compatibility (not shown in UI now)
export const WEAPON_MULTIPLIERS = [1];
