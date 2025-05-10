// src/services/backgroundService.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";

export const BACKGROUND_WALLPAPER_TASK_ID =
  "com.uwayss.memorypaper.wallpaperUpdateTask";

export async function registerAppBackgroundTask(
  intervalInMinutes: number
): Promise<void> {
  try {
    try {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_WALLPAPER_TASK_ID);
      console.log(
        `Previously registered task ${BACKGROUND_WALLPAPER_TASK_ID} (if any) unregistered.`
      );
    } catch (unregisterError) {
      console.log(
        `No prior task ${BACKGROUND_WALLPAPER_TASK_ID} to unregister or error during unregistration:`,
        unregisterError
      );
    }

    await BackgroundTask.registerTaskAsync(BACKGROUND_WALLPAPER_TASK_ID, {
      minimumInterval: intervalInMinutes * 60,
    });
    console.log(
      `Background task ${BACKGROUND_WALLPAPER_TASK_ID} registered with interval: ${intervalInMinutes} minutes.`
    );
  } catch (error) {
    console.error(
      `Failed to register background task ${BACKGROUND_WALLPAPER_TASK_ID}:`,
      error
    );
  }
}

export async function unregisterAppBackgroundTask(): Promise<void> {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_WALLPAPER_TASK_ID);
    console.log(
      `Attempted to unregister background task ${BACKGROUND_WALLPAPER_TASK_ID}.`
    );
  } catch (error) {
    console.error(
      `Failed to unregister background task ${BACKGROUND_WALLPAPER_TASK_ID}:`,
      error
    );
  }
}

export async function checkTaskStatus(): Promise<{
  status: BackgroundTask.BackgroundTaskStatus | null;
  isRegistered: boolean;
}> {
  let status: BackgroundTask.BackgroundTaskStatus | null = null;
  let isRegistered = false;
  try {
    status = await BackgroundTask.getStatusAsync();
    isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_WALLPAPER_TASK_ID
    );

    const statusString =
      status !== null && BackgroundTask.BackgroundTaskStatus[status]
        ? BackgroundTask.BackgroundTaskStatus[status]
        : "Unknown or Not Available";
    console.log("Background Task Status (availability):", statusString);
    console.log(
      "Is task (definition) registered with TaskManager?",
      isRegistered
    );
  } catch (error) {
    console.error("Error checking task status:", error);
  }
  return { status, isRegistered };
}
