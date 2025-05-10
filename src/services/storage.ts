// src/services/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const REMINDER_TEXT_KEY = "REMINDER_TEXT";
const AUTO_UPDATE_ENABLED_KEY = "AUTO_UPDATE_ENABLED";
const UPDATE_INTERVAL_KEY = "UPDATE_INTERVAL_KEY";
const PRE_GENERATED_IMAGES_KEY = "PRE_GENERATED_IMAGES_KEY";
const LAST_USED_IMAGE_INDEX_KEY = "LAST_USED_IMAGE_INDEX_KEY";

export interface AppSettings {
  reminderText: string;
  autoUpdateEnabled: boolean;
  updateInterval: number;
}

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

    return {
      reminderText: reminderText ?? "Your reminder here!",
      autoUpdateEnabled: autoUpdateEnabled
        ? JSON.parse(autoUpdateEnabled)
        : false,
      updateInterval: updateInterval ? JSON.parse(updateInterval) : 15,
    };
  } catch (e) {
    console.error("Failed to load settings.", e);
    return {
      reminderText: "Your reminder here!",
      autoUpdateEnabled: false,
      updateInterval: 15,
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
