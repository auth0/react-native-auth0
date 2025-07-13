import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';

import config from './auth0-configuration';
import Button from './components/Button';
import Header from './components/Header';
import Result from './components/Result';
import LabeledInput from './components/LabeledInput';

const AuthContent = (): React.JSX.Element => {
  const {
    authorize,
    clearSession,
    user,
    error,
    isLoading,
    getCredentials,
    createUser,
    resetPassword,
    auth, // For direct access to the orchestrator
    users, // For access to the management API client
  } = useAuth0();

  const [result, setResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Helper to run a function and display its result or error
  const runDemo = async (action: () => Promise<any>) => {
    setResult(null);
    setApiError(null);
    try {
      const response = await action();
      setResult(response ?? { success: true });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <Header title="React Native Auth0" />
      {error && <Result title="Hook Error" error={error} result={null} />}
      <Result title="Last Action Result" result={result} error={apiError} />

      {user ? (
        // ------ Logged In State ------
        <View style={styles.section}>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <Result title="User Profile" result={user} error={null} />
          <Button
            onPress={() => runDemo(getCredentials)}
            title="Get Credentials"
          />
          <Button
            onPress={() =>
              runDemo(() =>
                users(result?.accessToken).getUser({ id: user.sub })
              )
            }
            title="Get Full Profile (Mgmt API)"
            disabled={!result?.accessToken}
          />
          <Button onPress={clearSession} title="Log Out" />
        </View>
      ) : (
        // ------ Logged Out State ------
        <>
          <Section title="Web Auth (Recommended Flow)">
            <Button
              onPress={() =>
                authorize({ scope: 'openid profile email offline_access' })
              }
              title="Log In"
            />
          </Section>

          <Section title="User Self-Service">
            <LabeledInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <LabeledInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button
              onPress={() =>
                runDemo(() =>
                  createUser({
                    email,
                    password,
                    connection: 'Username-Password-Authentication',
                  })
                )
              }
              title="Create User (Public Signup)"
            />
            <Button
              onPress={() =>
                runDemo(() =>
                  resetPassword({
                    email,
                    connection: 'Username-Password-Authentication',
                  })
                )
              }
              title="Reset Password"
            />
          </Section>

          <Section title="Unsupported Web Methods (Will Fail)">
            <Button
              onPress={() =>
                runDemo(() =>
                  auth.passwordRealm({ username: '', password: '', realm: '' })
                )
              }
              title="Test auth.passwordRealm()"
            />
          </Section>
        </>
      )}
    </View>
  );
};

const App = (): React.JSX.Element => {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      cacheLocation="localstorage"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <AuthContent />
        </ScrollView>
      </SafeAreaView>
    </Auth0Provider>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.buttonGroup}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 10,
  },
});

export default App;
