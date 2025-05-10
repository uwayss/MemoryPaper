import { View, Text, Button } from "react-native";
import React from "react";
import { applyWallpaper } from "@codeooze/react-native-wallpaper-manager";
import { Alert } from "react-native";

const uri =
  "https://i.pinimg.com/originals/76/5e/1d/765e1dc8cb1cc115fb3b0b39a895fdeb.jpg";
const screen = "lock";
type wallpaperProps = {
  uri: string;
  screen: "home" | "lock" | "both";
};
export default function MainScreen() {
  const setWallpaper = ({ uri, screen }: wallpaperProps) => {
    applyWallpaper(uri, screen)
      .then((response) => {
        Alert.alert(response);
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  return (
    <View>
      <Text>MainScreen</Text>
      <Button
        title="Set Wallpaper"
        onPress={() => setWallpaper({ uri, screen })}
      />
    </View>
  );
}
