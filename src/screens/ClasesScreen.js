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
import useReserva from "../hooks/useReserva";

export default function ClasesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { columnas, paddingHorizontal } = useResponsive();
  const { reservas } = useReserva();
  const [nivel, setNivel] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const clasesLista = useMemo(() => {
    const reservasPorClase = reservas.reduce((conteo, reserva) => {
      const claseId =
        reserva.claseId || String(reserva.id).split("-")[0];
      conteo[claseId] = (conteo[claseId] || 0) + 1;
      return conteo;
    }, {});

    return CLASES.map((clase) => ({
      ...clase,
      cupos: Math.max(
        0,
        clase.cupos - (reservasPorClase[String(clase.id)] || 0),
      ),
    }));
  }, [reservas]);

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
