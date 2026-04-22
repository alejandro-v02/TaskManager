import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../ui/screens/DashboardScreen';

// Define las pantallas disponibles y sus parámetros
// undefined = la pantalla no recibe parámetros
export type RootStackParamList = {
  Dashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // oculta el header nativo, el Dashboard tiene su propio header
          headerStyle: { backgroundColor: '#0F0F1A' },
          headerTintColor: '#FFFFFF',
          cardStyle: { backgroundColor: '#0F0F1A' },
        }}
      >
        {/* Pantalla principal — única pantalla por ahora */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Task Manager' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}