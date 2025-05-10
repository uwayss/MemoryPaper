// App.tsx
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import MainScreen from "./src/screens/MainScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={StyleSheet.absoluteFill}>
          <MainScreen />
        </SafeAreaView>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
