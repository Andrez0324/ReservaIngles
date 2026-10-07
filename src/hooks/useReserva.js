import { useContext } from "react";
import { ReservationContext } from "../context/ReservationContext";

export default function useReserva() {
  const contexto = useContext(ReservationContext);
  if (!contexto) {
    throw new Error(
      "useReserva debe usarse dentro de <ReservaProvider>.",
    );
  }
  return contexto;
}
