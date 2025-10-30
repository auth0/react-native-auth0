import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useAuth0, Credentials, ApiCredentials } from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import LabeledInput from '../../components/LabeledInput';
import config from '../../auth0-configuration';

const CredentialsScreen = () => {
  const {
    getCredentials,
    hasValidCredentials,
    clearCredentials,
    getApiCredentials,
    clearApiCredentials,
    revokeRefreshToken,
  } = useAuth0();

  const [result, setResult] = useState<
    Credentials | ApiCredentials | object | boolean | null
  >(null);
  const [error, setError] = useState<Error | null>(null);
  const [audience, setAudience] = useState(config.audience);
  const [scope, setScope] = useState('openid profile email');

  const runTest = async (testFn: () => Promise<any>, title: string) => {
    setError(null);
    setResult(null);
    try {
      const res = await testFn();
      setResult(res ?? { success: `${title} completed` });
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Credentials Manager" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result title="Last Action Result" result={result} error={error} />

        <Section title="Primary Credentials">
          <Button
            onPress={() => runTest(getCredentials, 'Get Credentials')}
            title="getCredentials()"
          />
          <Button
            onPress={() =>
              runTest(hasValidCredentials, 'Check Valid Credentials')
            }
            title="hasValidCredentials()"
          />
          <Button
            onPress={() => {
              if (
                typeof result === 'object' &&
                result &&
                'refreshToken' in result
              ) {
                const token = (result as Credentials).refreshToken;
                if (token) {
                  runTest(
                    () => revokeRefreshToken({ refreshToken: token }),
                    'Revoke Refresh Token'
                  );
                }
              }
            }}
            title="revokeRefreshToken()"
            disabled={
              !(
                typeof result === 'object' &&
                result &&
                'refreshToken' in result
              )
            }
          />
          <Button
            onPress={() => runTest(clearCredentials, 'Clear Credentials')}
            title="clearCredentials()"
            style={styles.destructiveButton}
          />
        </Section>

        <Section title="API Credentials (MRRT)">
          <LabeledInput
            label="API Audience"
            value={audience}
            onChangeText={setAudience}
            autoCapitalize="none"
          />
          <LabeledInput
            label="Scope"
            value={scope}
            onChangeText={setScope}
            autoCapitalize="none"
          />
          <Button
            onPress={() =>
              runTest(
                () => getApiCredentials(audience, scope),
                'Get API Credentials'
              )
            }
            title="getApiCredentials()"
          />
          <Button
            onPress={() =>
              runTest(
                () => clearApiCredentials(audience),
                'Clear API Credentials'
              )
            }
            title="clearApiCredentials()"
            style={styles.secondaryButton}
          />
        </Section>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 50 },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  buttonGroup: { gap: 10 },
  destructiveButton: { backgroundColor: '#424242' },
  secondaryButton: { backgroundColor: '#FF9800' },
});

export default CredentialsScreen;
