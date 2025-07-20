import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Auth0, { Auth0Provider, useAuth0, User } from 'react-native-auth0';

import config from './auth0-configuration';
import Button from './components/Button';
import Header from './components/Header';
import Result from './components/Result';
import LabeledInput from './components/LabeledInput';

// ========================================================================
// --- 1. HOOKS-BASED IMPLEMENTATION (Recommended) ---
// ========================================================================

const HooksAuthContent = (): React.JSX.Element => {
  const {
    authorize,
    clearSession,
    user,
    error,
    isLoading,
    getCredentials,
    createUser,
    resetPassword,
    auth,
    users,
  } = useAuth0();

  const [result, setResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      <Header title="React Native Auth0 (Hooks)" />
      {error && <Result title="Hook Error" error={error} result={null} />}
      <Result title="Last Action Result" result={result} error={apiError} />
      {user ? (
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
              title="Create User"
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

const HooksApp = () => (
  <Auth0Provider domain={config.domain} clientId={config.clientId}>
    <HooksAuthContent />
  </Auth0Provider>
);

// ========================================================================
// --- 2. CLASS-BASED IMPLEMENTATION ---
// ========================================================================

interface ClassAppState {
  auth0: Auth0;
  user: User | null;
  result: any; // Can hold credentials or other results
  apiError: Error | null;
  isLoading: boolean;
  email: string;
  password: string;
}

class ClassApp extends React.Component<{}, ClassAppState> {
  state: ClassAppState = {
    auth0: new Auth0({ domain: config.domain, clientId: config.clientId }),
    user: null,
    result: null,
    apiError: null,
    isLoading: true,
    email: '',
    password: '',
  };

  componentDidMount() {
    this.handleAuthentication();
  }

  handleAuthentication = async () => {
    const hasRedirectParams =
      typeof window !== 'undefined' &&
      (window.location.search.includes('code=') ||
        window.location.search.includes('error=')) &&
      window.location.search.includes('state=');
    if (hasRedirectParams) {
      try {
        await this.state.auth0.webAuth.handleRedirectCallback();
      } catch (e) {
        this.setState({ apiError: e as Error, isLoading: false });
      } finally {
        if (typeof window !== 'undefined') {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    }

    try {
      const credentials =
        await this.state.auth0.credentialsManager.getCredentials();
      const user = await this.state.auth0.auth.userInfo({
        token: credentials.accessToken,
      });
      this.setState({ user, result: credentials, isLoading: false });
    } catch {
      this.setState({ user: null, isLoading: false });
    }
  };

  runDemo = async (action: () => Promise<any>) => {
    this.setState({ result: null, apiError: null });
    try {
      const response = await action();
      this.setState({ result: response ?? { success: true } });
    } catch (e) {
      this.setState({ apiError: e as Error });
    }
  };

  onLogin = async () => {
    await this.state.auth0.webAuth.authorize({
      scope: 'openid profile email offline_access',
    });
  };

  onLogout = async () => {
    try {
      await this.state.auth0.webAuth.clearSession();
      this.setState({ user: null, result: null, apiError: null });
    } catch (e) {
      this.setState({ apiError: e as Error });
    }
  };

  render() {
    const { user, result, apiError, isLoading, email, password } = this.state;
    if (isLoading) {
      return (
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Header title="React Native Auth0 (Class)" />
        <Result title="Last Action Result" result={result} error={apiError} />
        {user ? (
          <View style={styles.section}>
            <Text style={styles.title}>Welcome, {user.name}!</Text>
            <Result title="User Profile" result={user} error={null} />
            <Button
              onPress={() =>
                this.runDemo(() =>
                  this.state.auth0.credentialsManager.getCredentials()
                )
              }
              title="Get Credentials"
            />
            <Button
              onPress={() =>
                this.runDemo(() =>
                  this.state.auth0
                    .users(result?.accessToken)
                    .getUser({ id: user.sub })
                )
              }
              title="Get Full Profile (Mgmt API)"
              disabled={!result?.accessToken}
            />
            <Button onPress={this.onLogout} title="Log Out" />
          </View>
        ) : (
          <>
            <Section title="Web Auth (Recommended Flow)">
              <Button onPress={this.onLogin} title="Log In" />
            </Section>
            <Section title="User Self-Service">
              <LabeledInput
                label="Email"
                value={email}
                onChangeText={(val) => this.setState({ email: val })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <LabeledInput
                label="Password"
                value={password}
                onChangeText={(val) => this.setState({ password: val })}
                secureTextEntry
              />
              <Button
                onPress={() =>
                  this.runDemo(() =>
                    this.state.auth0.auth.createUser({
                      email,
                      password,
                      connection: 'Username-Password-Authentication',
                    })
                  )
                }
                title="Create User"
              />
              <Button
                onPress={() =>
                  this.runDemo(() =>
                    this.state.auth0.auth.resetPassword({
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
                  this.runDemo(() =>
                    this.state.auth0.auth.passwordRealm({
                      username: '',
                      password: '',
                      realm: '',
                    })
                  )
                }
                title="Test auth.passwordRealm()"
              />
            </Section>
          </>
        )}
      </View>
    );
  }
}

// ========================================================================
// --- 3. MAIN APP COMPONENT WITH TOGGLE ---
// ========================================================================

const App = (): React.JSX.Element => {
  const [showHooksDemo, setShowHooksDemo] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {showHooksDemo ? <HooksApp /> : <ClassApp />}

        <View style={styles.toggleContainer}>
          <Button
            onPress={() => setShowHooksDemo(!showHooksDemo)}
            title={`Switch to ${showHooksDemo ? 'Class-Based' : 'Hooks'} Demo`}
            style={styles.toggleButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  buttonGroup: { gap: 10 },
  toggleContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fafafa',
  },
  toggleButton: { backgroundColor: '#6c757d' },
});

export default App;
