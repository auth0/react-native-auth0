import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';

/**
 * The absolute root component of the example application.
 *
 * It sets up the main navigation container and renders the RootNavigator,
 * which then decides which demo flow (Hooks or Class-based) to display.
 * The Auth0Provider is now scoped within the Hooks demo flow itself.
 */
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default App;
