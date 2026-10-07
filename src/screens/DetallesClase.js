import React, { useState } from "react";
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
import useReserva from "../hooks/useReserva";

export default function DetallesClase({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const claseParam = route?.params?.clase;
  const { paddingHorizontal, esTablet } = useResponsive();
  const { agregarReserva } = useReserva();

  // Estado local de la clase para actualizar los cupos en tiempo real en esta vista
  const [claseDetalle, setClaseDetalle] = useState(claseParam);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [reservando, setReservando] = useState(false);

  if (!claseDetalle) {
    return null;
  }

  const handleReservar = async () => {
    if (!horarioSeleccionado) {
      Alert.alert(
        "Horario requerido",
        "Por favor selecciona un horario antes de confirmar tu reserva.",
      );
      return;
    }

    if (claseDetalle.cupos <= 0) {
      Alert.alert(
        "Sin cupos",
        "Lo sentimos, esta clase ya no tiene cupos disponibles.",
      );
      return;
    }

    if (reservando) return;

    setReservando(true);
    try {
      const resultado = await agregarReserva(claseDetalle, horarioSeleccionado);
      if (!resultado.ok) {
        Alert.alert(
          "Reserva existente",
          "Ya tienes una reserva para esta clase y horario.",
        );
        return;
      }

      setClaseDetalle((actual) => ({
        ...actual,
        cupos: actual.cupos - 1,
      }));

      Alert.alert(
        "¡Reserva Exitosa!",
        `Has reservado la clase "${claseDetalle.titulo}" con ${claseDetalle.profesor.nombre}.\n\nModalidad: ${claseDetalle.modalidad}\nHorario: ${horarioSeleccionado}`,
        [
          {
            text: "Aceptar",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      Alert.alert(
        "No se pudo reservar",
        "Ocurrió un error al guardar la reserva. Inténtalo nuevamente.",
      );
    } finally {
      setReservando(false);
    }
  };

  return (
    <View style={[estilos.pantalla, { paddingTop: insets.top }]}>
      {/* Botón flotante para regresar */}
      <Pressable
        style={estilos.botonRegresar}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={colors.texto} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: claseDetalle.imagen }}
          resizeMode="cover"
          style={[estilos.portada, { height: esTablet ? 320 : 230 }]}
        />

        <View style={[estilos.contenido, { paddingHorizontal }]}>
          <View style={stylesFila}>
            <EtiquetaNivel nivel={claseDetalle.nivel} />
            <Text style={estilos.modalidadBadge}>{claseDetalle.modalidad}</Text>
          </View>

          <Text style={[typography.titulo, { marginTop: spacing.xs }]}>
            {claseDetalle.titulo}
          </Text>
          <Text style={estilos.descripcion}>{claseDetalle.descripcion}</Text>

          {/* Sección de Profesor */}
          <View style={[estilos.seccionProfesor, sombra]}>
            <Image
              source={{ uri: claseDetalle.profesor.foto }}
              style={estilos.avatarProfesor}
            />
            <View style={{ flex: 1 }}>
              <Text style={typography.secundario}>Profesor a cargo</Text>
              <Text style={estilos.nombreProfesor}>
                {claseDetalle.profesor.nombre}
              </Text>
              <Text style={typography.secundario}>
                País de origen: {claseDetalle.profesor.pais}
              </Text>
            </View>
          </View>

          {/* Panel de Datos Clave (Aquí se reflejará el cupo menos) */}
          <View style={[estilos.panelDatos, sombra]}>
            <View style={estilos.itemDato}>
              <Ionicons name="time-outline" size={22} color={colors.primario} />
              <Text style={estilos.valorDato}>{claseDetalle.duracion} min</Text>
              <Text style={typography.secundario}>Duración</Text>
            </View>
            <View style={estilos.itemDato}>
              <Ionicons name="star" size={22} color={colors.acento} />
              <Text style={estilos.valorDato}>{claseDetalle.rating}</Text>
              <Text style={typography.secundario}>Valoración</Text>
            </View>
            <View style={estilos.itemDato}>
              <Ionicons name="people-outline" size={22} color={colors.exito} />
              <Text style={estilos.valorDato}>{claseDetalle.cupos}</Text>
              <Text style={typography.secundario}>Cupos libres</Text>
            </View>
          </View>

          {/* Selección de Horarios */}
          <Text style={[typography.subtitulo, { marginTop: spacing.xl }]}>
            Elige tu Horario de Preferencia:
          </Text>
          <View style={estilos.contenedorHorarios}>
            {claseDetalle.horarios.map((horario, index) => {
              const estaSeleccionado = horarioSeleccionado === horario;
              return (
                <Pressable
                  key={index}
                  style={[
                    estilos.chipHorario,
                    estaSeleccionado && estilos.chipHorarioActivo,
                  ]}
                  onPress={() => setHorarioSeleccionado(horario)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={estaSeleccionado ? "#FFFFFF" : colors.primario}
                  />
                  <Text
                    style={[
                      estilos.textoChipHorario,
                      estaSeleccionado && estilos.textoChipHorarioActivo,
                    ]}
                  >
                    {horario}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Barra Inferior Fija */}
      <View style={[estilos.barraInferior, { paddingHorizontal }]}>
        <View>
          <Text style={typography.secundario}>Precio de la clase</Text>
          <Text style={estilos.precioTexto}>
            {formatearPrecio(claseDetalle.precio)}
          </Text>
        </View>
        <Pressable
          style={[
            estilos.botonReserva,
            (!horarioSeleccionado || claseDetalle.cupos <= 0 || reservando) &&
              estilos.botonReservaDeshabilitado,
          ]}
          onPress={handleReservar}
          disabled={!horarioSeleccionado || claseDetalle.cupos <= 0 || reservando}
        >
          <Text style={estilos.textoBotonReserva}>
            {claseDetalle.cupos <= 0
              ? "Agotado"
              : reservando
                ? "Guardando..."
                : "Reservar Ahora"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const stylesFila = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  botonRegresar: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 20,
    backgroundColor: colors.superficie,
    padding: spacing.sm,
    borderRadius: radius.full,
    ...sombra,
  },
  portada: { width: "100%", backgroundColor: colors.primarioSuave },
  contenido: { paddingTop: spacing.lg },
  modalidadBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primario,
    backgroundColor: colors.primarioSuave,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  descripcion: {
    ...typography.cuerpo,
    color: colors.textoSuave,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  seccionProfesor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  avatarProfesor: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.borde,
  },
  nombreProfesor: { fontSize: 16, fontWeight: "700", color: colors.texto },
  panelDatos: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  itemDato: { alignItems: "center", gap: 2 },
  valorDato: { fontSize: 16, fontWeight: "800", color: colors.texto },
  contenedorHorarios: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipHorario: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  chipHorarioActivo: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  textoChipHorario: { fontSize: 14, fontWeight: "600", color: colors.texto },
  textoChipHorarioActivo: { color: "#FFFFFF" },
  barraInferior: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.superficie,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
    paddingVertical: spacing.md,
    ...sombra,
  },
  precioTexto: { fontSize: 18, fontWeight: "800", color: colors.primario },
  botonReserva: {
    backgroundColor: colors.primario,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  botonReservaDeshabilitado: {
    backgroundColor: colors.borde,
  },
  textoBotonReserva: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
