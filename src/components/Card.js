import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import EtiquetaNivel from "./EtiquetaNivel";
import { colors, radius, spacing } from "../theme";

export default function Card({ clase, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tarjeta}>
      <Image source={{ uri: clase.imagen }} style={styles.imagen} />
      <View style={styles.cuerpo}>
        <EtiquetaNivel nivel={clase.nivel} />
        <Text style={styles.titulo}>{clase.titulo}</Text>
        <Text style={styles.precio}>${clase.precio}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    elevation: 2,
  },
  imagen: { width: "100%", height: 140 },
  cuerpo: { padding: spacing.lg, gap: spacing.sm },
  titulo: { fontSize: 16, fontWeight: "700", color: colors.texto },
  precio: { fontSize: 14, fontWeight: "800", color: colors.primario },
});
