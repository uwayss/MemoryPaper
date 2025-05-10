// src/components/main/AutomaticUpdateCard.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Switch,
  Text,
  Divider,
  Button,
  Menu,
  TouchableRipple,
  IconButton,
  List,
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false);

  const openMenu = () => !isLoading && setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleAccordionPress = () => {
    if (!isLoading) {
      setAccordionExpanded(!accordionExpanded);
    }
  };

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

  const selectedIntervalLabel =
    UPDATE_INTERVALS.find(
      (interval) => interval.value === settings.updateInterval
    )?.label || `${settings.updateInterval} minutes`;

  return (
    <Card style={styles.card}>
      <List.Accordion
        title="Automatic Updates"
        left={(props) => <List.Icon {...props} icon="sync" />}
        expanded={accordionExpanded}
        onPress={handleAccordionPress}
        style={[styles.accordion, isLoading && styles.disabledAccordion]}
        titleStyle={styles.accordionTitle}
      >
        <View style={styles.accordionInnerContent}>
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
              <Text variant="titleSmall" style={styles.settingLabel}>
                Update Interval:
              </Text>
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                  <TouchableRipple
                    onPress={openMenu}
                    disabled={isLoading}
                    style={styles.menuAnchor}
                  >
                    <View style={styles.menuAnchorContent}>
                      <Text variant="bodyLarge" style={styles.menuAnchorText}>
                        {selectedIntervalLabel}
                      </Text>
                      <IconButton
                        icon="menu-down"
                        size={24}
                        style={styles.menuAnchorIcon}
                      />
                    </View>
                  </TouchableRipple>
                }
                style={styles.menuStyle}
              >
                {UPDATE_INTERVALS.map((interval) => (
                  <Menu.Item
                    key={interval.value}
                    onPress={() => {
                      onIntervalChange(interval.value);
                      closeMenu();
                    }}
                    title={interval.label}
                    leadingIcon={
                      settings.updateInterval === interval.value
                        ? "check"
                        : undefined
                    }
                  />
                ))}
              </Menu>

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
        </View>
      </List.Accordion>
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
  accordion: {
    //backgroundColor: '#f0f0f0',
  },
  disabledAccordion: {
    opacity: 0.6,
  },
  accordionTitle: {},
  accordionInnerContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    marginVertical: 10,
  },
  settingLabel: {
    marginBottom: 8,
  },
  menuAnchor: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 4,
    backgroundColor: "transparent",
    marginTop: 4,
    marginBottom: 8,
  },
  menuAnchorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuAnchorText: {},
  menuAnchorIcon: {
    margin: 0,
    padding: 0,
  },
  menuStyle: {},
});
