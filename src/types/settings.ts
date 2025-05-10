// src/types/settings.ts
export type WallpaperTargetScreen = "home" | "lock" | "both";

export interface AppSettings {
  reminderText: string;
  autoUpdateEnabled: boolean;
  updateInterval: number; // minutes
  textColor: string;
  wallpaperBackgroundColor: string;
  fontSize: number;
  wallpaperTargetScreen: WallpaperTargetScreen;
}

export interface TextPosition {
  top: number;
  left: number;
}
