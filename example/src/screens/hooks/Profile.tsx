import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import UserInfo from '../../components/UserInfo';
import Result from '../../components/Result';

const ProfileScreen = () => {
  const {
    user,
    clearSession,
    clearCredentials,
    getCredentials,
    hasValidCredentials,
    revokeRefreshToken,
  } = useAuth0();
  const [credentials, setCredentials] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [apiResult, setApiResult] = useState<object | null>(null);

  const onLogout = async () => {
    try {
      // clearSession will log the user out of the session
      await clearSession();
      // Clear any local state if needed
      setCredentials(null);
      setApiResult(null);
      setApiError(null);
    } catch (e) {
      console.log('Logout error: ', e);
      // Show error to user
      Alert.alert(
        'Logout Error',
        `Failed to logout: ${e.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      setApiError(e as Error);
    }
  };

  const onClearCredentials = async () => {
    try {
      await clearCredentials();
      // Clear any local state
      setCredentials(null);
      setApiResult({ success: 'Credentials cleared locally' });
      setApiError(null);
      Alert.alert(
        'Success',
        'Credentials have been cleared from local storage.'
      );
    } catch (e) {
      console.log('Clear credentials error: ', e);
      setApiError(e as Error);
      Alert.alert(
        'Error',
        `Failed to clear credentials: ${e.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const onGetCredentials = async () => {
    try {
      const result = await getCredentials();
      setCredentials(result ?? null);
      setApiResult(result ?? null);
      setApiError(null);
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onCheckCredentials = async () => {
    try {
      const isValid = await hasValidCredentials();
      setApiResult({ hasValidCredentials: isValid });
      setApiError(null);
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onRevokeToken = async () => {
    try {
      if (!credentials?.refreshToken) {
        Alert.alert(
          'Error',
          'No refresh token found. Please get credentials first.'
        );
        return;
      }
      await revokeRefreshToken({ refreshToken: credentials.refreshToken });
      setApiResult({ success: 'Refresh token revoked' });
      setApiError(null);
    } catch (e) {
      setApiError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <UserInfo user={user} />

        <Result title="API Result" result={apiResult} error={apiError} />

        <Button onPress={onGetCredentials} title="Get Credentials" />
        <View style={styles.spacer} />
        <Button onPress={onCheckCredentials} title="Check Valid Credentials" />
        <View style={styles.spacer} />
        <Button
          onPress={onRevokeToken}
          title="Revoke Refresh Token"
          disabled={!credentials?.refreshToken}
        />
        <View style={styles.spacer} />
        <Button
          onPress={onClearCredentials}
          title="Clear Credentials"
          style={styles.clearCredentialsButton}
        />
        <View style={styles.spacer} />
        <Button
          onPress={onLogout}
          title="Log Out"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  spacer: {
    height: 16,
  },
  clearCredentialsButton: {
    backgroundColor: '#FF9800',
  },
  logoutButton: {
    backgroundColor: '#424242',
  },
});

export default ProfileScreen;
