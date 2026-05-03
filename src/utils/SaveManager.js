const SAVE_KEY = 'stoneBasher_save';

const DEFAULT_STATE = {
  fragments:      0,   // lifetime collected (currency)
  roundFragments: 0,   // collected this round (reset each round)
  upgrades: {},        // { key: level }
  roundNumber: 1,
};

let _state = null;

export const SaveManager = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      _state = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
    } catch {
      _state = { ...DEFAULT_STATE };
    }
    return _state;
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(_state));
  },

  get state() { return _state; },

  addFragments(n) {
    _state.fragments      += n;
    _state.roundFragments += n;
  },

  spendFragments(n) {
    if (_state.fragments < n) return false;
    _state.fragments -= n;
    this.save();
    return true;
  },

  getUpgradeLevel(key) {
    return _state.upgrades[key] ?? 0;
  },

  setUpgradeLevel(key, level) {
    _state.upgrades[key] = level;
    this.save();
  },

  beginRound() {
    _state.roundFragments = 0;
  },

  endRound() {
    _state.roundNumber += 1;
    this.save();
  },

  reset() {
    _state = { ...DEFAULT_STATE };
    this.save();
  },
};
