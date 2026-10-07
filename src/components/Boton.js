import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function Boton({
  titulo,
  onPress,
  disabled = false,
  secundario = false,
  peligro = false,
  accessibilityLabel = titulo,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        secundario && styles.secundario,
        peligro && styles.peligro,
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      <Text
        style={[
          styles.texto,
          secundario && { color: colors.primario },
          peligro && { color: colors.peligro },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    backgroundColor: colors.primario,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  secundario: {
    backgroundColor: colors.primarioSuave,
    borderWidth: 1,
    borderColor: colors.primario,
  },
  peligro: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.peligro,
  },
  texto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
});
