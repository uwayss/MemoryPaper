// declarations.d.ts
declare module "@codeooze/react-native-wallpaper-manager" {
  export function applyWallpaper(
    uri: string,
    screen: "home" | "lock" | "both"
  ): Promise<string>;
}
