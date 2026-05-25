import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  useAuth0,
  WebAuthError,
  WebAuthErrorCodes,
  PasskeyError,
  PasskeyErrorCodes,
} from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabeledInput from '../../components/LabeledInput';
import Result from '../../components/Result';
import config from '../../auth0-configuration';

const HomeScreen = () => {
  const {
    authorize,
    loginWithPasswordRealm,
    sendEmailCode,
    authorizeWithEmail,
    passkeySignupChallenge,
    passkeyLoginChallenge,
    passkeyRegistration,
    passkeyAssertion,
    passkeyExchange,
    error,
  } = useAuth0();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [passkeyEmail, setPasskeyEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<object | null>(null);

  const onLogin = async () => {
    try {
      await authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
    } catch (e: any) {
      if (e instanceof WebAuthError) {
        switch (e.type) {
          case WebAuthErrorCodes.USER_CANCELLED:
            Alert.alert('Login Cancelled', 'You cancelled the login process.');
            break;
          case WebAuthErrorCodes.TIMEOUT_ERROR:
            Alert.alert('Login Timeout', 'The login process timed out.');
            break;
          default:
            Alert.alert('Authentication Error', e.message);
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred during login.');
      }
    }
  };

  const onLoginWithPassword = async () => {
    try {
      await loginWithPasswordRealm({
        username: email,
        password: password,
        realm: 'Username-Password-Authentication',
      });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onSendEmailCode = async () => {
    try {
      await sendEmailCode({ email });
      setShowOtpInput(true);
      Alert.alert('Success', 'Check your email for the one-time code.');
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onLoginWithEmailCode = async () => {
    try {
      await authorizeWithEmail({ email, code: otp });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  // --- Passkey Handlers ---

  const handlePasskeyError = (e: any) => {
    if (e instanceof PasskeyError) {
      switch (e.type) {
        case PasskeyErrorCodes.USER_CANCELLED:
          Alert.alert('Cancelled', 'You dismissed the passkey prompt.');
          break;
        case PasskeyErrorCodes.NOT_AVAILABLE:
          Alert.alert(
            'Not Available',
            'Passkeys are not supported on this device.'
          );
          break;
        case PasskeyErrorCodes.CHALLENGE_FAILED:
          Alert.alert('Challenge Failed', e.message);
          break;
        case PasskeyErrorCodes.REGISTRATION_FAILED:
          Alert.alert('Registration Failed', e.message);
          break;
        case PasskeyErrorCodes.ASSERTION_FAILED:
          Alert.alert('Assertion Failed', e.message);
          break;
        case PasskeyErrorCodes.EXCHANGE_FAILED:
          Alert.alert('Exchange Failed', e.message);
          break;
        default:
          Alert.alert('Passkey Error', `[${e.type}] ${e.message}`);
      }
    }
    setApiError(e as Error);
  };

  const onPasskeySignup = async () => {
    setApiError(null);
    setLastResult(null);
    setLoading(true);
    try {
      // Step 1: Get signup challenge from Auth0
      const challenge = await passkeySignupChallenge({
        email: passkeyEmail || undefined,
        realm: 'Username-Password-Authentication',
      });
      console.log('Signup challenge received:', challenge.authSession);

      // Step 2: Present OS credential manager to create a passkey
      const credentialJson = await passkeyRegistration({
        challengeJson: JSON.stringify(challenge.authParamsPublicKey),
      });
      console.log('Registration complete, exchanging for tokens...');

      // Step 3: Exchange credential response for Auth0 tokens
      const credentials = await passkeyExchange({
        authSession: challenge.authSession,
        authResponse: credentialJson,
        realm: 'Username-Password-Authentication',
      });

      setLastResult({
        flow: 'signup',
        accessToken: `${credentials.accessToken.substring(0, 30)}...`,
        tokenType: credentials.tokenType,
      });
      Alert.alert('Success', 'Signed up with passkey!');
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  const onPasskeyLogin = async () => {
    setApiError(null);
    setLastResult(null);
    setLoading(true);
    try {
      // Step 1: Get login challenge from Auth0
      const challenge = await passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
      });
      console.log('Login challenge received:', challenge.authSession);

      // Step 2: Present OS credential manager to assert an existing passkey
      const credentialJson = await passkeyAssertion({
        challengeJson: JSON.stringify(challenge.authParamsPublicKey),
      });
      console.log('Assertion complete, exchanging for tokens...');

      // Step 3: Exchange credential response for Auth0 tokens
      const credentials = await passkeyExchange({
        authSession: challenge.authSession,
        authResponse: credentialJson,
        realm: 'Username-Password-Authentication',
      });

      setLastResult({
        flow: 'login',
        accessToken: `${credentials.accessToken.substring(0, 30)}...`,
        tokenType: credentials.tokenType,
      });
      Alert.alert('Success', 'Signed in with passkey!');
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Step-by-step handlers for testing individual methods ---

  const onTestChallenge = async (type: 'signup' | 'login') => {
    setApiError(null);
    setLastResult(null);
    setLoading(true);
    try {
      const challenge =
        type === 'signup'
          ? await passkeySignupChallenge({
              email: passkeyEmail || undefined,
              realm: 'Username-Password-Authentication',
            })
          : await passkeyLoginChallenge({
              realm: 'Username-Password-Authentication',
            });

      setLastResult({
        step: `${type}Challenge`,
        authSession: challenge.authSession,
        authParamsPublicKey: challenge.authParamsPublicKey,
      });
      console.log(`${type} challenge:`, JSON.stringify(challenge, null, 2));
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  const onTestRegistration = async () => {
    if (!lastResult || !(lastResult as any).authParamsPublicKey) {
      Alert.alert('Error', 'Get a signup challenge first.');
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const credentialJson = await passkeyRegistration({
        challengeJson: JSON.stringify((lastResult as any).authParamsPublicKey),
      });

      setLastResult({
        ...(lastResult as any),
        step: 'registration',
        credentialJson: credentialJson.substring(0, 100) + '...',
        _fullCredentialJson: credentialJson,
      });
      console.log('Registration response:', credentialJson);
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  const onTestAssertion = async () => {
    if (!lastResult || !(lastResult as any).authParamsPublicKey) {
      Alert.alert('Error', 'Get a login challenge first.');
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const credentialJson = await passkeyAssertion({
        challengeJson: JSON.stringify((lastResult as any).authParamsPublicKey),
      });

      setLastResult({
        ...(lastResult as any),
        step: 'assertion',
        credentialJson: credentialJson.substring(0, 100) + '...',
        _fullCredentialJson: credentialJson,
      });
      console.log('Assertion response:', credentialJson);
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  const onTestExchange = async () => {
    const result = lastResult as any;
    if (!result?.authSession || !result?._fullCredentialJson) {
      Alert.alert(
        'Error',
        'Complete a challenge and registration/assertion first.'
      );
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const credentials = await passkeyExchange({
        authSession: result.authSession,
        authResponse: result._fullCredentialJson,
        realm: 'Username-Password-Authentication',
      });

      setLastResult({
        step: 'exchange',
        accessToken: `${credentials.accessToken.substring(0, 30)}...`,
        tokenType: credentials.tokenType,
      });
      Alert.alert('Success', 'Token exchange complete!');
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Welcome" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>React Native Auth0 Hooks</Text>

        {error && <Result title="Hook Error" error={error} result={null} />}
        {apiError && (
          <Result title="API Error" error={apiError} result={null} />
        )}

        <Section title="Web Auth (Recommended)">
          <Button onPress={onLogin} title="Log In" />
        </Section>

        <Section title="Database Login">
          <LabeledInput
            label="Username or Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button onPress={onLoginWithPassword} title="Log In with Password" />
        </Section>

        <Section title="Passwordless (Email OTP)">
          <LabeledInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button onPress={onSendEmailCode} title="Send Email Code" />

          {showOtpInput && (
            <>
              <LabeledInput
                label="One-Time Code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
              <Button onPress={onLoginWithEmailCode} title="Log In with Code" />
            </>
          )}
        </Section>

        {Platform.OS !== 'web' && (
          <>
            <Section title="Passkeys — Full Flow">
              <Text style={styles.description}>
                Challenge + OS credential UI + token exchange in one tap.
              </Text>

              <LabeledInput
                label="Email (for signup)"
                value={passkeyEmail}
                onChangeText={setPasskeyEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Button
                onPress={onPasskeySignup}
                title="Sign Up with Passkey"
                loading={loading}
              />
              <Button
                onPress={onPasskeyLogin}
                title="Sign In with Passkey"
                loading={loading}
              />
            </Section>

            <Section title="Passkeys — Step-by-Step Testing">
              <Text style={styles.description}>
                Test each method individually: challenge →
                registration/assertion → exchange.
              </Text>

              <LabeledInput
                label="Email (for signup challenge)"
                value={passkeyEmail}
                onChangeText={setPasskeyEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View style={styles.row}>
                <Button
                  onPress={() => onTestChallenge('signup')}
                  title="Signup Challenge"
                  loading={loading}
                  style={styles.halfButton}
                />
                <Button
                  onPress={() => onTestChallenge('login')}
                  title="Login Challenge"
                  loading={loading}
                  style={styles.halfButton}
                />
              </View>

              <View style={styles.row}>
                <Button
                  onPress={onTestRegistration}
                  title="Registration"
                  loading={loading}
                  style={styles.halfButton}
                />
                <Button
                  onPress={onTestAssertion}
                  title="Assertion"
                  loading={loading}
                  style={styles.halfButton}
                />
              </View>

              <Button
                onPress={onTestExchange}
                title="Exchange for Tokens"
                loading={loading}
              />

              {lastResult && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>Last Result:</Text>
                  <Text style={styles.resultValue} numberOfLines={8}>
                    {JSON.stringify(
                      lastResult,
                      (key, val) => (key.startsWith('_') ? undefined : val),
                      2
                    )}
                  </Text>
                </View>
              )}
            </Section>
          </>
        )}
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
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 13, color: '#666', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  halfButton: { flex: 1, minWidth: 0 },
  resultBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  resultLabel: { fontSize: 12, fontWeight: '600', color: '#333' },
  resultValue: { fontSize: 11, color: '#555', fontFamily: 'monospace' },
});

export default HomeScreen;
