// src/components/main/AutomaticUpdateCard.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Switch,
  Text,
  Divider,
  RadioButton,
  TouchableRipple,
  Button,
} from "react-native-paper";
import { BackgroundTaskStatus } from "expo-background-task";
import { Alert } from "react-native";
import { AppSettings } from "../../types/settings";
import { UPDATE_INTERVALS } from "../../config/constants";
import { checkTaskStatus } from "../../services/backgroundService";

interface AutomaticUpdateCardProps {
  settings: AppSettings;
  isLoading: boolean;
  statusMessage: string;
  onAutoUpdateChange: (value: boolean) => void;
  onIntervalChange: (value: number) => void;
  onRegeneratePress: () => void;
}

export const AutomaticUpdateCard: React.FC<AutomaticUpdateCardProps> = ({
  settings,
  isLoading,
  statusMessage,
  onAutoUpdateChange,
  onIntervalChange,
  onRegeneratePress,
}) => {
  const handleCheckStatusPress = async () => {
    const { status, isRegistered } = await checkTaskStatus();
    const statusString =
      status !== null && BackgroundTaskStatus[status]
        ? BackgroundTaskStatus[status]
        : "N/A";
    Alert.alert(
      "Background Task Status",
      `Availability: ${statusString}\nDefinition Registered: ${isRegistered}`
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Automatic Updates" />
      <Card.Content>
        <View style={styles.switchRow}>
          <Text variant="bodyMedium">Enable Automatic Changes</Text>
          <Switch
            value={settings.autoUpdateEnabled}
            onValueChange={onAutoUpdateChange}
            disabled={isLoading}
          />
        </View>
        {settings.autoUpdateEnabled && (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall" style={styles.radioGroupLabel}>
              Update Interval:
            </Text>
            <RadioButton.Group
              onValueChange={(value) => onIntervalChange(parseInt(value, 10))}
              value={String(settings.updateInterval)}
            >
              {UPDATE_INTERVALS.map((interval) => (
                <TouchableRipple
                  key={interval.value}
                  onPress={() => !isLoading && onIntervalChange(interval.value)}
                  disabled={isLoading}
                >
                  <View style={styles.radioButtonRow}>
                    <RadioButton.Android
                      value={String(interval.value)}
                      status={
                        settings.updateInterval === interval.value
                          ? "checked"
                          : "unchecked"
                      }
                      disabled={isLoading}
                    />
                    <Text variant="bodyMedium">{interval.label}</Text>
                  </View>
                </TouchableRipple>
              ))}
            </RadioButton.Group>
            <Button
              mode="outlined"
              onPress={onRegeneratePress}
              style={styles.button}
              disabled={isLoading || !settings.autoUpdateEnabled}
              icon="image-multiple-outline"
            >
              {isLoading &&
              statusMessage.startsWith("Generating") &&
              !statusMessage.includes("manual set")
                ? "Generating..."
                : "Re-generate Cached Images"}
            </Button>
          </>
        )}
        <Button
          onPress={handleCheckStatusPress}
          mode="text"
          disabled={isLoading}
          style={styles.button}
        >
          Check Background Task Status
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
  button: {
    marginTop: 10,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 10,
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
