import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EstadoVacio from "../components/EstadoVacio";
import NivelChip from "../components/NivelChip";
import Card from "../components/Card";
import useResponsive from "../hooks/useResponsive";
import { colors, radius, spacing, typography } from "../theme";
import { CLASES, NIVELES } from "../data/clases";

export default function ClasesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { columnas, paddingHorizontal } = useResponsive();
  const [nivel, setNivel] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // Estado local para manejar las clases y poder restar cupos en tiempo real
  const [clasesLista, setClasesLista] = useState(CLASES);

  const resultados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    return clasesLista.filter((clase) => {
      const coincideNivel = nivel === "Todos" || clase.nivel === nivel;
      const coincideTexto =
        textoBusqueda === "" ||
        clase.profesor.nombre.toLowerCase().includes(textoBusqueda) ||
        clase.titulo.toLowerCase().includes(textoBusqueda);
      return coincideNivel && coincideTexto;
    });
  }, [nivel, busqueda, clasesLista]);

  // Función para actualizar los cupos de una clase específica tras una reserva
  const actualizarCuposClase = (idClase) => {
    setClasesLista((prevClases) =>
      prevClases.map((item) => {
        if (item.id === idClase && item.cupos > 0) {
          return { ...item, cupos: item.cupos - 1 };
        }
        return item;
      }),
    );
  };

  return (
    <View style={[style.pantalla, { paddingTop: insets.top + spacing.md }]}>
      <View
        style={[
          style.buscadorContainer,
          { marginHorizontal: paddingHorizontal },
        ]}
      >
        <Text style={typography.titulo}>Clases de Inglés</Text>
        <View style={style.buscador}>
          <Ionicons name="search" size={18} color={colors.textoSuave} />
          <TextInput
            style={style.input}
            placeholder="Buscar por profesor o título"
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
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, paddingHorizontal }}
        contentContainerStyle={{ gap: spacing.sm, marginVertical: spacing.md }}
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
              navigation.navigate("DetallesClase", {
                clase: item,
                onReservarExitoso: actualizarCuposClase, // Pasamos la función como parámetro
              })
            }
          />
        )}
        contentContainerStyle={{
          paddingHorizontal,
          flexGrow: 1,
        }}
        numColumns={columnas}
        columnWrapperStyle={columnas > 1 ? { gap: spacing.md } : undefined}
        ListEmptyComponent={
          <EstadoVacio
            icono="search-outline"
            titulo="No encontramos resultados"
            mensaje="La combinación de búsqueda no tiene resultados"
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
  buscadorContainer: { gap: spacing.md, marginBottom: spacing.sm },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.superficie,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 46,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  input: { flex: 1, fontSize: 14, color: colors.texto, paddingVertical: 0 },
});
