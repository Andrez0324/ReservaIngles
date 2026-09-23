import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_RESERVAS = "@reservas_ingles";

export const ReservaContext = createContext(null);

export function ReservaProvider({ children }) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  //cargar las reservas que tengo guardadas, sino tengo nada me devuelve un arreglo vacio
  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_RESERVAS);
        if (guardado !== null) {
          setReservas(JSON.parse(guardado));
        } else {
          setReservas([]);
        }
      } catch (error) {
        console.error(
          "Error al cargar las reservas desde AsyncStorage:",
          error,
        );
      } finally {
        setCargando(false);
      }
    };
    Cargar();
  }, []);

  //Hacer el guardado
  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas)).catch(
      (error) => {
        console.log("Error al guardar las reservas:", error);
      },
    );
  }, [reservas, cargando]);

  const agregarReserva = useCallback((clase, horario) => {
    const nuevaReserva = {
      id: clase.id + "-" + horario,
      titulo: clase.titulo,
      nivel: clase.nivel,
      profesor: clase.profesor.nombre,
      precio: clase.precio,
      horario,
      creadoEn: new Date().toISOString(),
    };

    let resultado = { ok: true };
    setReservas((previas) => {
      if (previas.some((r) => r.id === nuevaReserva.id)) {
        resultado = { ok: false };
        return previas;
      }
      return [...previas, nuevaReserva];
    }); // SetReservas
    return resultado;
  }, []); //Cierre callback

  const valor = useMemo(
    () => ({
      reservas,
      cargando,
      agregarReserva,
    }),
    [reservas, cargando, agregarReserva],
  );

  return (
    <ReservaContext.Provider value={valor}>{children}</ReservaContext.Provider>
  );
} // Esta es la llave de cierre para la funcion
