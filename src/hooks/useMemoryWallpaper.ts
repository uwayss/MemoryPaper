// src/hooks/useMemoryWallpaper.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { Dimensions, Alert } from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets, EdgeInsets } from "react-native-safe-area-context";

import {
  AppSettings,
  TextPosition,
  WallpaperTargetScreen,
} from "../types/settings";
import {
  loadSettings,
  saveSettings,
  savePreGeneratedImageUris,
} from "../services/storage";
import { setWallpaper as setDeviceWallpaper } from "../services/wallpaperSetter";
import {
  registerAppBackgroundTask,
  unregisterAppBackgroundTask,
  BACKGROUND_WALLPAPER_TASK_ID,
} from "../services/backgroundService";
import {
  TEXT_BLOCK_MAX_WIDTH_FACTOR,
  TEXT_BLOCK_MAX_HEIGHT_FACTOR,
  NUM_PRE_GENERATED_IMAGES,
  CAPTURE_DELAY_MS,
  DEFAULT_REMINDER_TEXT,
  DEFAULT_AUTO_UPDATE_ENABLED,
  DEFAULT_UPDATE_INTERVAL,
  DEFAULT_TEXT_COLOR,
  DEFAULT_WALLPAPER_BACKGROUND_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_WALLPAPER_TARGET_SCREEN,
} from "../config/constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

export const useMemoryWallpaper = () => {
  const [settings, setSettings] = useState<AppSettings>({
    reminderText: DEFAULT_REMINDER_TEXT,
    autoUpdateEnabled: DEFAULT_AUTO_UPDATE_ENABLED,
    updateInterval: DEFAULT_UPDATE_INTERVAL,
    textColor: DEFAULT_TEXT_COLOR,
    wallpaperBackgroundColor: DEFAULT_WALLPAPER_BACKGROUND_COLOR,
    fontSize: DEFAULT_FONT_SIZE,
    wallpaperTargetScreen: DEFAULT_WALLPAPER_TARGET_SCREEN,
  });
  const [liveReminderText, setLiveReminderText] = useState<string>(
    settings.reminderText
  );
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(true);
  const [captureSpecificPosition, setCaptureSpecificPosition] =
    useState<TextPosition | null>(null);

  const viewShotRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setLiveReminderText(settings.reminderText);
  }, [settings.reminderText]);

  const loadAndApplySettings = useCallback(async () => {
    setIsSettingsLoading(true);
    const loadedSettings = await loadSettings();
    setSettings(loadedSettings);
    setIsSettingsLoading(false);
    if (loadedSettings.autoUpdateEnabled) {
      await registerAppBackgroundTask(loadedSettings.updateInterval);
    } else {
      await unregisterAppBackgroundTask();
    }
  }, []);

  useEffect(() => {
    loadAndApplySettings();
  }, [loadAndApplySettings]);

  const handleSettingChange = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
    finalizeUpdate: boolean = true
  ) => {
    const newSettingsSnapshot = { ...settings, [key]: value };
    setSettings(newSettingsSnapshot);

    if (finalizeUpdate) {
      await saveSettings(newSettingsSnapshot);

      const relevantChangeForPreGeneration =
        key === "reminderText" ||
        key === "textColor" ||
        key === "wallpaperBackgroundColor" ||
        key === "fontSize" ||
        key === "wallpaperTargetScreen"; // Added

      if (key === "autoUpdateEnabled" || key === "updateInterval") {
        if (newSettingsSnapshot.autoUpdateEnabled) {
          await registerAppBackgroundTask(newSettingsSnapshot.updateInterval);
          if (newSettingsSnapshot.reminderText.trim()) {
            await handlePreGenerateImages(newSettingsSnapshot);
          }
        } else {
          await unregisterAppBackgroundTask();
        }
      }

      if (
        relevantChangeForPreGeneration &&
        newSettingsSnapshot.autoUpdateEnabled &&
        newSettingsSnapshot.reminderText.trim()
      ) {
        await handlePreGenerateImages(newSettingsSnapshot);
      }
    }
  };

  const handleReminderTextBlur = async () => {
    if (settings.reminderText !== liveReminderText) {
      handleSettingChange("reminderText", liveReminderText.trim(), true);
    }
  };

  const generateSingleRandomPosition = useCallback(
    (safeInsets: EdgeInsets): TextPosition => {
      const textBlockMaxWidth = screenWidth * TEXT_BLOCK_MAX_WIDTH_FACTOR;
      const textBlockMaxHeight = screenHeight * TEXT_BLOCK_MAX_HEIGHT_FACTOR;
      const maxTop =
        screenHeight -
        textBlockMaxHeight -
        (safeInsets.top || 0) -
        (safeInsets.bottom || 0) -
        20;
      const maxLeft =
        screenWidth -
        textBlockMaxWidth -
        (safeInsets.left || 0) -
        (safeInsets.right || 0) -
        20;
      const newTop =
        Math.floor(Math.random() * Math.max(0, maxTop)) +
        (safeInsets.top || 0) +
        10;
      const newLeft =
        Math.floor(Math.random() * Math.max(0, maxLeft)) +
        (safeInsets.left || 0) +
        10;
      return { top: newTop, left: newLeft };
    },
    []
  );

  const handlePreGenerateImages = async (currentSettings: AppSettings) => {
    if (!currentSettings.reminderText.trim()) {
      setStatusMessage("Cannot pre-generate images with empty text.");
      return;
    }
    if (!viewShotRef.current) {
      setStatusMessage("ViewShot reference not available for pre-generation.");
      return;
    }
    setIsLoading(true);
    setStatusMessage(
      `Generating ${NUM_PRE_GENERATED_IMAGES} wallpaper variations...`
    );
    const uris: string[] = [];
    for (let i = 0; i < NUM_PRE_GENERATED_IMAGES; i++) {
      const pos = generateSingleRandomPosition(insets);
      setCaptureSpecificPosition(pos);
      await new Promise((resolve) => setTimeout(resolve, CAPTURE_DELAY_MS));
      try {
        const tempUri = await captureRef(viewShotRef.current, {
          format: "png",
          quality: 0.9,
          result: "tmpfile",
        });
        if (tempUri) {
          const filename = `${
            FileSystem.documentDirectory
          }wallpaper_cache_${BACKGROUND_WALLPAPER_TASK_ID}_${Date.now()}_${i}.png`;
          await FileSystem.copyAsync({ from: tempUri, to: filename });
          uris.push(filename);
          setStatusMessage(`Generated ${i + 1}/${NUM_PRE_GENERATED_IMAGES}...`);
        }
      } catch (e) {
        console.error("Error capturing pre-generated image:", e);
        setStatusMessage(
          `Error generating image ${i + 1}: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }
    setCaptureSpecificPosition(null);
    if (uris.length > 0) {
      await savePreGeneratedImageUris(uris);
      setStatusMessage(`${uris.length} images pre-generated and saved.`);
    } else {
      setStatusMessage(`Failed to generate any images. Check logs.`);
    }
    setIsLoading(false);
  };

  const handleManualSetWallpaper = async () => {
    const textToSet = liveReminderText.trim();
    if (!textToSet) {
      Alert.alert("Input Required", "Please enter text for your reminder.");
      return;
    }
    if (settings.reminderText !== textToSet) {
      await handleSettingChange("reminderText", textToSet, true);
    }

    if (isLoading || !viewShotRef.current) return;
    setIsLoading(true);
    setStatusMessage("Generating new position for manual set...");
    const newPosition = generateSingleRandomPosition(insets);
    setCaptureSpecificPosition(newPosition);
    await new Promise((resolve) => setTimeout(resolve, CAPTURE_DELAY_MS));
    setStatusMessage("Capturing image for manual set...");
    try {
      const imageFileUri = await captureRef(viewShotRef.current, {
        format: "png",
        quality: 0.9,
        result: "tmpfile",
      });
      if (!imageFileUri)
        throw new Error("Failed to capture image URI for manual set.");

      setStatusMessage("Setting wallpaper manually...");
      const response = await setDeviceWallpaper(
        imageFileUri,
        settings.wallpaperTargetScreen
      ); // Use selected screen
      if (response.success) {
        setStatusMessage(
          `${response.message} (Pos: T:${newPosition.top.toFixed(
            0
          )}, L:${newPosition.left.toFixed(0)})`
        );
      } else {
        setStatusMessage(`Failed to set wallpaper: ${response.message}`);
        Alert.alert(
          "Wallpaper Error",
          `Could not set wallpaper: ${response.message}`
        );
      }
    } catch (error: any) {
      setStatusMessage(`Error during manual set: ${error.message}`);
      Alert.alert(
        "Processing Error",
        `Could not process wallpaper: ${error.message}`
      );
    } finally {
      setIsLoading(false);
      setCaptureSpecificPosition(null);
    }
  };

  return {
    settings,
    liveReminderText,
    setLiveReminderText,
    statusMessage,
    isLoading,
    isSettingsLoading,
    captureSpecificPosition,
    viewShotRef,
    insets,
    handleSettingChange,
    handleReminderTextBlur,
    handlePreGenerateImages,
    handleManualSetWallpaper,
  };
};
