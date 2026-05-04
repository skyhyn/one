export const GAME_WIDTH  = 800;
export const GAME_HEIGHT = 600;

export const ROUND_DURATION = 20;

// Layout zones
export const HUD_HEIGHT        = 54;
export const STONE_AREA_Y      = 95;   // big stone center Y
export const NPC_X             = GAME_WIDTH / 2;
export const NPC_Y             = 88;
export const PLAY_AREA_TOP     = 148;  // top bound for medium stones
export const PLAY_AREA_BOTTOM  = 478;  // floor for medium stones
export const PLAYER_Y          = 548;  // player fixed Y
export const PLAYER_START_X    = GAME_WIDTH / 2;

// Ball
export const BALL_SPEED_BASE   = 680;
export const BALL_RADIUS       = 9;

// Medium stones
export const STONE_RADIUS      = 22;
export const MAX_STONES        = 18;

// Stone tiers (indexed 0–6)
export const STONE_TIERS = [
  { hp: 1,  color: 0x44ee44, drops: 1 },
  { hp: 2,  color: 0x33ccee, drops: 2 },
  { hp: 3,  color: 0x4477ee, drops: 3 },
  { hp: 5,  color: 0xeecc22, drops: 5 },
  { hp: 8,  color: 0xee8822, drops: 7 },
  { hp: 13, color: 0xee3333, drops: 10 },
  { hp: 21, color: 0xbb22ee, drops: 15 },
];

// Small stones (resources collected by dog)
export const SMALL_STONE_RADIUS   = 6;
export const SMALL_STONE_LIFETIME = 7000;

// NPC hammer interval (ms) — decreases each round, min 700ms
export const NPC_INTERVAL_BASE = 2200;
export const NPC_INTERVAL_MIN  = 700;

// Colors
export const COLOR_BG       = 0x1a2e1a;
export const COLOR_GROUND   = 0x2a4a2a;
export const COLOR_PLATFORM = 0x3a6a3a;
export const COLOR_BTN      = 0xe8a030;
export const COLOR_PLAYER   = 0xf5e6c8;
export const COLOR_DOG      = 0xd4a05a;
