import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EstadoVacio from "../components/EstadoVacio";
import EtiquetaNivel from "../components/EtiquetaNivel";
import NivelChip from "../components/NivelChip";
import Card from "../components/Card";
import useResponsive from "../hooks/useResponsive";
import { colors, radius, spacing, typography } from "../theme";
import { formatearPrecio, CLASES, NIVELES } from "../data/clases";

export default function ClasesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { columnas, paddingHorizontal } = useResponsive();
  const [nivel, setNivel] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const resultados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    return CLASES.filter((clase) => {
      const coincideNivel = nivel === "Todos" || clase.nivel === nivel;
      const coincideTexto =
        textoBusqueda === "" ||
        clase.profesor.nombre.toLowerCase().includes(textoBusqueda) ||
        clase.titulo.toLowerCase().includes(textoBusqueda);
      return coincideNivel && coincideTexto;
    });
  }, [nivel, busqueda]);

  return (
    <View style={[style.pantalla, { paddingTop: insets.top + spacing.md }]}>
      <View style={style.buscador}>
        <Text style={typography.titulo}>Aplicacion para clases de ingles </Text>
        <Ionicons name="search" size={18} color={colors.textoSuave} />
        <TextInput
          style={style.input}
          placeholder="Buscar por nivel"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCorrect={false}
        />

        {busqueda.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.textoSuave}
            onPress={() => setBusqueda("")}
          />
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        {NIVELES.map((item) => (
          <NivelChip
            key={item}
            etiqueta={item}
            activo={item === nivel}
            onPress={() => setNivel(item)}
          />
        ))}
      </ScrollView>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            clase={item}
            onPress={() =>
              navigation.navigate("DetallesClase", { clase: item })
            }
          />
        )}
        contentContainerStyle={{
          paddingHorizontal,
          flexGrow: 1,
        }}
        numColumns={columnas}
        listEmptyComponent={
          <EstadoVacio
            icono="search-outline"
            titulo="No encontraramos resultados"
            mensaje="La combinacion de busqueda no tiene resultados"
            onAction={() => {
              setNivel("Todos");
              setBusqueda("");
            }}
          />
        }
      />
    </View>
  );
}

const style = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },

  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 46,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
  },

  input: { flex: 1, fontSize: 14, color: colors.texto, paddingVertical: 0 },
});
