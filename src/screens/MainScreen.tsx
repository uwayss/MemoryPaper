// src/screens/MainScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, Alert } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import WallpaperPreview from "../components/WallpaperPreview";
import { setWallpaper as setDeviceWallpaper } from "../services/wallpaperSetter";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const TEXT_BLOCK_MAX_WIDTH = screenWidth * 0.9;
const TEXT_BLOCK_MAX_HEIGHT = screenHeight * 0.3;

const MainScreenContent: React.FC = () => {
  const [reminderText, setReminderText] = useState<string>(
    "Your reminder here!"
  );
  const [textPosition, setTextPosition] = useState({ top: 50, left: 10 });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [captureTrigger, setCaptureTrigger] = useState<number>(0);

  const viewShotRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();

  const generateRandomPosition = useCallback(() => {
    const maxTop =
      screenHeight - TEXT_BLOCK_MAX_HEIGHT - insets.top - insets.bottom - 20;
    const maxLeft =
      screenWidth - TEXT_BLOCK_MAX_WIDTH - insets.left - insets.right - 20;

    const newTop =
      Math.floor(Math.random() * Math.max(0, maxTop)) + insets.top + 10;
    const newLeft =
      Math.floor(Math.random() * Math.max(0, maxLeft)) + insets.left + 10;

    setTextPosition({ top: newTop, left: newLeft });
  }, [insets.top, insets.bottom, insets.left, insets.right]);

  const actualCaptureAndSetWallpaper = useCallback(async () => {
    if (!viewShotRef.current) {
      setStatusMessage("Error: ViewShot ref not available.");
      setIsLoading(false);
      return;
    }

    setStatusMessage("Capturing image...");
    try {
      const imageFileUri = await captureRef(viewShotRef, {
        format: "png",
        quality: 0.9,
        result: "tmpfile", // Corrected: This gives a file URI
      });

      if (!imageFileUri) {
        throw new Error("Failed to capture image URI.");
      }

      setStatusMessage("Setting wallpaper...");
      const response = await setDeviceWallpaper(imageFileUri, "home");

      if (response.success) {
        setStatusMessage(
          response.message +
            ` (Pos: T:${textPosition.top.toFixed(
              0
            )}, L:${textPosition.left.toFixed(0)})`
        );
      } else {
        setStatusMessage(`Failed: ${response.message}`);
        Alert.alert(
          "Wallpaper Error",
          `Could not set wallpaper: ${response.message}`
        );
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
      Alert.alert(
        "Processing Error",
        `Could not process wallpaper: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [viewShotRef, textPosition, reminderText]); // Added reminderText dependency

  useEffect(() => {
    if (captureTrigger > 0 && isLoading) {
      actualCaptureAndSetWallpaper();
    }
  }, [captureTrigger, isLoading, actualCaptureAndSetWallpaper]);

  const handleSetWallpaperPress = () => {
    if (!reminderText.trim()) {
      Alert.alert("Input Required", "Please enter text for your reminder.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setStatusMessage("Generating new position...");
    generateRandomPosition();
    setCaptureTrigger((prev) => prev + 1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Memory Wallpaper" />
        <Card.Content>
          <TextInput
            label="Reminder Text"
            value={reminderText}
            onChangeText={setReminderText}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          <Button
            mode="contained"
            onPress={handleSetWallpaperPress}
            style={styles.button}
            disabled={isLoading}
            icon="image-edit-outline"
          >
            {isLoading ? "Processing..." : "Set New Wallpaper"}
          </Button>
          {isLoading && (
            <ActivityIndicator animating={true} style={styles.loader} />
          )}
          {statusMessage ? (
            <Paragraph style={styles.statusText}>{statusMessage}</Paragraph>
          ) : null}
        </Card.Content>
      </Card>

      <View style={styles.offscreenPreviewContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 0.9, result: "tmpfile" }}
        >
          <WallpaperPreview text={reminderText} textPosition={textPosition} />
        </ViewShot>
      </View>
    </View>
  );
};

export default function MainScreen() {
  return <MainScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 10,
  },
  statusText: {
    textAlign: "center",
    color: "grey",
    marginTop: 8,
  },
  offscreenPreviewContainer: {
    position: "absolute",
    left: -screenWidth * 2,
    top: -screenHeight * 2,
    width: screenWidth,
    height: screenHeight,
  },
});
