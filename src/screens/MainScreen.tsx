// src/screens/MainScreen.tsx
import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { ActivityIndicator, Paragraph } from "react-native-paper";
import ViewShot from "react-native-view-shot";

import WallpaperPreview from "../components/WallpaperPreview";
import { ManualWallpaperCard } from "../components/main/ManualWallpaperCard";
import { AutomaticUpdateCard } from "../components/main/AutomaticUpdateCard";
import { WallpaperCustomizationCard } from "../components/main/WallpaperCustomizationCard";
import { useMemoryWallpaper } from "../hooks/useMemoryWallpaper";
import { OFFSCREEN_PREVIEW_MULTIPLIER } from "../config/constants";
import { WallpaperTargetScreen } from "../types/settings"; // Import type

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const MainScreenContent: React.FC = () => {
  const {
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
  } = useMemoryWallpaper();

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
      <ManualWallpaperCard
        liveReminderText={liveReminderText}
        isLoading={isLoading}
        statusMessage={statusMessage}
        onLiveReminderTextChange={setLiveReminderText}
        onReminderTextBlur={handleReminderTextBlur}
        onSetWallpaperPress={handleManualSetWallpaper}
      />

      <WallpaperCustomizationCard
        settings={settings}
        isLoading={isLoading}
        onTextColorChange={(color) => handleSettingChange("textColor", color)}
        onBackgroundColorChange={(color) =>
          handleSettingChange("wallpaperBackgroundColor", color)
        }
        onFontSizeChange={(size) => handleSettingChange("fontSize", size)}
        onTargetScreenChange={(target) =>
          handleSettingChange(
            "wallpaperTargetScreen",
            target as WallpaperTargetScreen
          )
        }
      />

      <AutomaticUpdateCard
        settings={settings}
        isLoading={isLoading}
        statusMessage={statusMessage}
        onAutoUpdateChange={(value) =>
          handleSettingChange("autoUpdateEnabled", value)
        }
        onIntervalChange={(value) =>
          handleSettingChange("updateInterval", value)
        }
        onRegeneratePress={() => handlePreGenerateImages(settings)}
      />

      {isLoading &&
        statusMessage &&
        !statusMessage.startsWith("Generating") &&
        !statusMessage.includes("manual set") && (
          <ActivityIndicator animating={true} style={styles.loader} />
        )}
      {statusMessage && (
        <Paragraph style={styles.statusText}>{statusMessage}</Paragraph>
      )}

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
            textColor={settings.textColor}
            backgroundColor={settings.wallpaperBackgroundColor}
            fontSize={settings.fontSize}
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
    left: -screenWidth * OFFSCREEN_PREVIEW_MULTIPLIER,
    top: -screenHeight * OFFSCREEN_PREVIEW_MULTIPLIER,
    width: screenWidth,
    height: screenHeight,
    opacity: 0,
  },
});
