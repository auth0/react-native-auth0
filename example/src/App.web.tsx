/**
 * Web-specific App configuration
 * This file handles web-specific overrides and configurations
 */
import React from 'react';
import { View, Text, Platform, Button, StyleSheet } from 'react-native';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';
import config from './auth0-configuration';

function HomeProvider() {
  const { user, error, loginWithRedirect, logout } = useAuth0();
  const onLogin = async () => {
    loginWithRedirect();
  };

  const loggedIn = user !== undefined && user !== null;

  const onLogout = async () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Auth0Sample - Login </Text>
      {user && <Text>You are logged in as {user.name}</Text>}
      {!user && <Text>You are not logged in</Text>}
      <Button
        onPress={loggedIn ? onLogout : onLogin}
        title={loggedIn ? 'Log Out' : 'Log In'}
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

function App() {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(config.audience ? { audience: config.audience } : null),
        scope: 'read:current_user update:current_user_metadata',
      }}
    >
      <HomeProvider />
    </Auth0Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  error: {
    margin: 20,
    textAlign: 'center',
    color: '#D8000C',
  },
});
