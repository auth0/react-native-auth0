/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import {
  useAuth0,
  Auth0Provider,
  LocalAuthenticationOptions,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
} from 'react-native-auth0';
import config from './auth0-configuration';

const Home = () => {
  const { authorize, clearSession, user, getCredentials, error } = useAuth0();

  const onLogin = async () => {
    await authorize();
    const credentials = await getCredentials(undefined, 0, {});
    Alert.alert('AccessToken: ' + credentials?.accessToken);
  };

  const loggedIn = user !== undefined && user !== null;

  const onLogout = async () => {
    await clearSession();
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
};

const App = () => {
  const localAuthOptions: LocalAuthenticationOptions = {
    title: 'Authenticate to retreive your credentials',
    subtitle: 'Please authenticate to continue',
    description: 'We need to authenticate you to retrieve your credentials',
    cancelTitle: 'Cancel',
    evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
    fallbackTitle: 'Use Passcode',
    authenticationLevel: LocalAuthenticationLevel.strong,
    deviceCredentialFallback: true,
  };

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      localAuthenticationOptions={localAuthOptions}
    >
      <Home />
    </Auth0Provider>
  );
};

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

export default App;
