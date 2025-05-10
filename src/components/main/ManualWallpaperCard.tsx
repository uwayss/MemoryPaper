// src/components/main/ManualWallpaperCard.tsx
import React from "react";
import { StyleSheet } from "react-native"; // Removed View
import { Card, TextInput, Button } from "react-native-paper"; // Removed Text

interface ManualWallpaperCardProps {
  liveReminderText: string;
  isLoading: boolean;
  statusMessage: string;
  onLiveReminderTextChange: (text: string) => void;
  onReminderTextBlur: () => void;
  onSetWallpaperPress: () => void;
}

export const ManualWallpaperCard: React.FC<ManualWallpaperCardProps> = ({
  liveReminderText,
  isLoading,
  statusMessage,
  onLiveReminderTextChange,
  onReminderTextBlur,
  onSetWallpaperPress,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Memory Wallpaper" />
      <Card.Content>
        <TextInput
          label="Reminder Text"
          value={liveReminderText}
          onChangeText={onLiveReminderTextChange}
          onBlur={onReminderTextBlur}
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
  // Card.Content will provide default padding
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: 4, // Card.Content has bottom padding
  },
});
