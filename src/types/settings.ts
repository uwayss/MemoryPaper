// src/types/settings.ts
export interface AppSettings {
  reminderText: string;
  autoUpdateEnabled: boolean;
  updateInterval: number; // minutes
}

export interface TextPosition {
  top: number;
  left: number;
}
