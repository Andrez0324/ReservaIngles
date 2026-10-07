import React from "react";
import { View, Text, SectionList, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useReserva from "../hooks/useReserva";
import useResponsive from "../hooks/useResponsive";
import EstadoVacio from "../components/EstadoVacio";
import EtiquetaNivel from "../components/EtiquetaNivel";
import Boton from "../components/Boton";
import { ordenarReservas } from "../state/reservationDomain";
import { formatearPrecio } from "../data/clases";
import { colors, radius, spacing, typography } from "../theme";

export default function ReservasScreen({ navigation }) {
  const { reservas, historialAnterior, perfil, eliminarReserva, guardando } =
    useReserva();
  const { paddingHorizontal } = useResponsive();
  const propias = reservas.filter((r) => r.estudianteId === perfil?.id);
  const confirmarEliminacion = (reserva) =>
    Alert.alert(
      "Cancelar reserva",
      `¿Eliminar la reserva de «${reserva.titulo}» en el horario ${reserva.horario}? Se liberará un cupo de la clase.`,
      [
        { text: "Conservar reserva", style: "cancel" },
        {
          text: "Eliminar reserva",
          style: "destructive",
          onPress: async () => {
            const resultado = await eliminarReserva(reserva.id);
            if (!resultado.ok)
              Alert.alert("No se pudo eliminar la reserva", resultado.mensaje);
          },
        },
      ],
    );
  const secciones = [
    {
      titulo: "Reservas confirmadas",
      anterior: false,
      data: ordenarReservas(propias),
    },
  ];
  if (historialAnterior.length)
    secciones.push({
      titulo: "Historial anterior sin propietario",
      anterior: true,
      data: ordenarReservas(historialAnterior),
    });
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.pantalla}>
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          padding: paddingHorizontal,
          paddingBottom: spacing.xl,
          flexGrow: 1,
          width: "100%",
          maxWidth: 960,
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <Text style={typography.titulo}>Mis reservas</Text>
            <Text style={typography.secundario}>
              Historial ordenado por creación, de más reciente a más antiguo.
              Los horarios son semanales; todavía no hay fechas de sesiones.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.encabezado}>
            <Text style={typography.subtitulo}>{section.titulo}</Text>
            {section.anterior && (
              <Text style={typography.secundario}>
                Conservado de la versión anterior. No está asignado al perfil
                actual ni descuenta sus cupos.
              </Text>
            )}
            {!section.anterior && !propias.length && (
              <EstadoVacio
                icono="calendar-outline"
                titulo="Aún no tienes reservas"
                mensaje="Explora las clases, completa tu perfil y elige un horario para reservar."
                textoAccion="Explorar clases"
                onAction={() => navigation.navigate("Clases")}
              />
            )}
          </View>
        )}
        renderItem={({ item, section }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.estado}>
              {section.anterior
                ? "Registro anterior · sin asignar"
                : "Confirmada · guardada en este dispositivo"}
            </Text>
            <Text style={typography.subtitulo}>{item.titulo}</Text>
            <EtiquetaNivel nivel={item.nivel} />
            <Text style={typography.cuerpo}>Profesor: {item.profesor}</Text>
            <Text style={typography.cuerpo}>Horario: {item.horario}</Text>
            {item.modalidad && (
              <Text style={typography.cuerpo}>Modalidad: {item.modalidad}</Text>
            )}
            {Number.isFinite(item.precio) && (
              <Text style={styles.precio}>{formatearPrecio(item.precio)}</Text>
            )}
            <Text style={typography.secundario}>
              Creada el {new Date(item.creadoEn).toLocaleString("es-CO")}
            </Text>
            {!section.anterior && (
              <Boton
                titulo={guardando ? "Guardando cambios…" : "Cancelar reserva"}
                peligro
                disabled={guardando}
                accessibilityLabel={`Cancelar reserva de ${item.titulo}, ${item.horario}`}
                onPress={() => confirmarEliminacion(item)}
              />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  encabezado: { gap: spacing.sm, marginBottom: spacing.lg },
  tarjeta: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  estado: { color: colors.exito, fontWeight: "600", fontSize: 13 },
  precio: { color: colors.primario, fontWeight: "700", fontSize: 16 },
});
