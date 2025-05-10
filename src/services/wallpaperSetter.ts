// src/services/wallpaperSetter.ts
import { applyWallpaper as applyNativeWallpaper } from "@codeooze/react-native-wallpaper-manager";

interface WallpaperResponse {
  success: boolean;
  message: string;
}

export const setWallpaper = async (
  fileUri: string,
  screenType: "home" | "lock" | "both" = "home"
): Promise<WallpaperResponse> => {
  try {
    const responseMessage = await applyNativeWallpaper(fileUri, screenType);
    return {
      success: true,
      message: responseMessage || "Wallpaper set successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to set wallpaper.",
    };
  }
};
