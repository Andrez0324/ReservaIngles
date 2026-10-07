import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAlmacenamiento(clave, valorInicial) {
  const [valor, setValor] = useState(valorInicial);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const guardado = await AsyncStorage.getItem(clave);
        if (activo && guardado !== null) {
          setValor(JSON.parse(guardado));
        }
      } catch (error) {
        console.error(
          `Error al cargar el valor de ${clave} desde AsyncStorage:`,
          error,
        );
      } finally {
        if (activo) setListo(true);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [clave]);

  const actualizar = useCallback(
    async (nuevoValor) => {
      await AsyncStorage.setItem(clave, JSON.stringify(nuevoValor));
      setValor(nuevoValor);
    },
    [clave],
  );

  return { valor, listo, actualizar };
}
