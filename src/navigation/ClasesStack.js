import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClasesScreen from '../screens/ClasesScreen';
import DetallesClaseScreen from '../screens/DetallesClase';

const Stack = createNativeStackNavigator();

export default function ClasesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={ClasesScreen} />
      <Stack.Screen name="DetallesClase" component={DetallesClaseScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}