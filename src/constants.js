export const GAME_WIDTH  = 800;
export const GAME_HEIGHT = 600;

export const ROUND_DURATION = 20; // seconds

// Stone
export const STONE_X = GAME_WIDTH  / 2;
export const STONE_Y = GAME_HEIGHT / 2;

// Player
export const PLAYER_START_X = 120;
export const PLAYER_START_Y = GAME_HEIGHT / 2;
export const PLAYER_BASE_SPEED = 200;

// Dog
export const DOG_BASE_SPEED  = 220;
export const DOG_BASE_RADIUS = 80; // px — fragment detection radius

// Fragments
export const FRAGMENT_LIFETIME   = 4000; // ms before fade-out
export const FRAGMENT_SCATTER_MIN = 40;
export const FRAGMENT_SCATTER_MAX = 130;

// Colors (Timber-Rush-ish warm palette)
export const COLOR_BG        = 0x2d4a22;
export const COLOR_GROUND    = 0x5c8a3c;
export const COLOR_STONE     = 0x8a8a8a;
export const COLOR_STONE_HI  = 0xb0b0b0;
export const COLOR_PLAYER    = 0xf5e6c8;
export const COLOR_DOG       = 0xd4a05a;
export const COLOR_FRAGMENT  = 0xccbbaa;
export const COLOR_UI_BG     = 0x1a1a1a;
export const COLOR_UI_TEXT   = 0xffffff;
export const COLOR_BTN       = 0xe8a030;
export const COLOR_BTN_TEXT  = 0x1a1a1a;
