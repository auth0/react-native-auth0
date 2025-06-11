/**
 * Web-specific App configuration
 * This file handles web-specific overrides and configurations
 */
import React from 'react';
import { View, Text, Platform, Button, StyleSheet } from 'react-native';
import Auth0, { Auth0Provider, useAuth0 } from 'react-native-auth0';
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
      {/* --- Class-based Auth0 Login Example --- */}
      <ClassAuth0Login />
    </Auth0Provider>
  );
}

// Class-based Auth0 Login Example
class ClassAuth0Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: false,
    };
    this.auth0 = new Auth0({
      domain: config.domain,
      clientId: config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        ...(config.audience ? { audience: config.audience } : null),
        scope: 'read:current_user update:current_user_metadata',
      },
    });
  }

  handleLogin = async () => {
    this.setState({ loading: true, error: null });
    try {
      await this.auth0.webAuth.loginWithRedirect();
      // After redirect, user will be handled by Auth0Provider, so this is for demo only
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleLogout = async () => {
    this.setState({ loading: true, error: null });
    try {
      await this.auth0.webAuth.logout({
        logoutParams: { returnTo: window.location.origin },
      });
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { user, error, loading } = this.state;
    const loggedIn = !!user;
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Class-based Auth0 Login Example</Text>
        {user && <Text>You are logged in as {user.name}</Text>}
        {!user && <Text>You are not logged in</Text>}
        <Button
          onPress={loggedIn ? this.handleLogout : this.handleLogin}
          title={loading ? 'Loading...' : loggedIn ? 'Log Out' : 'Log In'}
          disabled={loading}
        />
        {error && (
          <Text style={styles.error}>{error.message || String(error)}</Text>
        )}
      </View>
    );
  }
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
