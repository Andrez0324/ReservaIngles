import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CLASES, NIVELES } from "../data/clases";
import { createReservationStore } from "../state/reservationStore";

export const ReservationContext = createContext(null);

export function ReservaProvider({ children }) {
  const referencia = useRef(null);
  if (!referencia.current) {
    referencia.current = createReservationStore({
      storage: AsyncStorage,
      catalogo: CLASES,
      niveles: NIVELES,
    });
  }

  const store = referencia.current;
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  useEffect(() => {
    void store.cargar();
  }, [store]);

  const valor = useMemo(
    () => ({
      ...snapshot,
      perfil: snapshot.datos.perfil,
      estudiante: snapshot.datos.perfil,
      reservas: snapshot.datos.reservas,
      historialAnterior: snapshot.datos.historialAnterior,
      recuperaciones: snapshot.datos.recuperaciones,
      niveles: NIVELES.filter((nivel) => nivel !== "Todos"),
      listo: snapshot.fase === "listo",
      cargando: snapshot.fase === "cargando",
      autenticacion:
        snapshot.fase !== "listo"
          ? "noDisponible"
          : snapshot.datos.perfil
            ? "registradoLocal"
            : "visitante",
      registrarPerfil: store.registrarPerfil,
      actualizarPerfil: store.actualizarPerfil,
      eliminarPerfil: store.eliminarPerfil,
      eliminarReserva: store.eliminarReserva,
      agregarReserva: store.agregarReserva,
      reintentar: store.cargar,
      recuperar: store.recuperar,
    }),
    [snapshot, store],
  );

  return (
    <ReservationContext.Provider value={valor}>
      {children}
    </ReservationContext.Provider>
  );
}

export const ReservationProvider = ReservaProvider;
