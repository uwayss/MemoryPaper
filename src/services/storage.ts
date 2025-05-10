// src/services/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings } from "../types/settings";
import {
  DEFAULT_REMINDER_TEXT,
  DEFAULT_AUTO_UPDATE_ENABLED,
  DEFAULT_UPDATE_INTERVAL,
  DEFAULT_TEXT_COLOR,
  DEFAULT_WALLPAPER_BACKGROUND_COLOR,
  DEFAULT_FONT_SIZE,
} from "../config/constants";

const REMINDER_TEXT_KEY = "REMINDER_TEXT";
const AUTO_UPDATE_ENABLED_KEY = "AUTO_UPDATE_ENABLED";
const UPDATE_INTERVAL_KEY = "UPDATE_INTERVAL_KEY";
const TEXT_COLOR_KEY = "TEXT_COLOR_KEY";
const WALLPAPER_BACKGROUND_COLOR_KEY = "WALLPAPER_BACKGROUND_COLOR_KEY";
const FONT_SIZE_KEY = "FONT_SIZE_KEY";

const PRE_GENERATED_IMAGES_KEY = "PRE_GENERATED_IMAGES_KEY";
const LAST_USED_IMAGE_INDEX_KEY = "LAST_USED_IMAGE_INDEX_KEY";

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(REMINDER_TEXT_KEY, settings.reminderText);
    await AsyncStorage.setItem(
      AUTO_UPDATE_ENABLED_KEY,
      JSON.stringify(settings.autoUpdateEnabled)
    );
    await AsyncStorage.setItem(
      UPDATE_INTERVAL_KEY,
      JSON.stringify(settings.updateInterval)
    );
    await AsyncStorage.setItem(TEXT_COLOR_KEY, settings.textColor);
    await AsyncStorage.setItem(
      WALLPAPER_BACKGROUND_COLOR_KEY,
      settings.wallpaperBackgroundColor
    );
    await AsyncStorage.setItem(
      FONT_SIZE_KEY,
      JSON.stringify(settings.fontSize)
    );
  } catch (e) {
    console.error("Failed to save settings.", e);
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const reminderText = await AsyncStorage.getItem(REMINDER_TEXT_KEY);
    const autoUpdateEnabled = await AsyncStorage.getItem(
      AUTO_UPDATE_ENABLED_KEY
    );
    const updateInterval = await AsyncStorage.getItem(UPDATE_INTERVAL_KEY);
    const textColor = await AsyncStorage.getItem(TEXT_COLOR_KEY);
    const wallpaperBackgroundColor = await AsyncStorage.getItem(
      WALLPAPER_BACKGROUND_COLOR_KEY
    );
    const fontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);

    return {
      reminderText: reminderText ?? DEFAULT_REMINDER_TEXT,
      autoUpdateEnabled: autoUpdateEnabled
        ? JSON.parse(autoUpdateEnabled)
        : DEFAULT_AUTO_UPDATE_ENABLED,
      updateInterval: updateInterval
        ? JSON.parse(updateInterval)
        : DEFAULT_UPDATE_INTERVAL,
      textColor: textColor ?? DEFAULT_TEXT_COLOR,
      wallpaperBackgroundColor:
        wallpaperBackgroundColor ?? DEFAULT_WALLPAPER_BACKGROUND_COLOR,
      fontSize: fontSize ? JSON.parse(fontSize) : DEFAULT_FONT_SIZE,
    };
  } catch (e) {
    console.error("Failed to load settings.", e);
    return {
      reminderText: DEFAULT_REMINDER_TEXT,
      autoUpdateEnabled: DEFAULT_AUTO_UPDATE_ENABLED,
      updateInterval: DEFAULT_UPDATE_INTERVAL,
      textColor: DEFAULT_TEXT_COLOR,
      wallpaperBackgroundColor: DEFAULT_WALLPAPER_BACKGROUND_COLOR,
      fontSize: DEFAULT_FONT_SIZE,
    };
  }
};

export const savePreGeneratedImageUris = async (
  uris: string[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(PRE_GENERATED_IMAGES_KEY, JSON.stringify(uris));
    await AsyncStorage.setItem(LAST_USED_IMAGE_INDEX_KEY, JSON.stringify(-1));
  } catch (e) {
    console.error("Failed to save pre-generated image URIs.", e);
  }
};

export const loadPreGeneratedImageUris = async (): Promise<string[]> => {
  try {
    const urisJson = await AsyncStorage.getItem(PRE_GENERATED_IMAGES_KEY);
    return urisJson ? JSON.parse(urisJson) : [];
  } catch (e) {
    console.error("Failed to load pre-generated image URIs.", e);
    return [];
  }
};

export const getNextImageUri = async (): Promise<string | null> => {
  try {
    const uris = await loadPreGeneratedImageUris();
    if (uris.length === 0) return null;

    const lastIndexJson = await AsyncStorage.getItem(LAST_USED_IMAGE_INDEX_KEY);
    let lastIndex = lastIndexJson ? JSON.parse(lastIndexJson) : -1;

    const nextIndex = (lastIndex + 1) % uris.length;

    await AsyncStorage.setItem(
      LAST_USED_IMAGE_INDEX_KEY,
      JSON.stringify(nextIndex)
    );
    return uris[nextIndex];
  } catch (e) {
    console.error("Failed to get next image URI.", e);
    return null;
  }
};
