// src/config/constants.ts
export const TEXT_BLOCK_MAX_WIDTH_FACTOR = 0.9;
export const TEXT_BLOCK_MAX_HEIGHT_FACTOR = 0.3;
export const NUM_PRE_GENERATED_IMAGES = 5;
export const OFFSCREEN_PREVIEW_MULTIPLIER = 2;

export const UPDATE_INTERVALS = [
  { label: "1 minute", value: 1 },
  { label: "2 minutes", value: 2 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "12 hours", value: 720 },
];

export const DEFAULT_REMINDER_TEXT = "Your reminder here!";
export const DEFAULT_AUTO_UPDATE_ENABLED = false;
export const DEFAULT_UPDATE_INTERVAL = 15; // minutes
export const DEFAULT_TEXT_COLOR = "#FFFFFF";
export const DEFAULT_WALLPAPER_BACKGROUND_COLOR = "#000000";
export const DEFAULT_FONT_SIZE = 30;
export const DEFAULT_WALLPAPER_TARGET_SCREEN = "lock" as const; // Default to lock screen

export const WALLPAPER_TARGET_SCREEN_OPTIONS = [
  { label: "Lock Screen", value: "lock" as const },
  { label: "Home Screen", value: "home" as const },
  { label: "Both Screens", value: "both" as const },
];

export const FONT_SIZE_OPTIONS = [
  { label: "Small (24pt)", value: 24 },
  { label: "Medium (30pt)", value: 30 },
  { label: "Large (36pt)", value: 36 },
  { label: "X-Large (48pt)", value: 48 },
];

export const CAPTURE_DELAY_MS = 100;
