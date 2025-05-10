import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MainScreen from "./src/screens/MainScreen";

export default function App() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <MainScreen />
      <StatusBar style="auto" />
    </View>
  );
}
