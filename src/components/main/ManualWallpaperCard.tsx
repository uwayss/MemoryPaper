// src/components/main/ManualWallpaperCard.tsx
import React from "react";
import { Card, TextInput, Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { AppSettings } from "../../types/settings";

interface ManualWallpaperCardProps {
  settings: AppSettings;
  isLoading: boolean;
  statusMessage: string;
  onReminderTextChange: (text: string) => void;
  onSetWallpaperPress: () => void;
}

export const ManualWallpaperCard: React.FC<ManualWallpaperCardProps> = ({
  settings,
  isLoading,
  statusMessage,
  onReminderTextChange,
  onSetWallpaperPress,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Memory Wallpaper" />
      <Card.Content>
        <TextInput
          label="Reminder Text"
          value={settings.reminderText}
          onChangeText={onReminderTextChange}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          disabled={isLoading}
        />
        <Button
          mode="contained"
          onPress={onSetWallpaperPress}
          style={styles.button}
          disabled={isLoading}
          icon="image-edit-outline"
        >
          {isLoading &&
          (statusMessage.includes("manual set") ||
            statusMessage.includes("Generating new position"))
            ? "Processing..."
            : "Set Wallpaper Now"}
        </Button>
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
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: 4,
  },
});
