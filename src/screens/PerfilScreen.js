import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useReserva from "../hooks/useReserva";
import useResponsive from "../hooks/useResponsive";
import NivelChip from "../components/NivelChip";
import Boton from "../components/Boton";
import { colors, radius, spacing, typography } from "../theme";

const CAMPOS = [
  { campo: "nombre", etiqueta: "Nombre", autoComplete: "given-name" },
  { campo: "apellido", etiqueta: "Apellido", autoComplete: "family-name" },
  {
    campo: "telefono",
    etiqueta: "Teléfono",
    keyboardType: "phone-pad",
    autoComplete: "tel",
    ayuda:
      "Entre 7 y 15 dígitos. Puedes usar +, espacios, guiones o paréntesis.",
  },
  {
    campo: "correo",
    etiqueta: "Correo electrónico",
    keyboardType: "email-address",
    autoComplete: "email",
  },
  {
    campo: "cc",
    etiqueta: "Cédula de ciudadanía (CC)",
    keyboardType: "number-pad",
    autoComplete: "off",
    ayuda: "Entre 6 y 10 dígitos, sin separadores.",
  },
];
const VACIO = {
  nombre: "",
  apellido: "",
  telefono: "",
  correo: "",
  cc: "",
  nivel: "",
};
export default function PerfilScreen() {
  const {
    perfil,
    niveles,
    registrarPerfil,
    actualizarPerfil,
    eliminarPerfil,
    guardando,
    recuperaciones,
  } = useReserva();
  const { paddingHorizontal } = useResponsive();
  const [formulario, setFormulario] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState(false);
  const limpiarFormulario = () => {
    setFormulario(VACIO);
    setErrores({});
    setMensaje("");
    setEditando(false);
  };
  const editar = () => {
    setFormulario(
      Object.fromEntries(
        Object.keys(VACIO).map((campo) => [campo, perfil[campo]]),
      ),
    );
    setErrores({});
    setMensaje("");
    setEditando(true);
  };
  const actualizar = (campo, valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setMensaje("");
  };
  const guardar = async () => {
    Keyboard.dismiss();
    const resultado = await (editando
      ? actualizarPerfil(formulario)
      : registrarPerfil(formulario));
    if (!resultado.ok) {
      setErrores(resultado.errores || {});
      setMensaje(resultado.mensaje);
      if (resultado.errores)
        Alert.alert(
          "Revisa tu perfil",
          "Hay campos inválidos o incompletos. Revisa los mensajes debajo de cada campo.",
        );
    } else {
      limpiarFormulario();
    }
  };
  const confirmarEliminacion = () =>
    Alert.alert(
      "Eliminar perfil y datos locales",
      "Se eliminarán tu perfil, todas tus reservas, el historial anterior y los respaldos de esta aplicación en este dispositivo. El perfil quedará vacío y podrás registrarte de nuevo. Esta acción no se puede deshacer.",
      [
        { text: "Conservar perfil", style: "cancel" },
        {
          text: "Eliminar perfil y reservas",
          style: "destructive",
          onPress: async () => {
            const resultado = await eliminarPerfil();
            if (!resultado.ok)
              Alert.alert("Eliminación no completada", resultado.mensaje);
          },
        },
      ],
    );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.pantalla}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.contenido, { paddingHorizontal }]}
        >
          <Text style={typography.titulo}>Mi perfil</Text>
          <Text style={typography.secundario}>
            Registro académico local · un estudiante por dispositivo.
          </Text>
          {perfil && !editando ? (
            <View style={styles.ficha}>
              <Text style={typography.subtitulo}>Perfil registrado</Text>
              <Text style={typography.secundario}>
                Tu registro está guardado en este dispositivo.
              </Text>
              {[...CAMPOS, { campo: "nivel", etiqueta: "Nivel de inglés" }].map(
                ({ campo, etiqueta }) => (
                  <View key={campo} style={styles.dato}>
                    <Text style={typography.secundario}>{etiqueta}</Text>
                    <Text selectable style={typography.cuerpo}>
                      {perfil[campo]}
                    </Text>
                  </View>
                ),
              )}
              <Boton
                titulo="Editar perfil"
                disabled={guardando}
                onPress={editar}
              />
              <Boton
                titulo="Eliminar perfil"
                peligro
                disabled={guardando}
                onPress={confirmarEliminacion}
              />
            </View>
          ) : (
            <View style={styles.ficha}>
              <Text style={typography.subtitulo}>
                {editando ? "Editar perfil" : "Completa tu registro"}
              </Text>
              <Text style={typography.secundario}>
                {editando
                  ? "Los seis campos son obligatorios. Tus reservas se conservarán al guardar los cambios."
                  : "Los seis campos son obligatorios. Puedes explorar clases antes de registrarte; el perfil permite identificar tus reservas."}
              </Text>
              {CAMPOS.map(({ campo, etiqueta, ayuda, ...props }) => (
                <View key={campo} style={styles.dato}>
                  <Text style={styles.etiqueta}>{etiqueta} *</Text>
                  <TextInput
                    {...props}
                    accessibilityLabel={`${etiqueta}, obligatorio`}
                    accessibilityHint={errores[campo] || ayuda}
                    style={[styles.input, errores[campo] && styles.inputError]}
                    value={formulario[campo]}
                    onChangeText={(valor) => actualizar(campo, valor)}
                    editable={!guardando}
                    autoCorrect={false}
                    autoCapitalize={
                      campo === "nombre" || campo === "apellido"
                        ? "words"
                        : "none"
                    }
                  />
                  {ayuda && <Text style={typography.secundario}>{ayuda}</Text>}
                  {errores[campo] && (
                    <Text accessibilityRole="alert" style={styles.error}>
                      {errores[campo]}
                    </Text>
                  )}
                </View>
              ))}
              <Text style={styles.etiqueta}>Nivel de inglés *</Text>
              <View style={styles.niveles}>
                {niveles.map((nivel) => (
                  <NivelChip
                    key={nivel}
                    etiqueta={nivel}
                    activo={nivel === formulario.nivel}
                    disabled={guardando}
                    onPress={() => actualizar("nivel", nivel)}
                  />
                ))}
              </View>
              {errores.nivel && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {errores.nivel}
                </Text>
              )}
              {!!mensaje && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {mensaje}
                </Text>
              )}
              <Boton
                titulo={
                  guardando
                    ? "Guardando perfil…"
                    : editando
                      ? "Guardar cambios"
                      : "Registrar perfil"
                }
                disabled={guardando}
                onPress={guardar}
              />
              {editando && (
                <Boton
                  titulo="Cancelar edición"
                  secundario
                  disabled={guardando}
                  onPress={() => {
                    Keyboard.dismiss();
                    limpiarFormulario();
                  }}
                />
              )}
            </View>
          )}
          {recuperaciones.length > 0 && (
            <View style={styles.ficha}>
              <Text style={typography.subtitulo}>
                Respaldo de recuperación conservado
              </Text>
              <Text style={typography.secundario}>
                Los datos anteriores se conservaron para revisión técnica. La
                clave identifica el respaldo local; no es un enlace público.
              </Text>
              {recuperaciones.map((r) => (
                <Text key={r.clave} selectable style={typography.secundario}>
                  {r.clave}
                </Text>
              ))}
            </View>
          )}
          <Text style={typography.secundario}>
            Esta sesión es simulada. El almacenamiento local no ofrece
            autenticación segura ni protección de datos para producción. Usa
            datos ficticios durante la evaluación.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.fondo },
  contenido: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  ficha: {
    backgroundColor: colors.superficie,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dato: { gap: spacing.xs },
  etiqueta: { ...typography.cuerpo, fontWeight: "600" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.texto,
    fontSize: 16,
  },
  inputError: { borderColor: colors.peligro },
  error: { color: colors.peligro, fontSize: 14 },
  niveles: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
