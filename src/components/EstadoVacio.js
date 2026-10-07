import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export default function EstadoVacio({
  icono,
  titulo,
  mensaje,
  onAction,
}) {
  return (
    <View style={styles.container}>
      {icono ? (
        <Ionicons
          name={icono}
          size={34}
          color={colors.textoSecundario}
          accessibilityElementsHidden
        />
      ) : null}
      {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
      <Text style={styles.texto}>
        {mensaje || "No hay elementos para mostrar"}
      </Text>
      {onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.boton}
        >
          <Text style={styles.textoBoton}>Limpiar filtros</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.texto,
    textAlign: "center",
  },
  texto: {
    fontSize: 15,
    color: colors.textoSecundario,
    textAlign: "center",
  },
  boton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primario,
  },
  textoBoton: { color: "#FFFFFF", fontWeight: "700" },
});
