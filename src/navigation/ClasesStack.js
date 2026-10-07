import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ClasesScreen from "../screens/ClasesScreen";
import DetallesClase from "../screens/DetallesClase";

const Stack = createNativeStackNavigator();

export default function ClasesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaClases" component={ClasesScreen} />
      <Stack.Screen name="DetallesClase" component={DetallesClase} />
    </Stack.Navigator>
  );
}
