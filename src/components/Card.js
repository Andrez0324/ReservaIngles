import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EtiquetaNivel from "./EtiquetaNivel";
import { colors, radius, spacing } from "../theme";
import { formatearPrecio } from "../data/clases";

export default function Card({ clase, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tarjeta}>
      <Image
        source={{ uri: clase.imagen }}
        style={styles.imagen}
        resizeMode="cover"
      />
      <View style={styles.cuerpo}>
        <View style={styles.filaSuperior}>
          <EtiquetaNivel nivel={clase.nivel} />
          <Text style={styles.modalidad}>{clase.modalidad}</Text>
        </View>

        <Text style={styles.titulo}>{clase.titulo}</Text>

        {/* Profesor con foto y nombre */}
        <View style={styles.filaProfesor}>
          <Image source={{ uri: clase.profesor.foto }} style={styles.avatar} />
          <Text style={styles.profesor}>{clase.profesor.nombre}</Text>
        </View>

        <View style={styles.pie}>
          <View style={styles.filaMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textoSuave} />
            <Text style={styles.meta}>{clase.duracion} min</Text>
            <Text style={styles.punto}>•</Text>
            <Ionicons name="people-outline" size={14} color={colors.exito} />
            <Text style={styles.metaDisponibles}>{clase.cupos} cupos</Text>
          </View>
          <Text style={styles.precio}>{formatearPrecio(clase.precio)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  imagen: {
    width: "100%",
    height: 140,
    backgroundColor: colors.primarioSuave,
  },
  cuerpo: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  filaSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalidad: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primario,
    backgroundColor: colors.primarioSuave,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  titulo: { fontSize: 16, fontWeight: "700", color: colors.texto },
  filaProfesor: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borde,
  },
  profesor: { fontSize: 13, color: colors.textoSuave, fontWeight: "600" },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingTop: spacing.sm,
  },
  filaMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, color: colors.textoSuave },
  metaDisponibles: { fontSize: 12, color: colors.exito, fontWeight: "700" },
  punto: { color: colors.borde, marginHorizontal: 4 },
  precio: { fontSize: 14, fontWeight: "800", color: colors.primario },
});
