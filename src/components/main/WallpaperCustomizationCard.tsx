// src/components/main/WallpaperCustomizationCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  TextInput,
  Text,
  RadioButton,
  TouchableRipple,
  Divider,
} from "react-native-paper";
import { AppSettings } from "../../types/settings";
import { FONT_SIZE_OPTIONS } from "../../config/constants";

interface WallpaperCustomizationCardProps {
  settings: AppSettings;
  isLoading: boolean;
  onTextColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
}

export const WallpaperCustomizationCard: React.FC<
  WallpaperCustomizationCardProps
> = ({
  settings,
  isLoading,
  onTextColorChange,
  onBackgroundColorChange,
  onFontSizeChange,
}) => {
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
        <Divider style={styles.divider} />
        <Text variant="titleSmall" style={styles.radioGroupLabel}>
          Font Size:
        </Text>
        <RadioButton.Group
          onValueChange={(value) => onFontSizeChange(parseInt(value, 10))}
          value={String(settings.fontSize)}
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <TouchableRipple
              key={option.value}
              onPress={() => !isLoading && onFontSizeChange(option.value)}
              disabled={isLoading}
            >
              <View style={styles.radioButtonRow}>
                <RadioButton.Android
                  value={String(option.value)}
                  status={
                    settings.fontSize === option.value ? "checked" : "unchecked"
                  }
                  disabled={isLoading}
                />
                <Text variant="bodyMedium">{option.label}</Text>
              </View>
            </TouchableRipple>
          ))}
        </RadioButton.Group>
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
    marginBottom: 12,
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
  divider: {
    marginVertical: 12,
  },
  radioGroupLabel: {
    marginBottom: 8,
  },
  radioButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
});
