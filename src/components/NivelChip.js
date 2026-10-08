import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function NivelChip({
  etiqueta,
  activo = false,
  disabled = false,
  onPress,
}) {
  const texto = etiqueta === "Basico" ? "Básico" : etiqueta;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        activo && styles.chipActivo,
        pressed && !disabled && styles.chipPresionado,
        disabled && styles.chipDeshabilitado,
      ]}
    >
      <Text style={[styles.texto, activo && styles.textoActivo]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.superficie,
  },
  chipActivo: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  chipPresionado: {
    opacity: 0.78,
  },
  chipDeshabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: colors.textoSecundario,
    fontSize: 14,
    fontWeight: "600",
  },
  textoActivo: {
    color: "#FFFFFF",
  },
});
