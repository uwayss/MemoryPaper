// src/types/settings.ts
export interface AppSettings {
  reminderText: string;
  autoUpdateEnabled: boolean;
  updateInterval: number; // minutes
  textColor: string;
  wallpaperBackgroundColor: string;
  fontSize: number; // e.g., 24, 30, 36
}

export interface TextPosition {
  top: number;
  left: number;
}
