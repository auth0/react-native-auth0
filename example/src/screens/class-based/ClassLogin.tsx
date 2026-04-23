// example/src/screens/class-based/ClassLogin.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  MfaError,
  MfaErrorCodes,
  WebAuthError,
  WebAuthErrorCodes,
} from 'react-native-auth0';
import auth0 from '../../api/auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabeledInput from '../../components/LabeledInput';
import Result from '../../components/Result';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';
import config from '../../auth0-configuration';

type NavigationProp = StackNavigationProp<
  ClassDemoStackParamList,
  'ClassLogin'
>;

const ClassLoginScreen = () => {
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // MFA state
  const [mfaToken, setMfaToken] = useState('');
  const [mfaOtp, setMfaOtp] = useState('');
  const [mfaOobCode, setMfaOobCode] = useState('');
  const [mfaBindingCode, setMfaBindingCode] = useState('');
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState('');
  const [mfaAuthenticatorId, setMfaAuthenticatorId] = useState('');
  const [mfaPhoneNumber, setMfaPhoneNumber] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
      await auth0.credentialsManager.saveCredentials(credentials);
      navigation.replace('ClassProfile', { credentials });
    } catch (e) {
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
        setError(e as Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onLoginWithPassword = async () => {
    clearResult();
    try {
      const credentials = await auth0.auth.passwordRealm({
        username: email,
        password: password,
        realm: 'Username-Password-Authentication',
      });
      await auth0.credentialsManager.saveCredentials(credentials);
      navigation.replace('ClassProfile', { credentials });
    } catch (e: any) {
      if (e?.json?.mfa_token) {
        setMfaToken(e.json.mfa_token);
        Alert.alert(
          'MFA Required',
          'Multi-factor authentication is required. Use the MFA section below to complete login.'
        );
      }
      setError(e as Error);
    }
  };

  const handleMfaError = (e: unknown, fallbackMsg: string) => {
    if (e instanceof MfaError) {
      switch (e.type) {
        case MfaErrorCodes.INVALID_OTP:
          Alert.alert('Invalid Code', 'The OTP code is incorrect.');
          break;
        case MfaErrorCodes.INVALID_OOB_CODE:
          Alert.alert('Invalid Code', 'The OOB code is incorrect.');
          break;
        case MfaErrorCodes.INVALID_BINDING_CODE:
          Alert.alert('Invalid Code', 'The binding code is incorrect.');
          break;
        case MfaErrorCodes.INVALID_RECOVERY_CODE:
          Alert.alert('Invalid Code', 'The recovery code is incorrect.');
          break;
        case MfaErrorCodes.EXPIRED_MFA_TOKEN:
          Alert.alert(
            'Session Expired',
            'MFA token expired. Please log in again.'
          );
          setMfaToken('');
          break;
        case MfaErrorCodes.INVALID_MFA_TOKEN:
          Alert.alert('Invalid Token', 'The MFA token is invalid.');
          setMfaToken('');
          break;
        case MfaErrorCodes.TOO_MANY_ATTEMPTS:
          Alert.alert('Rate Limited', 'Too many attempts. Please wait.');
          break;
        case MfaErrorCodes.ENROLLMENT_FAILED:
          Alert.alert('Enrollment Failed', 'MFA enrollment failed.');
          break;
        case MfaErrorCodes.INVALID_PHONE_NUMBER:
          Alert.alert('Invalid Phone', 'The phone number is invalid.');
          break;
        case MfaErrorCodes.INVALID_EMAIL:
          Alert.alert('Invalid Email', 'The email is invalid.');
          break;
        case MfaErrorCodes.CHALLENGE_FAILED:
          Alert.alert('Challenge Failed', 'MFA challenge request failed.');
          break;
        case MfaErrorCodes.AUTHENTICATOR_NOT_FOUND:
          Alert.alert('Not Found', 'Authenticator not found or not enrolled.');
          break;
        case MfaErrorCodes.UNSUPPORTED_FACTOR:
          Alert.alert('Unsupported', 'This MFA factor type is not supported.');
          break;
        case MfaErrorCodes.ASSOCIATION_REQUIRED:
          Alert.alert(
            'Enrollment Required',
            'You must enroll before using this authenticator.'
          );
          break;
        default:
          Alert.alert('MFA Error', `[${e.type}] ${e.message}`);
      }
      setError(e);
    } else {
      setError(e as Error);
      Alert.alert('Error', fallbackMsg);
    }
  };

  const mfaClient = auth0.mfa();

  const onMfaGetAuthenticators = async () => {
    clearResult();
    try {
      const authenticators = await mfaClient.getAuthenticators({ mfaToken });
      setResult({ authenticators });
      if (authenticators.length > 0) {
        setMfaAuthenticatorId(authenticators[0].id);
      }
    } catch (e) {
      handleMfaError(e, 'Failed to list authenticators.');
    }
  };

  const onMfaEnrollOtp = async () => {
    clearResult();
    try {
      const challenge = await mfaClient.enroll({ mfaToken, type: 'otp' });
      setResult(challenge);
    } catch (e) {
      handleMfaError(e, 'OTP enrollment failed.');
    }
  };

  const onMfaEnrollSms = async () => {
    clearResult();
    try {
      const challenge = await mfaClient.enroll({
        mfaToken,
        phoneNumber: mfaPhoneNumber,
      });
      setResult(challenge);
      if ('oobCode' in challenge) {
        setMfaOobCode(challenge.oobCode ?? '');
      }
    } catch (e) {
      handleMfaError(e, 'SMS enrollment failed.');
    }
  };

  const onMfaEnrollEmail = async () => {
    clearResult();
    try {
      const challenge = await mfaClient.enroll({ mfaToken, email: mfaEmail });
      setResult(challenge);
      if ('oobCode' in challenge) {
        setMfaOobCode(challenge.oobCode ?? '');
      }
    } catch (e) {
      handleMfaError(e, 'Email enrollment failed.');
    }
  };

  const onMfaChallenge = async () => {
    clearResult();
    try {
      const challengeResult = await mfaClient.challenge({
        mfaToken,
        authenticatorId: mfaAuthenticatorId,
      });
      setResult(challengeResult);
      if (challengeResult.oobCode) {
        setMfaOobCode(challengeResult.oobCode);
      }
    } catch (e) {
      handleMfaError(e, 'MFA challenge failed.');
    }
  };

  const onMfaVerifyOtp = async () => {
    clearResult();
    try {
      const credentials = await mfaClient.verify({ mfaToken, otp: mfaOtp });
      setResult({
        success: true,
        accessToken: credentials.accessToken.substring(0, 20) + '...',
      });
    } catch (e) {
      handleMfaError(e, 'OTP verification failed.');
    }
  };

  const onMfaVerifyOob = async () => {
    clearResult();
    try {
      const params: any = { mfaToken, oobCode: mfaOobCode };
      if (mfaBindingCode) {
        params.bindingCode = mfaBindingCode;
      }
      const credentials = await mfaClient.verify(params);
      setResult({
        success: true,
        accessToken: credentials.accessToken.substring(0, 20) + '...',
      });
    } catch (e) {
      handleMfaError(e, 'OOB verification failed.');
    }
  };

  const onMfaVerifyRecoveryCode = async () => {
    clearResult();
    try {
      const credentials = await mfaClient.verify({
        mfaToken,
        recoveryCode: mfaRecoveryCode,
      });
      setResult({
        success: true,
        accessToken: credentials.accessToken.substring(0, 20) + '...',
      });
    } catch (e) {
      handleMfaError(e, 'Recovery code verification failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Class-Based Login" />
      <ScrollView contentContainerStyle={styles.content}>
        {error && <Result title="Error" error={error} result={null} />}
        {result && <Result title="Result" error={null} result={result} />}

        <Section title="Web Auth (Recommended)">
          <Button onPress={onLogin} title="Log In" loading={loading} />
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
          <Text style={styles.hint}>
            If MFA is enabled, a failed login will return an mfa_token that
            auto-populates below.
          </Text>
        </Section>

        <Section title="MFA Flexible Factors Grant">
          <Text style={styles.hint}>
            Uses auth0.mfa() class-based API. Get an mfa_token from a password
            login with MFA enabled.
          </Text>
          <LabeledInput
            label="MFA Token"
            value={mfaToken}
            onChangeText={setMfaToken}
            placeholder="Paste or auto-filled from password login"
          />

          <Text style={styles.subSectionTitle}>List Authenticators</Text>
          <Button
            onPress={onMfaGetAuthenticators}
            title="mfa().getAuthenticators()"
            disabled={!mfaToken}
          />

          <Text style={styles.subSectionTitle}>Enroll</Text>
          <Button
            onPress={onMfaEnrollOtp}
            title="Enroll TOTP (Authenticator App)"
            disabled={!mfaToken}
          />
          <LabeledInput
            label="Phone Number (for SMS)"
            value={mfaPhoneNumber}
            onChangeText={setMfaPhoneNumber}
            placeholder="+12025550135"
            keyboardType="phone-pad"
          />
          <Button
            onPress={onMfaEnrollSms}
            title="Enroll SMS"
            disabled={!mfaToken || !mfaPhoneNumber}
          />
          <LabeledInput
            label="Email (for Email MFA)"
            value={mfaEmail}
            onChangeText={setMfaEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            onPress={onMfaEnrollEmail}
            title="Enroll Email"
            disabled={!mfaToken || !mfaEmail}
          />

          <Text style={styles.subSectionTitle}>Challenge</Text>
          <LabeledInput
            label="Authenticator ID"
            value={mfaAuthenticatorId}
            onChangeText={setMfaAuthenticatorId}
            placeholder="e.g. sms|dev_123 (auto-filled from list)"
          />
          <Button
            onPress={onMfaChallenge}
            title="mfa().challenge()"
            disabled={!mfaToken || !mfaAuthenticatorId}
          />

          <Text style={styles.subSectionTitle}>Verify (OTP)</Text>
          <LabeledInput
            label="OTP Code"
            value={mfaOtp}
            onChangeText={setMfaOtp}
            keyboardType="numeric"
            placeholder="6-digit code from authenticator app"
          />
          <Button
            onPress={onMfaVerifyOtp}
            title="Verify OTP"
            disabled={!mfaToken || !mfaOtp}
          />

          <Text style={styles.subSectionTitle}>Verify (OOB)</Text>
          <LabeledInput
            label="OOB Code"
            value={mfaOobCode}
            onChangeText={setMfaOobCode}
            placeholder="Auto-filled from challenge/enroll"
          />
          <LabeledInput
            label="Binding Code (optional)"
            value={mfaBindingCode}
            onChangeText={setMfaBindingCode}
            keyboardType="numeric"
            placeholder="Code sent via SMS/email"
          />
          <Button
            onPress={onMfaVerifyOob}
            title="Verify OOB"
            disabled={!mfaToken || !mfaOobCode}
          />

          <Text style={styles.subSectionTitle}>Verify (Recovery Code)</Text>
          <LabeledInput
            label="Recovery Code"
            value={mfaRecoveryCode}
            onChangeText={setMfaRecoveryCode}
            placeholder="e.g. ABCDEF123456"
          />
          <Button
            onPress={onMfaVerifyRecoveryCode}
            title="Verify Recovery Code"
            disabled={!mfaToken || !mfaRecoveryCode}
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
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 20, paddingBottom: 50 },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginTop: 8,
  },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
});

export default ClassLoginScreen;
