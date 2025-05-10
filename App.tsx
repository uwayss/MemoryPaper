// App.tsx
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import MainScreen from "./src/screens/MainScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { setWallpaper as setDeviceWallpaper } from "./src/services/wallpaperSetter";
import { getNextImageUri } from "./src/services/storage";
import { BACKGROUND_WALLPAPER_TASK_ID } from "./src/services/backgroundService";

// Task Definition
TaskManager.defineTask(BACKGROUND_WALLPAPER_TASK_ID, async () => {
  try {
    console.log(`Background task (${BACKGROUND_WALLPAPER_TASK_ID}) running...`);
    const imageUri = await getNextImageUri();

    if (imageUri) {
      console.log("Setting wallpaper from background:", imageUri);
      const result = await setDeviceWallpaper(imageUri, "home");
      if (result.success) {
        console.log("Background wallpaper set successfully:", result.message);
        return BackgroundTask.BackgroundTaskResult.Success;
      } else {
        console.error("Background wallpaper set failed:", result.message);
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    } else {
      console.log("No pre-generated images found for background task.");
      return BackgroundTask.BackgroundTaskResult.Success;
    }
  } catch (error) {
    console.error("Error in background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.safeArea}>
          <MainScreen />
        </SafeAreaView>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
