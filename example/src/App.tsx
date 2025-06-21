/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import {
  useAuth0,
  Auth0Provider,
  type LocalAuthenticationOptions,
  LocalAuthenticationLevel,
  LocalAuthenticationStrategy,
} from 'react-native-auth0';

import config from './auth0-configuration';

import {
  type NavigationProp,
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const Home = ({ navigation }: { navigation: NavigationProp<any> }) => {
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
      <Button
        title="Go to Second Screen"
        onPress={() => navigation.navigate('Second')}
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
};

const HomeProvider = ({ navigation }: { navigation: NavigationProp<any> }) => {
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
      <Home navigation={navigation} />
    </Auth0Provider>
  );
};

const SecondScreen = () => {
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

const SecondScreenProvider = () => {
  return (
    <Auth0Provider
      domain={config.domainSecondScreen}
      clientId={config.clientIdSecondScreen}
    >
      <SecondScreen />
    </Auth0Provider>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeProvider} />
        <Stack.Screen name="Second" component={SecondScreenProvider} />
      </Stack.Navigator>
    </NavigationContainer>
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
