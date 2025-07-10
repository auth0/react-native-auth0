import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClassLoginScreen from '../screens/class-based/ClassLogin';
import ClassProfileScreen from '../screens/class-based/ClassProfile';
import ClassApiTestsScreen from '../screens/class-based/ClassApiTests';
import type { Credentials } from 'react-native-auth0';

/**
 * Defines the screens and their parameters for the class-based navigation stack.
 * This provides type safety for navigation calls and route props.
 */
export type ClassDemoStackParamList = {
  ClassLogin: undefined;
  ClassProfile: { credentials: Credentials }; // Expects credentials to be passed after login
  ClassApiTests: { accessToken: string }; // Expects an access token for API calls
};

const Stack = createStackNavigator<ClassDemoStackParamList>();

/**
 * The navigator for the entire Class-based demo flow.
 *
 * It does NOT use an Auth0Provider, demonstrating how to use the SDK
 * by importing and calling the Auth0 class instance directly.
 */
const ClassDemoNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="ClassLogin">
      <Stack.Screen
        name="ClassLogin"
        component={ClassLoginScreen}
        options={{ headerShown: false }} // The screen uses its own Header component
      />
      <Stack.Screen
        name="ClassProfile"
        component={ClassProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassApiTests"
        component={ClassApiTestsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ClassDemoNavigator;
