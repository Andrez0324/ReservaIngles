import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ClasesStack from "./ClasesStack";
import ReservasScreen from "../screens/ReservasScreen";
import PerfilScreen from "../screens/PerfilScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primario,
        tabBarInactiveTintColor: colors.textoSecundario,
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Inicio: "home-outline",
            Reservas: "calendar-outline",
            Perfil: "person-circle-outline",
          };
          return <Ionicons name={iconos[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={ClasesStack} />
      <Tab.Screen name="Reservas" component={ReservasScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
