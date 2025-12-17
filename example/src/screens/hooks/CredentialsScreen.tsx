import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Linking,
  Alert,
} from 'react-native';
import {
  useAuth0,
  Credentials,
  ApiCredentials,
  CredentialsManagerError,
  CredentialsManagerErrorCodes,
} from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import LabeledInput from '../../components/LabeledInput';

const CredentialsScreen = () => {
  const {
    getCredentials,
    hasValidCredentials,
    clearCredentials,
    getApiCredentials,
    clearApiCredentials,
    revokeRefreshToken,
    getSSOCredentials,
  } = useAuth0();

  const [result, setResult] = useState<
    Credentials | ApiCredentials | object | boolean | null
  >(null);
  const [error, setError] = useState<Error | null>(null);
  const [audience, setAudience] = useState('');
  const [scope, setScope] = useState('openid profile email');
  const [webAppUrl, setWebAppUrl] = useState('https://your-web-app.com/login');

  const runTest = async (testFn: () => Promise<any>, title: string) => {
    setError(null);
    setResult(null);
    try {
      const res = await testFn();
      setResult(res ?? { success: `${title} completed` });
    } catch (e) {
      setError(e as Error);
      // Demonstrate usage of CredentialsManagerErrorCodes for type-safe error handling
      if (e instanceof CredentialsManagerError) {
        const credError: CredentialsManagerError = e;
        switch (credError.type) {
          case CredentialsManagerErrorCodes.NO_CREDENTIALS:
            Alert.alert(
              'No Credentials',
              'No credentials are stored. Please log in first.'
            );
            break;
          case CredentialsManagerErrorCodes.NO_REFRESH_TOKEN:
            Alert.alert(
              'No Refresh Token',
              'Refresh token is not available. Make sure to request the "offline_access" scope during login.'
            );
            break;
          default:
            console.log(
              `Credentials error: ${credError.type} - ${credError.message}`
            );
        }
      }
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

        <Section title="Native to Web SSO (Early Access)">
          <Text style={styles.description}>
            Exchange your refresh token for a Session Transfer Token to enable
            seamless SSO to your web application.
          </Text>
          <LabeledInput
            label="Web App URL"
            value={webAppUrl}
            onChangeText={setWebAppUrl}
            autoCapitalize="none"
            placeholder="https://your-web-app.com/login"
          />
          <Button
            onPress={() => runTest(getSSOCredentials, 'Get SSO Credentials')}
            title="getSSOCredentials()"
          />
          <Button
            onPress={async () => {
              try {
                setError(null);
                const ssoCredentials = await getSSOCredentials();
                setResult(ssoCredentials);

                // Open web app with session transfer token
                const url = `${webAppUrl}?session_transfer_token=${ssoCredentials.sessionTransferToken}`;

                Alert.alert(
                  'Open Web App',
                  `Open ${webAppUrl} with session transfer token?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open',
                      onPress: async () => {
                        const supported = await Linking.canOpenURL(url);
                        if (supported) {
                          await Linking.openURL(url);
                        } else {
                          Alert.alert('Error', `Cannot open URL: ${url}`);
                        }
                      },
                    },
                  ]
                );
              } catch (e) {
                setError(e as Error);
              }
            }}
            title="Get SSO Credentials & Open Web App"
            style={styles.primaryButton}
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
  description: { fontSize: 14, color: '#757575', marginBottom: 10 },
  destructiveButton: { backgroundColor: '#424242' },
  secondaryButton: { backgroundColor: '#FF9800' },
  primaryButton: { backgroundColor: '#4CAF50' },
});

export default CredentialsScreen;
