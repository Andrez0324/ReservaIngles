import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function EtiquetaNivel({ nivel }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{nivel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarioClaro,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  text: { fontSize: 12, fontWeight: "600", color: colors.primario },
});
