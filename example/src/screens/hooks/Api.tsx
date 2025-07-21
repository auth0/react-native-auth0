import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Auth0, { useAuth0, User } from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import config from '../../auth0-configuration';

const AUTH0_DOMAIN = config.domain;
const AUTH0_CLIENT_ID = config.clientId;

const auth0 = new Auth0({ domain: AUTH0_DOMAIN, clientId: AUTH0_CLIENT_ID });

const ApiScreen = () => {
  const { user, getCredentials } = useAuth0();
  const [apiResult, setApiResult] = useState<User | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);

  const onCallApi = async () => {
    try {
      const credentials = await getCredentials(
        'openid profile email read:current_user'
      );
      if (!credentials || !user?.sub) {
        throw new Error('Could not get credentials or user ID.');
      }

      const managementClient = auth0.users(credentials.accessToken);
      const fullProfile = await managementClient.getUser({ id: user.sub });

      setApiResult(fullProfile);
      setApiError(null);
    } catch (e) {
      setApiError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="API Calls" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result
          title="Management API Result"
          result={apiResult}
          error={apiError}
        />
        <Button onPress={onCallApi} title="Get Full User Profile" />
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
});

export default ApiScreen;
