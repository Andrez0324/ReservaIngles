import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReservaProvider } from "./src/context/ReservasContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <ReservaProvider>
        <RootNavigator />
      </ReservaProvider>
    </SafeAreaProvider>
  );
}
