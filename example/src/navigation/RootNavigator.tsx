// example/src/navigation/RootNavigator.tsx

import React, { Suspense } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SelectionScreen from '../screens/SelectionScreen';

// Lazy load the demo navigators to prevent Auth0Provider from initializing
// until the user actually navigates to those screens.
const HooksDemoNavigator = React.lazy(() => import('./HooksDemoNavigator'));
const ClassDemoNavigator = React.lazy(() => import('./ClassDemoNavigator'));

// Define the parameter list for type safety
export type RootStackParamList = {
  Selection: undefined;
  HooksDemo: undefined;
  ClassDemo: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Loading fallback component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#E53935" />
  </View>
);

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
        options={{ headerShown: false }} // The hooks demo will manage its own UI
      >
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <HooksDemoNavigator />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ClassDemo"
        options={{ headerShown: false }} // The class demo will manage its own UI
      >
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <ClassDemoNavigator />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
