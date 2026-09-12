import { useWindowDimensions } from "react-native";

export default function useResponsive() {
    const { width, height } = useWindowDimensions();

    const esTablet = width >= 768;
    const esHorizontal = width > height;

    return {
        width,
        height,
        esTablet,
        esHorizontal,
        columnas: esTablet ? 2 : 1,
        anchoTarjeta: esTablet ? 320 : Math.min(width * 0.72, 300),
        paddingHorizontal: esTablet ? 32 : 16,
    };
}
