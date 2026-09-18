import { useContext } from "react";
import { ReservaContext } from "../context/ReservaContext";

export default function useReserva() {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error("useReserva debe usarse dentro de <ReservaProvider>");
  }
  return context;
}
