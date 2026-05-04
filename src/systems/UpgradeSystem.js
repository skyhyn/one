import { UPGRADE_CONFIGS, upgradeCost } from '../data/UpgradeConfigs.js';
import { SaveManager } from '../utils/SaveManager.js';

export class UpgradeSystem {
  constructor() {
    this._configs = Object.fromEntries(UPGRADE_CONFIGS.map(c => [c.key, c]));
  }

  getLevel(key) {
    return SaveManager.getUpgradeLevel(key);
  }

  /** Current numeric value for a stat */
  get(key) {
    const cfg = this._configs[key];
    if (!cfg) return 0;
    return cfg.effect(this.getLevel(key));
  }

  getCost(key) {
    const cfg = this._configs[key];
    if (!cfg) return Infinity;
    return upgradeCost(cfg, this.getLevel(key));
  }

  canAfford(key) {
    return SaveManager.state.fragments >= this.getCost(key);
  }

  isMaxed(key) {
    const cfg = this._configs[key];
    if (!cfg || cfg.maxLevel == null) return false;
    return this.getLevel(key) >= cfg.maxLevel;
  }

  purchase(key) {
    if (this.isMaxed(key)) return false;
    const cost = this.getCost(key);
    if (!SaveManager.spendFragments(cost)) return false;
    SaveManager.setUpgradeLevel(key, this.getLevel(key) + 1);
    return true;
  }

  get configs() { return UPGRADE_CONFIGS; }
}
