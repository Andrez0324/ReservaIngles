import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useResponsive from "../hooks/useResponsive";
import { colors, radius, spacing, typography, sombra } from "../theme";
import { formatearPrecio } from "../data/clases";
import EtiquetaNivel from "../components/EtiquetaNivel";

export default function DetallesClase({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const clase = route?.params?.clase;
  const { paddingHorizontal, esTablet } = useResponsive();

  if (!clase) {
    return null;
  }

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: clase.imagen }}
          resizeMode="cover"
          style={[estilos.portada, { height: esTablet ? 300 : 220 }]}
        />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  portada: { width: "100%", backgroundColor: colors.primarioSuave },
  datos: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  dato: { alignItems: "center", gap: 2 },
  datoValor: { fontSize: 16, fontWeight: "800", color: colors.texto },
  profesor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.borde,
  },
  profesorNombre: { fontSize: 15, fontWeight: "700", color: colors.texto },
  descripcion: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  barra: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.superficie,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingVertical: spacing.lg,
    paddingTop: spacing.lg,
  },
  precio: { fontSize: 18, fontWeight: "800", color: colors.primario },
});
