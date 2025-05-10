// src/components/WallpaperPreview.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

interface WallpaperPreviewProps {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  textPosition: { top: number; left: number };
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const WallpaperPreview: React.FC<WallpaperPreviewProps> = ({
  text,
  textColor = "#FFFFFF",
  backgroundColor = "#000000",
  fontSize = 30,
  textPosition,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]}>
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize,
            top: textPosition.top,
            left: textPosition.left,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    position: "relative",
  },
  text: {
    position: "absolute",
    fontWeight: "bold",
    padding: 10,
    maxWidth: screenWidth * 0.9,
  },
});

export default WallpaperPreview;
