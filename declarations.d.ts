// declarations.d.ts
declare module "@codeooze/react-native-wallpaper-manager" {
  export function applyWallpaper(
    uri: string, // Can be a remote URL or hopefully a local file URI
    screen: "home" | "lock" | "both"
  ): Promise<string>; // The README example suggests it resolves with a string message
}
