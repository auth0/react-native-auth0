import React from 'react';
import {
  Auth0Provider,
  useAuth0,
  BiometricPolicy,
  LocalAuthenticationStrategy,
  LocalAuthenticationLevel,
} from 'react-native-auth0';
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import config from '../auth0-configuration';

const AUTH0_DOMAIN = config.domain;
const AUTH0_CLIENT_ID = config.clientId;

/**
 * A helper component that contains the logic to switch between the
 * authentication stack and the main application stack based on user state.
 * It's rendered inside the Auth0Provider so it can use the useAuth0 hook.
 */
const AppContent = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  // If user is authenticated, show the main app, otherwise show the login screen.
  return user ? <MainTabNavigator /> : <AuthStackNavigator />;
};

/**
 * This component wraps the entire Hooks-based demo flow with the Auth0Provider,
 * making the authentication context available to all its child screens.
 *
 * Biometric Policy Examples:
 * - BiometricPolicy.default: System-managed, may skip prompt if recently authenticated
 * - BiometricPolicy.always: Always shows biometric prompt on every credential access
 * - BiometricPolicy.session: Shows prompt once, then caches for specified timeout
 * - BiometricPolicy.appLifecycle: Shows prompt once per app lifecycle
 *
 * Uncomment different policies below to test them.
 */
const HooksDemoNavigator = () => {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      // Example: Enable biometric authentication with different policies
      localAuthenticationOptions={{
        title: 'Authenticate to retrieve your credentials',
        subtitle: 'Please authenticate to continue',
        description: 'We need to authenticate you to retrieve your credentials',
        cancelTitle: 'Cancel',
        evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
        fallbackTitle: 'Use Passcode',
        authenticationLevel: LocalAuthenticationLevel.strong,
        deviceCredentialFallback: true,
        // Option 1: Default policy (system-managed)
        biometricPolicy: BiometricPolicy.default,

        // Option 2: Always require biometric authentication
        // biometricPolicy: BiometricPolicy.always,

        // Option 3: Session-based (5 minutes)
        // biometricPolicy: BiometricPolicy.session,
        // biometricTimeout: 300,

        // Option 4: App lifecycle (1 hour)
        // biometricPolicy: BiometricPolicy.appLifecycle,
        // biometricTimeout: 3600,
      }}
    >
      <AppContent />
    </Auth0Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HooksDemoNavigator;
