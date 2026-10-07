import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_RESERVAS = "@reservas_ingles";
const CLAVE_ESTUDIANTE = "@estudiante_ingles";

export const ReservaContext = createContext(null);

export function ReservaProvider({ children }) {
  const [reservas, setReservas] = useState([]);
  const [estudiante, setEstudiante] = useState(null);
  const [cargando, setCargando] = useState(true);
  const reservasRef = useRef([]);
  const colaReservasRef = useRef(Promise.resolve());

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [reservasGuardadas, estudianteGuardado] = await Promise.all([
          AsyncStorage.getItem(CLAVE_RESERVAS),
          AsyncStorage.getItem(CLAVE_ESTUDIANTE),
        ]);
        if (!activo) return;

        if (reservasGuardadas !== null) {
          try {
            const reservasParseadas = JSON.parse(reservasGuardadas);
            if (!Array.isArray(reservasParseadas)) {
              throw new Error("El almacenamiento de reservas no contiene una lista.");
            }
            reservasRef.current = reservasParseadas;
            setReservas(reservasParseadas);
          } catch (error) {
            console.error("Error al interpretar las reservas guardadas:", error);
          }
        }

        if (estudianteGuardado !== null) {
          try {
            const estudianteParseado = JSON.parse(estudianteGuardado);
            const camposPerfil = [
              "nombre",
              "apellido",
              "telefono",
              "correo",
              "cedula",
              "nivelIngles",
            ];
            if (
              !estudianteParseado ||
              typeof estudianteParseado !== "object" ||
              Array.isArray(estudianteParseado) ||
              camposPerfil.some(
                (campo) =>
                  typeof estudianteParseado[campo] !== "string" ||
                  !estudianteParseado[campo].trim(),
              )
            ) {
              throw new Error("El perfil almacenado no tiene un formato válido.");
            }
            setEstudiante(estudianteParseado);
          } catch (error) {
            console.error("Error al interpretar el perfil guardado:", error);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos de la aplicación:", error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  const guardarEstudiante = useCallback(async (datosEstudiante) => {
    await AsyncStorage.setItem(
      CLAVE_ESTUDIANTE,
      JSON.stringify(datosEstudiante),
    );
    setEstudiante(datosEstudiante);
  }, []);

  const agregarReserva = useCallback((clase, horario) => {
    const nuevaReserva = {
      id: `${clase.id}-${horario}`,
      claseId: String(clase.id),
      titulo: clase.titulo,
      nivel: clase.nivel,
      profesor:
        typeof clase.profesor === "string"
          ? clase.profesor
          : clase.profesor.nombre,
      precio: clase.precio,
      modalidad: clase.modalidad,
      horario,
      creadoEn: new Date().toISOString(),
    };

    const operacion = colaReservasRef.current.then(async () => {
      if (reservasRef.current.some((reserva) => reserva.id === nuevaReserva.id)) {
        return { ok: false };
      }
      const reservasActualizadas = [...reservasRef.current, nuevaReserva];
      await AsyncStorage.setItem(
        CLAVE_RESERVAS,
        JSON.stringify(reservasActualizadas),
      );
      reservasRef.current = reservasActualizadas;
      setReservas(reservasActualizadas);
      return { ok: true };
    });

    colaReservasRef.current = operacion.then(
      () => undefined,
      () => undefined,
    );
    return operacion;
  }, []);

  const eliminarReserva = useCallback((id) => {
    const operacion = colaReservasRef.current.then(async () => {
      const reservasActualizadas = reservasRef.current.filter(
        (reserva) => reserva.id !== id,
      );
      await AsyncStorage.setItem(
        CLAVE_RESERVAS,
        JSON.stringify(reservasActualizadas),
      );
      reservasRef.current = reservasActualizadas;
      setReservas(reservasActualizadas);
    });

    colaReservasRef.current = operacion.then(
      () => undefined,
      () => undefined,
    );
    return operacion;
  }, []);

  const valor = useMemo(
    () => ({
      reservas,
      estudiante,
      cargando,
      agregarReserva,
      eliminarReserva,
      guardarEstudiante,
    }),
    [
      reservas,
      estudiante,
      cargando,
      agregarReserva,
      eliminarReserva,
      guardarEstudiante,
    ],
  );

  return (
    <ReservaContext.Provider value={valor}>{children}</ReservaContext.Provider>
  );
}
