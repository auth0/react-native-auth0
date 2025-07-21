// example/src/navigation/AuthStackNavigator.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/hooks/Home';

export type AuthStackParamList = {
  Home: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Navigator for the unauthenticated part of the Hooks-based demo.
 * It displays the main login screen.
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Welcome' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
