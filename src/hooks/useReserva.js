import { useContext } from "react";
import { ReservaContext } from "../context/ReservasContext";

export default function useReserva() {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error("useReserva debe usarse dentro de un <ReservaProvider>");
  }
  return context;
}
