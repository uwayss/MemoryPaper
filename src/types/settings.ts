// src/types/settings.ts
export interface AppSettings {
  reminderText: string;
  autoUpdateEnabled: boolean;
  updateInterval: number; // minutes
  textColor: string;
  wallpaperBackgroundColor: string;
}

export interface TextPosition {
  top: number;
  left: number;
}
