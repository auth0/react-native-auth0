import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {
  useAuth0,
  WebAuthError,
  WebAuthErrorCodes,
  MfaError,
  MfaErrorCodes,
  MfaFactorType,
} from 'react-native-auth0';
import type {
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
} from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabeledInput from '../../components/LabeledInput';
import Result from '../../components/Result';
import config from '../../auth0-configuration';

type MfaStep =
  | 'idle'
  | 'list'
  | 'enroll-select'
  | 'enroll-details'
  | 'challenge'
  | 'verify'
  | 'complete';

type EnrollType = MfaFactorType;

const HomeScreen = () => {
  const {
    authorize,
    loginWithPasswordRealm,
    sendEmailCode,
    authorizeWithEmail,
    mfa,
    error,
  } = useAuth0();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [result, setResult] = useState<object | null>(null);

  // MFA wizard state
  const [mfaToken, setMfaToken] = useState('');
  const [mfaStep, setMfaStep] = useState<MfaStep>('idle');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [authenticators, setAuthenticators] = useState<MfaAuthenticator[]>([]);
  const [selectedAuthenticator, setSelectedAuthenticator] =
    useState<MfaAuthenticator | null>(null);
  const [enrollType, setEnrollType] = useState<EnrollType | null>(null);
  const [enrollPhoneNumber, setEnrollPhoneNumber] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollmentChallenge, setEnrollmentChallenge] =
    useState<MfaEnrollmentChallenge | null>(null);
  const [challengeResult, setChallengeResult] =
    useState<MfaChallengeResult | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyBindingCode, setVerifyBindingCode] = useState('');

  const clearResult = () => {
    setResult(null);
    setApiError(null);
  };

  const resetMfaWizard = () => {
    setMfaStep('idle');
    setAuthenticators([]);
    setSelectedAuthenticator(null);
    setEnrollType(null);
    setEnrollPhoneNumber('');
    setEnrollEmail('');
    setEnrollmentChallenge(null);
    setChallengeResult(null);
    setVerifyCode('');
    setVerifyBindingCode('');
    setMfaLoading(false);
    clearResult();
  };

  const onLogin = async () => {
    try {
      await authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
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
      if (e?.json?.mfa_token) {
        setMfaToken(e.json.mfa_token);
        setMfaStep('list');
        Alert.alert(
          'MFA Required',
          'Multi-factor authentication is required. Follow the steps below.'
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

  // --- MFA Wizard Handlers ---

  const handleMfaError = (e: unknown, fallbackMsg: string) => {
    if (e instanceof MfaError) {
      if (
        e.type === MfaErrorCodes.EXPIRED_MFA_TOKEN ||
        e.type === MfaErrorCodes.INVALID_MFA_TOKEN
      ) {
        Alert.alert('Session Expired', 'Please log in again.');
        setMfaToken('');
        resetMfaWizard();
        return;
      }
      Alert.alert('MFA Error', e.message);
      setApiError(e);
    } else {
      setApiError(e as Error);
      Alert.alert('Error', fallbackMsg);
    }
  };

  const onStartMfa = async () => {
    setMfaLoading(true);
    clearResult();
    try {
      const list = await mfa.getAuthenticators({ mfaToken });
      setAuthenticators(list);
      setMfaStep('list');
    } catch (e) {
      handleMfaError(e, 'Failed to list authenticators.');
    } finally {
      setMfaLoading(false);
    }
  };

  const onSelectAuthenticator = (auth: MfaAuthenticator) => {
    setSelectedAuthenticator(auth);
    setChallengeResult(null);
    setMfaStep('challenge');
    onChallenge(auth);
  };

  const onChallenge = async (auth: MfaAuthenticator) => {
    setMfaLoading(true);
    try {
      const result = await mfa.challenge({
        mfaToken,
        authenticatorId: auth.id,
      });
      setChallengeResult(result);
      setMfaStep('verify');
    } catch (e) {
      handleMfaError(e, 'Challenge failed.');
      setMfaStep('list');
    } finally {
      setMfaLoading(false);
    }
  };

  const onSelectEnrollType = (type: EnrollType) => {
    setEnrollType(type);
    if (type === MfaFactorType.OTP || type === MfaFactorType.PUSH) {
      onEnroll(type);
    } else {
      setMfaStep('enroll-details');
    }
  };

  const onEnroll = async (type?: EnrollType) => {
    const factor = type || enrollType;
    if (!factor) return;

    setMfaLoading(true);
    try {
      let challenge: MfaEnrollmentChallenge;
      if (factor === MfaFactorType.SMS) {
        challenge = await mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.SMS,
          phoneNumber: enrollPhoneNumber,
        });
      } else if (factor === MfaFactorType.EMAIL) {
        challenge = await mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.EMAIL,
          email: enrollEmail,
        });
      } else {
        challenge = await mfa.enroll({ mfaToken, factorType: factor });
      }
      setEnrollmentChallenge(challenge);
      setMfaStep('verify');
    } catch (e) {
      handleMfaError(e, 'Enrollment failed.');
    } finally {
      setMfaLoading(false);
    }
  };

  const onVerify = async () => {
    setMfaLoading(true);
    try {
      let credentials;
      const oobCode =
        challengeResult?.oobCode ||
        (enrollmentChallenge?.type === 'oob'
          ? enrollmentChallenge.oobCode
          : undefined);

      if (oobCode) {
        credentials = await mfa.verify({
          mfaToken,
          oobCode,
          bindingCode: verifyBindingCode || undefined,
        });
      } else {
        credentials = await mfa.verify({ mfaToken, otp: verifyCode });
      }
      setResult({
        success: true,
        accessToken: credentials.accessToken.substring(0, 20) + '...',
      });
      setMfaStep('complete');
    } catch (e) {
      handleMfaError(e, 'Verification failed.');
    } finally {
      setMfaLoading(false);
    }
  };

  // --- MFA Wizard UI ---

  const renderMfaWizard = () => {
    switch (mfaStep) {
      case 'idle':
        return (
          <>
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
            <Button
              onPress={onStartMfa}
              title="Start MFA"
              disabled={!mfaToken || mfaLoading}
            />
          </>
        );

      case 'list':
        return (
          <>
            <Text style={styles.stepTitle}>Step 1: Select Authenticator</Text>
            {authenticators.length > 0 ? (
              <>
                <Text style={styles.hint}>
                  Select an enrolled authenticator to challenge:
                </Text>
                {authenticators.map((auth) => (
                  <TouchableOpacity
                    key={auth.id}
                    style={styles.authItem}
                    onPress={() => onSelectAuthenticator(auth)}
                  >
                    <Text style={styles.authItemTitle}>
                      {auth.authenticatorType}
                      {auth.oobChannel ? ` (${auth.oobChannel})` : ''}
                    </Text>
                    <Text style={styles.authItemSubtitle}>{auth.id}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.divider} />
              </>
            ) : (
              <Text style={styles.hint}>
                No authenticators enrolled. Enroll a new one below.
              </Text>
            )}
            <Button
              onPress={() => setMfaStep('enroll-select')}
              title="Enroll New Authenticator"
            />
            <Button onPress={resetMfaWizard} title="Back" />
          </>
        );

      case 'enroll-select':
        return (
          <>
            <Text style={styles.stepTitle}>Step 2: Choose Factor Type</Text>
            <Button
              onPress={() => onSelectEnrollType(MfaFactorType.OTP)}
              title="TOTP (Authenticator App)"
              disabled={mfaLoading}
            />
            <Button
              onPress={() => onSelectEnrollType(MfaFactorType.SMS)}
              title="SMS"
              disabled={mfaLoading}
            />
            <Button
              onPress={() => onSelectEnrollType(MfaFactorType.EMAIL)}
              title="Email"
              disabled={mfaLoading}
            />
            <Button
              onPress={() => onSelectEnrollType(MfaFactorType.PUSH)}
              title="Push Notification"
              disabled={mfaLoading}
            />
            <Button onPress={() => setMfaStep('list')} title="Back" />
          </>
        );

      case 'enroll-details':
        return (
          <>
            <Text style={styles.stepTitle}>Step 2: Enter Details</Text>
            {enrollType === MfaFactorType.SMS && (
              <>
                <LabeledInput
                  label="Phone Number"
                  value={enrollPhoneNumber}
                  onChangeText={setEnrollPhoneNumber}
                  placeholder="+12025550135"
                  keyboardType="phone-pad"
                />
                <Button
                  onPress={() => onEnroll()}
                  title="Enroll SMS"
                  disabled={!enrollPhoneNumber || mfaLoading}
                />
              </>
            )}
            {enrollType === MfaFactorType.EMAIL && (
              <>
                <LabeledInput
                  label="Email"
                  value={enrollEmail}
                  onChangeText={setEnrollEmail}
                  placeholder="user@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Button
                  onPress={() => onEnroll()}
                  title="Enroll Email"
                  disabled={!enrollEmail || mfaLoading}
                />
              </>
            )}
            <Button onPress={() => setMfaStep('enroll-select')} title="Back" />
          </>
        );

      case 'verify':
        return (
          <>
            <Text style={styles.stepTitle}>Step 3: Verify</Text>
            {enrollmentChallenge?.type === 'totp' && (
              <View style={styles.infoBox}>
                {enrollmentChallenge.barcodeUri && (
                  <>
                    <View style={styles.qrContainer}>
                      <Image
                        source={{
                          uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollmentChallenge.barcodeUri)}`,
                        }}
                        style={styles.qrImage}
                      />
                    </View>
                    <Button
                      onPress={() =>
                        Linking.openURL(enrollmentChallenge.barcodeUri!)
                      }
                      title="Open in Authenticator App"
                    />
                  </>
                )}
                <Text style={styles.infoLabel}>Secret:</Text>
                <Text style={styles.infoValue} selectable>
                  {enrollmentChallenge.secret}
                </Text>
              </View>
            )}
            {challengeResult && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  Challenge Type: {challengeResult.challengeType}
                </Text>
                {challengeResult.bindingMethod && (
                  <Text style={styles.infoLabel}>
                    Binding Method: {challengeResult.bindingMethod}
                  </Text>
                )}
              </View>
            )}
            {(challengeResult?.challengeType === 'oob' ||
              enrollmentChallenge?.type === 'oob') && (
              <>
                <Text style={styles.hint}>
                  A code has been sent to your device. Enter the binding code
                  below.
                </Text>
                <LabeledInput
                  label="Binding Code"
                  value={verifyBindingCode}
                  onChangeText={setVerifyBindingCode}
                  keyboardType="numeric"
                  placeholder="Code from SMS/email/push"
                />
                <Button
                  onPress={onVerify}
                  title="Verify"
                  disabled={!verifyBindingCode || mfaLoading}
                />
              </>
            )}
            {(challengeResult?.challengeType === 'otp' ||
              enrollmentChallenge?.type === 'totp') && (
              <>
                <LabeledInput
                  label="OTP Code"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  keyboardType="numeric"
                  placeholder="6-digit code from authenticator app"
                />
                <Button
                  onPress={onVerify}
                  title="Verify"
                  disabled={!verifyCode || mfaLoading}
                />
              </>
            )}
            <Button onPress={() => setMfaStep('list')} title="Back" />
          </>
        );

      case 'complete':
        return (
          <>
            <Text style={styles.stepTitle}>MFA Complete</Text>
            <Text style={styles.successText}>Authentication successful!</Text>
            {result && (
              <Result title="Credentials" error={null} result={result} />
            )}
            <Button onPress={resetMfaWizard} title="Done" />
          </>
        );

      default:
        return null;
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
          <Text style={styles.hint}>
            If MFA is enabled, a failed login will return an mfa_token and
            automatically start the MFA wizard.
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
          {renderMfaWizard()}
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
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  authItem: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  authItemTitle: { fontSize: 14, fontWeight: '600' },
  authItemSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  infoBox: {
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  infoLabel: { fontSize: 12, fontWeight: '600', color: '#444' },
  infoValue: { fontSize: 12, color: '#333', fontFamily: 'monospace' },
  qrContainer: { alignItems: 'center', marginVertical: 12 },
  qrImage: { width: 200, height: 200 },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
});

export default HomeScreen;
