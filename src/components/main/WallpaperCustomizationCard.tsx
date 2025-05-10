// src/components/main/WallpaperCustomizationCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, TextInput, Text } from "react-native-paper";
import { AppSettings } from "../../types/settings";

interface WallpaperCustomizationCardProps {
  settings: AppSettings;
  isLoading: boolean;
  onTextColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

export const WallpaperCustomizationCard: React.FC<
  WallpaperCustomizationCardProps
> = ({ settings, isLoading, onTextColorChange, onBackgroundColorChange }) => {
  const isValidHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

  return (
    <Card style={styles.card}>
      <Card.Title title="Wallpaper Appearance" />
      <Card.Content>
        <View style={styles.inputRow}>
          <Text style={styles.colorPreviewLabel}>Text Color: </Text>
          <View
            style={[
              styles.colorPreview,
              {
                backgroundColor: isValidHexColor(settings.textColor)
                  ? settings.textColor
                  : "#000000",
              },
            ]}
          />
          <TextInput
            label="Text Color (Hex)"
            value={settings.textColor}
            onChangeText={onTextColorChange}
            mode="outlined"
            style={styles.input}
            disabled={isLoading}
            maxLength={7}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.colorPreviewLabel}>Background: </Text>
          <View
            style={[
              styles.colorPreview,
              {
                backgroundColor: isValidHexColor(
                  settings.wallpaperBackgroundColor
                )
                  ? settings.wallpaperBackgroundColor
                  : "#FFFFFF",
              },
            ]}
          />
          <TextInput
            label="Background Color (Hex)"
            value={settings.wallpaperBackgroundColor}
            onChangeText={onBackgroundColorChange}
            mode="outlined"
            style={styles.input}
            disabled={isLoading}
            maxLength={7}
            autoCapitalize="characters"
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    marginLeft: 8,
  },
  colorPreviewLabel: {
    minWidth: 80,
  },
});
