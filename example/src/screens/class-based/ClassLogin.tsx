// example/src/screens/class-based/ClassLogin.tsx

import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import auth0 from '../../api/auth0'; // Import our singleton instance
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';
import config from '../../auth0-configuration';

type NavigationProp = StackNavigationProp<
  ClassDemoStackParamList,
  'ClassLogin'
>;

const ClassLoginScreen = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
      // On success, we save the credentials and navigate to the profile screen.
      await auth0.credentialsManager.saveCredentials(credentials);
      navigation.replace('ClassProfile', { credentials });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Class-Based Login" />
      <View style={styles.content}>
        <Result title="Error" error={error} result={null} />
        <Button onPress={onLogin} title="Log In" loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default ClassLoginScreen;
