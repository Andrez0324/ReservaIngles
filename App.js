import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import EstadoAlmacenamiento from "./src/components/EstadoAlmacenamiento";
import { ReservaProvider } from "./src/context/ReservationContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <ReservaProvider>
        <EstadoAlmacenamiento>
          <RootNavigator />
        </EstadoAlmacenamiento>
      </ReservaProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
