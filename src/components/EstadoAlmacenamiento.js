import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useReserva from "../hooks/useReserva";
import Boton from "./Boton";
import { colors, spacing, typography } from "../theme";

export default function EstadoAlmacenamiento({ children }) {
  const {
    listo,
    cargando,
    guardando,
    fase,
    error,
    reintentar,
    recuperar,
  } = useReserva();
  const eliminando = fase === "eliminando";

  if (listo) return children;

  const confirmarRecuperacion = () =>
    Alert.alert(
      "Respaldar y empezar de nuevo",
      "Se guardará y verificará una copia exacta de los datos originales en este dispositivo. El perfil y las reservas activos quedarán vacíos; el respaldo requerirá revisión técnica para recuperar su contenido. No se borrará silenciosamente el original.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Guardar respaldo y continuar",
          onPress: () => {
            void recuperar();
          },
        },
      ],
    );

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={typography.titulo}>
          {eliminando
            ? "Eliminando tus datos"
            : cargando
              ? "Recuperando tus datos"
              : "Almacenamiento local"}
        </Text>
        {(cargando || guardando) && (
          <ActivityIndicator
            size="large"
            color={colors.primario}
            accessibilityLabel="Operación en curso"
          />
        )}
        <Text
          accessibilityRole={error ? "alert" : undefined}
          style={typography.cuerpo}
        >
          {eliminando
            ? "Espera mientras eliminamos el perfil, las reservas, el historial y los respaldos de esta aplicación."
            : cargando
              ? "Espera mientras leemos el perfil y las reservas guardadas."
              : error}
        </Text>
        {!cargando && (
          <Boton
            titulo="Reintentar lectura"
            disabled={guardando}
            onPress={() => {
              void reintentar();
            }}
          />
        )}
        {fase === "legado" && (
          <Boton
            titulo="Conservar historial e iniciar registro"
            disabled={guardando}
            onPress={() => {
              void recuperar();
            }}
          />
        )}
        {fase === "corrupto" && (
          <Boton
            titulo="Respaldar y empezar de nuevo"
            secundario
            disabled={guardando}
            onPress={confirmarRecuperacion}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
});
