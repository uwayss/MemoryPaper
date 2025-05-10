// src/screens/MainScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, Alert, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Paragraph,
  ActivityIndicator,
  Switch,
  Text,
  Divider,
  RadioButton,
  TouchableRipple,
  IconButton,
} from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import WallpaperPreview from "../components/WallpaperPreview";
import { setWallpaper as setDeviceWallpaper } from "../services/wallpaperSetter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppSettings,
  loadSettings,
  saveSettings,
  savePreGeneratedImageUris,
} from "../services/storage";
import {
  registerAppBackgroundTask,
  unregisterAppBackgroundTask,
  checkTaskStatus,
  BACKGROUND_WALLPAPER_TASK_ID,
} from "../services/backgroundService";
import { BackgroundTaskStatus } from "expo-background-task";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const TEXT_BLOCK_MAX_WIDTH = screenWidth * 0.9;
const TEXT_BLOCK_MAX_HEIGHT = screenHeight * 0.3;
const NUM_PRE_GENERATED_IMAGES = 5;

const UPDATE_INTERVALS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "12 hours", value: 720 },
];

const MainScreenContent: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    reminderText: "Your reminder here!",
    autoUpdateEnabled: false,
    updateInterval: 15,
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(true);
  const [captureSpecificPosition, setCaptureSpecificPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const viewShotRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();

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
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    if (key === "autoUpdateEnabled" || key === "updateInterval") {
      if (newSettings.autoUpdateEnabled) {
        await registerAppBackgroundTask(newSettings.updateInterval);

        if (newSettings.reminderText.trim()) {
          await handlePreGenerateImages(newSettings.reminderText);
        }
      } else {
        await unregisterAppBackgroundTask();
      }
    }

    if (
      key === "reminderText" &&
      newSettings.autoUpdateEnabled &&
      newSettings.reminderText.trim()
    ) {
      await handlePreGenerateImages(newSettings.reminderText);
    }
  };

  const generateSingleRandomPosition = useCallback(() => {
    const safeAreaTop = insets.top || 0;
    const safeAreaBottom = insets.bottom || 0;
    const safeAreaLeft = insets.left || 0;
    const safeAreaRight = insets.right || 0;

    const maxTop =
      screenHeight - TEXT_BLOCK_MAX_HEIGHT - safeAreaTop - safeAreaBottom - 20;
    const maxLeft =
      screenWidth - TEXT_BLOCK_MAX_WIDTH - safeAreaLeft - safeAreaRight - 20;

    const newTop =
      Math.floor(Math.random() * Math.max(0, maxTop)) + safeAreaTop + 10;
    const newLeft =
      Math.floor(Math.random() * Math.max(0, maxLeft)) + safeAreaLeft + 10;
    return { top: newTop, left: newLeft };
  }, [insets]);

  const handlePreGenerateImages = async (textToRender: string) => {
    if (!textToRender.trim()) {
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

    let currentReminderText = settings.reminderText;
    if (currentReminderText !== textToRender) {
    }

    for (let i = 0; i < NUM_PRE_GENERATED_IMAGES; i++) {
      const pos = generateSingleRandomPosition();
      setCaptureSpecificPosition(pos);

      await new Promise((resolve) => setTimeout(resolve, 100));

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
        } else {
          console.warn(
            "Failed to capture one of the pre-generated images (null URI)."
          );
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
    if (!settings.reminderText.trim()) {
      Alert.alert("Input Required", "Please enter text for your reminder.");
      return;
    }
    if (isLoading) return;
    if (!viewShotRef.current) {
      setStatusMessage("ViewShot reference not available for capture.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Generating new position for manual set...");
    const newPosition = generateSingleRandomPosition();
    setCaptureSpecificPosition(newPosition);

    await new Promise((resolve) => setTimeout(resolve, 100));

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
      const response = await setDeviceWallpaper(imageFileUri, "home");

      if (response.success) {
        setStatusMessage(
          response.message +
            ` (Pos: T:${newPosition.top.toFixed(
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

  const handleCheckStatus = async () => {
    setStatusMessage("Checking task status...");
    const { status, isRegistered } = await checkTaskStatus();
    const statusString =
      status !== null && BackgroundTaskStatus[status]
        ? BackgroundTaskStatus[status]
        : "N/A";
    Alert.alert(
      "Background Task Status",
      `Availability: ${statusString}\nDefinition Registered with TaskManager: ${isRegistered}`
    );
    setStatusMessage("Task status checked.");
  };

  if (isSettingsLoading) {
    return (
      <View style={styles.centeredLoadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContentContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Card style={styles.card}>
        <Card.Title title="Memory Wallpaper" />
        <Card.Content>
          <TextInput
            label="Reminder Text"
            value={settings.reminderText}
            onChangeText={(text) => handleSettingChange("reminderText", text)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            disabled={isLoading}
          />
          <Button
            mode="contained"
            onPress={handleManualSetWallpaper}
            style={styles.button}
            disabled={isLoading}
            icon="image-edit-outline"
          >
            {isLoading &&
            (statusMessage.includes("manual set") ||
              statusMessage.includes("Generating new position"))
              ? "Processing..."
              : "Set Wallpaper Now"}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Automatic Updates" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text variant="bodyMedium">Enable Automatic Changes</Text>
            <Switch
              value={settings.autoUpdateEnabled}
              onValueChange={(value) =>
                handleSettingChange("autoUpdateEnabled", value)
              }
              disabled={isLoading}
            />
          </View>
          {settings.autoUpdateEnabled && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleSmall" style={styles.radioGroupLabel}>
                Update Interval:
              </Text>
              <RadioButton.Group
                onValueChange={(value) =>
                  handleSettingChange("updateInterval", parseInt(value, 10))
                }
                value={String(settings.updateInterval)}
              >
                {UPDATE_INTERVALS.map((interval) => (
                  <TouchableRipple
                    key={interval.value}
                    onPress={() =>
                      !isLoading &&
                      handleSettingChange("updateInterval", interval.value)
                    }
                    disabled={isLoading}
                  >
                    <View style={styles.radioButtonRow}>
                      <RadioButton.Android
                        value={String(interval.value)}
                        status={
                          settings.updateInterval === interval.value
                            ? "checked"
                            : "unchecked"
                        }
                        disabled={isLoading}
                      />
                      <Text variant="bodyMedium">{interval.label}</Text>
                    </View>
                  </TouchableRipple>
                ))}
              </RadioButton.Group>
              <Button
                mode="outlined"
                onPress={() => handlePreGenerateImages(settings.reminderText)}
                style={styles.button}
                disabled={isLoading || !settings.autoUpdateEnabled}
                icon="image-multiple-outline"
              >
                {isLoading &&
                statusMessage.startsWith("Generating") &&
                !statusMessage.includes("manual set")
                  ? "Generating..."
                  : "Re-generate Cached Images"}
              </Button>
            </>
          )}
          <Button
            onPress={handleCheckStatus}
            mode="text"
            disabled={isLoading}
            style={styles.button}
          >
            Check Background Task Status
          </Button>
        </Card.Content>
      </Card>

      {isLoading &&
      statusMessage &&
      !statusMessage.startsWith("Generating") &&
      !statusMessage.includes("manual set") ? (
        <ActivityIndicator animating={true} style={styles.loader} />
      ) : null}
      {statusMessage ? (
        <Paragraph style={styles.statusText}>{statusMessage}</Paragraph>
      ) : null}

      {/* Offscreen ViewShot for capturing */}
      <View style={styles.offscreenPreviewContainer} pointerEvents="none">
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 0.9, result: "tmpfile" }}
        >
          <WallpaperPreview
            text={settings.reminderText}
            textPosition={
              captureSpecificPosition || {
                top: -screenHeight,
                left: -screenWidth,
              }
            }
            backgroundColor="#0000FF"
            textColor="#FFFFFF"
          />
        </ViewShot>
      </View>
    </ScrollView>
  );
};

export default function MainScreen() {
  return <MainScreenContent />;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContentContainer: {
    paddingVertical: 8,
  },
  centeredLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  card: {
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: 4,
  },
  loader: {
    marginVertical: 16,
  },
  statusText: {
    textAlign: "center",
    color: "grey",
    marginTop: 10,
    marginHorizontal: 16,
    paddingBottom: 10,
  },
  offscreenPreviewContainer: {
    position: "absolute",
    left: -screenWidth * 2,
    top: -screenHeight * 2,
    width: screenWidth,
    height: screenHeight,
    opacity: 0,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 10,
  },
  radioGroupLabel: {
    marginBottom: 8,
  },
  radioButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
});
