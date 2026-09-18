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
}
