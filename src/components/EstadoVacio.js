import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";

export default function EstadoVacio({ icono, titulo, mensaje, onAction }) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={36} color={colors.textoSuave} />
      <Text style={[typography.subtitulo, styles.titulo]}>{titulo}</Text>
      <Text style={[typography.secundario, styles.mensaje]}>{mensaje}</Text>

      {onAction ? (
        <Pressable onPress={onAction} style={styles.boton}>
          <Text style={styles.textoBoton}>Limpiar filtros</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    minHeight: 220,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    textAlign: "center",
  },
  titulo: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.texto,
  },
  mensaje: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: colors.textoSuave,
  },
  boton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primario,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
