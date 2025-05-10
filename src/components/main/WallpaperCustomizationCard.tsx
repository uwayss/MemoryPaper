// src/components/main/WallpaperCustomizationCard.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  TextInput,
  Text,
  RadioButton,
  TouchableRipple,
  Divider,
  List,
} from "react-native-paper";
import { AppSettings, WallpaperTargetScreen } from "../../types/settings";
import {
  FONT_SIZE_OPTIONS,
  WALLPAPER_TARGET_SCREEN_OPTIONS,
} from "../../config/constants";

interface WallpaperCustomizationCardProps {
  settings: AppSettings;
  isLoading: boolean;
  onTextColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onTargetScreenChange: (target: WallpaperTargetScreen) => void;
}

export const WallpaperCustomizationCard: React.FC<
  WallpaperCustomizationCardProps
> = ({
  settings,
  isLoading,
  onTextColorChange,
  onBackgroundColorChange,
  onFontSizeChange,
  onTargetScreenChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const handlePress = () => {
    if (!isLoading) {
      setExpanded(!expanded);
    }
  };
  const isValidHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContentNoVerticalPadding}>
        <List.Accordion
          title="Wallpaper Appearance"
          left={(props) => <List.Icon {...props} icon="palette-outline" />}
          expanded={expanded}
          onPress={handlePress}
          style={[styles.accordion, isLoading && styles.disabledAccordion]}
          titleStyle={styles.accordionTitle}
        >
          <View style={styles.accordionInnerContent}>
            <Text variant="titleSmall" style={styles.radioGroupLabel}>
              Target Screen:
            </Text>
            <RadioButton.Group
              onValueChange={(value) =>
                onTargetScreenChange(value as WallpaperTargetScreen)
              }
              value={settings.wallpaperTargetScreen}
            >
              {WALLPAPER_TARGET_SCREEN_OPTIONS.map((option) => (
                <TouchableRipple
                  key={option.value}
                  onPress={() =>
                    !isLoading && onTargetScreenChange(option.value)
                  }
                  disabled={isLoading}
                >
                  <View style={styles.radioButtonRow}>
                    <RadioButton.Android
                      value={option.value}
                      status={
                        settings.wallpaperTargetScreen === option.value
                          ? "checked"
                          : "unchecked"
                      }
                      disabled={isLoading}
                    />
                    <Text variant="bodyMedium">{option.label}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </RadioButton.Group>
            <Divider style={styles.divider} />

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
                        settings.fontSize === option.value
                          ? "checked"
                          : "unchecked"
                      }
                      disabled={isLoading}
                    />
                    <Text variant="bodyMedium">{option.label}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </RadioButton.Group>
          </View>
        </List.Accordion>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  cardContentNoVerticalPadding: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  accordion: {},
  disabledAccordion: {
    opacity: 0.6,
  },
  accordionTitle: {},
  accordionInnerContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
