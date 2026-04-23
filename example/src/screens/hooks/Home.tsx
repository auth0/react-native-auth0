import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  useAuth0,
  WebAuthError,
  WebAuthErrorCodes,
  MfaError,
  MfaErrorCodes,
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
    mfaGetAuthenticators,
    mfaEnroll,
    mfaChallenge,
    mfaVerify,
    error,
  } = useAuth0();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [result, setResult] = useState<object | null>(null);

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
    setApiError(null);
  };

  const onLogin = async () => {
    try {
      await authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
    } catch (e) {
      console.log('Login error: ', e);
      if (e instanceof WebAuthError) {
        const webAuthError: WebAuthError = e;
        switch (webAuthError.type) {
          case WebAuthErrorCodes.USER_CANCELLED:
            Alert.alert(
              'Login Cancelled',
              'You cancelled the login process. Please try again when ready.'
            );
            break;
          case WebAuthErrorCodes.TIMEOUT_ERROR:
            Alert.alert(
              'Login Timeout',
              'The login process timed out. Please try again.'
            );
            break;
          default:
            Alert.alert('Authentication Error', webAuthError.message);
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred during login.');
      }
    }
  };

  const onLoginWithPassword = async () => {
    clearResult();
    try {
      await loginWithPasswordRealm({
        username: email,
        password: password,
        realm: 'Username-Password-Authentication',
      });
    } catch (e: any) {
      // Check if the error contains an mfa_token (MFA required)
      if (e?.json?.mfa_token) {
        setMfaToken(e.json.mfa_token);
        Alert.alert(
          'MFA Required',
          'Multi-factor authentication is required. Use the MFA section below to complete login.'
        );
      }
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

  // --- MFA Handlers ---

  const handleMfaError = (e: unknown, fallbackMsg: string) => {
    if (e instanceof MfaError) {
      const mfaError: MfaError = e;
      switch (mfaError.type) {
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
            'MFA token expired. Please log in again to get a new one.'
          );
          setMfaToken('');
          break;
        case MfaErrorCodes.INVALID_MFA_TOKEN:
          Alert.alert('Invalid Token', 'The MFA token is invalid.');
          setMfaToken('');
          break;
        case MfaErrorCodes.TOO_MANY_ATTEMPTS:
          Alert.alert(
            'Rate Limited',
            'Too many attempts. Please wait before trying again.'
          );
          break;
        case MfaErrorCodes.ENROLLMENT_FAILED:
          Alert.alert('Enrollment Failed', 'MFA enrollment failed.');
          break;
        case MfaErrorCodes.INVALID_PHONE_NUMBER:
          Alert.alert('Invalid Phone', 'The phone number provided is invalid.');
          break;
        case MfaErrorCodes.INVALID_EMAIL:
          Alert.alert('Invalid Email', 'The email provided is invalid.');
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
          Alert.alert('MFA Error', `[${mfaError.type}] ${mfaError.message}`);
      }
      setApiError(mfaError);
    } else {
      setApiError(e as Error);
      Alert.alert('Error', fallbackMsg);
    }
  };

  const onMfaGetAuthenticators = async () => {
    clearResult();
    try {
      const authenticators = await mfaGetAuthenticators({ mfaToken });
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
      const challenge = await mfaEnroll({ mfaToken, type: 'otp' });
      setResult(challenge);
    } catch (e) {
      handleMfaError(e, 'OTP enrollment failed.');
    }
  };

  const onMfaEnrollSms = async () => {
    clearResult();
    try {
      const challenge = await mfaEnroll({
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
      const challenge = await mfaEnroll({ mfaToken, email: mfaEmail });
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
      const challengeResult = await mfaChallenge({
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
      const credentials = await mfaVerify({ mfaToken, otp: mfaOtp });
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
      const credentials = await mfaVerify(params);
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
      const credentials = await mfaVerify({
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
      <Header title="Welcome" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>React Native Auth0 Hooks</Text>

        {error && <Result title="Hook Error" error={error} result={null} />}
        {apiError && (
          <Result title="API Error" error={apiError} result={null} />
        )}
        {result && <Result title="Result" error={null} result={result} />}

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
          <Text style={styles.hint}>
            If MFA is enabled, a failed login will return an mfa_token that
            auto-populates below.
          </Text>
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

        <Section title="MFA Flexible Factors Grant">
          <Text style={styles.hint}>
            Get an mfa_token from a password login with MFA enabled, or paste
            one manually.
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
            title="mfaGetAuthenticators()"
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
            title="mfaChallenge()"
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
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginTop: 8,
  },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
});

export default HomeScreen;
