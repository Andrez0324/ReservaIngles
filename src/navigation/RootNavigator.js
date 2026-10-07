import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppTabs from "./AppTabs";
import PerfilScreen from "../screens/PerfilScreen";
import useReserva from "../hooks/useReserva";
import { colors, spacing } from "../theme";

export default function RootNavigator() {
  const { estudiante, cargando } = useReserva();

  return (
    <NavigationContainer>
      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color={colors.primario} />
          <Text style={styles.texto}>Cargando tus datos...</Text>
        </View>
      ) : estudiante ? (
        <AppTabs />
      ) : (
        <PerfilScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.fondo,
  },
  texto: { color: colors.textoSecundario },
});
