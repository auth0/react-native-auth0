// example/src/navigation/RootNavigator.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectionScreen from '../screens/SelectionScreen';
import HooksDemoNavigator from './HooksDemoNavigator';
import ClassDemoNavigator from './ClassDemoNavigator';

// Define the parameter list for type safety
export type RootStackParamList = {
  Selection: undefined;
  HooksDemo: undefined;
  ClassDemo: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * The top-level navigator that allows the user to select which
 * demo they want to see: the recommended Hooks-based approach or
 * the class-based approach.
 */
const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Selection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Selection"
        component={SelectionScreen}
        options={{ title: 'React Native Auth0 Demo' }}
      />
      <Stack.Screen
        name="HooksDemo"
        component={HooksDemoNavigator}
        options={{ headerShown: false }} // The hooks demo will manage its own UI
      />
      <Stack.Screen
        name="ClassDemo"
        component={ClassDemoNavigator}
        options={{ headerShown: false }} // The class demo will manage its own UI
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
