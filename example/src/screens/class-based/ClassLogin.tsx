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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  MfaError,
  MfaErrorCodes,
  MfaFactorType,
  WebAuthError,
  WebAuthErrorCodes,
} from 'react-native-auth0';
import type { PasswordlessChallenge } from 'react-native-auth0';
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

  const [useTrustedWebActivity, setUseTrustedWebActivity] = useState(true);

  // MFA state (flat API-test panel)
  const [mfaToken, setMfaToken] = useState('');
  const [mfaOtp, setMfaOtp] = useState('');
  const [authenticatorId, setAuthenticatorId] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollEmailMfa, setEnrollEmailMfa] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [bindingCode, setBindingCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [verifyScope, setVerifyScope] = useState('');
  const [verifyAudience, setVerifyAudience] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  // Passwordless OTP state
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<PasswordlessChallenge | null>(
    null
  );

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
          'Multi-factor authentication is required. The MFA token has been filled in below.'
        );
      }
      setError(e as Error);
    }
  };

  const clearResult = () => {
    setError(null);
    setResult(null);
  };

  const mfaClient = auth0.mfa;

  // mfa.verify() returns credentials; redact tokens before they reach the
  // displayed result panel.
  const sanitizeCredentialResult = (res: Record<string, unknown>) => {
    const { accessToken, refreshToken, idToken, ...safe } = res;
    return {
      ...safe,
      ...(accessToken ? { accessToken: '[REDACTED]' } : {}),
      ...(idToken ? { idToken: '[REDACTED]' } : {}),
      ...(refreshToken ? { refreshToken: '[REDACTED]' } : {}),
    };
  };

  const runMfaTest = async (testFn: () => Promise<any>, title: string) => {
    clearResult();
    setMfaLoading(true);
    try {
      const res = await testFn();
      setResult(res ?? { success: `${title} completed successfully` });
      // Carry an oobCode forward from a challenge/enroll result so verify can
      // use it without manual copy/paste.
      if (res?.oobCode) setOobCode(res.oobCode);
    } catch (e) {
      if (
        e instanceof MfaError &&
        (e.type === MfaErrorCodes.EXPIRED_MFA_TOKEN ||
          e.type === MfaErrorCodes.INVALID_MFA_TOKEN)
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again to get a new MFA token.'
        );
        setMfaToken('');
      }
      setError(e as Error);
    } finally {
      setMfaLoading(false);
    }
  };

  const onSendOtpChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const result =
        otpMethod === 'email'
          ? await auth0.passwordless.challengeWithEmail({
              email: otpEmail,
              connection: 'Username-Password-Authentication',
              allowSignup: true,
            })
          : await auth0.passwordless.challengeWithPhoneNumber({
              phoneNumber: otpPhone,
              connection: 'Username-Password-Authentication',
              deliveryMethod: 'text',
              allowSignup: true,
            });
      setChallenge(result);
      Alert.alert(
        'Success',
        otpMethod === 'email'
          ? 'Check your email for the one-time code.'
          : 'Check your phone for the one-time code.'
      );
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const onLoginWithOtp = async () => {
    if (!challenge) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credentials = await auth0.passwordless.loginWithOTP({
        challenge,
        otp,
        audience: `https://${config.domain}/api/v2/`,
      });
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
      <ScrollView contentContainerStyle={styles.content}>
        {(error || result) && (
          <Result title="Last Action Result" error={error} result={result} />
        )}

        <Section title="Web Auth (Recommended)">
          <Button onPress={onLogin} title="Log In" loading={loading} />
          <>
            <Text style={styles.description}>
              Trusted Web Activity opens login full-screen (no URL bar).
              Requires registering the app's SHA-256 Key Hash in the Auth0
              Dashboard; otherwise it falls back to a Custom Tab. Android only.
            </Text>
            <Button
              onPress={() => setUseTrustedWebActivity((prev) => !prev)}
              title={`Trusted Web Activity: ${
                useTrustedWebActivity ? 'On' : 'Off'
              }`}
              style={!useTrustedWebActivity ? styles.inactiveButton : undefined}
            />
          </>
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
            If MFA is enabled, a failed login returns an mfa_token that is
            filled into the MFA section below.
          </Text>
        </Section>

        <Section title="MFA Flexible Factors Grant">
          <Text style={styles.hint}>
            Uses auth0.mfa for flexible MFA operations. Get an mfa_token from a
            failed password login above, or paste one manually.
          </Text>
          <LabeledInput
            label="MFA Token"
            value={mfaToken}
            onChangeText={setMfaToken}
            placeholder="From a failed password login"
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.getAuthenticators({
                    mfaToken,
                    factorsAllowed: [
                      MfaFactorType.OTP,
                      MfaFactorType.SMS,
                      MfaFactorType.VOICE,
                      MfaFactorType.EMAIL,
                      MfaFactorType.PUSH,
                      'recovery-code',
                    ],
                  }),
                'List Authenticators'
              )
            }
            title="mfa.getAuthenticators()"
            disabled={!mfaToken || mfaLoading}
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.getAuthenticators({
                    mfaToken,
                    factorsAllowed: ['recovery-code'],
                  }),
                'List Recovery Code Only'
              )
            }
            title="mfa.getAuthenticators(recovery-code)"
            disabled={!mfaToken || mfaLoading}
          />
          <Text style={styles.hint}>
            Each authenticator carries a `type`
            (otp/phone/email/push-notification/recovery-code) alongside
            `authenticatorType` and `oobChannel`. `recovery-code` is listable
            (via `factorsAllowed`) but not enrollable.
          </Text>

          <Text style={styles.subTitle}>Enroll a factor</Text>
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.enroll({ mfaToken, factorType: MfaFactorType.OTP }),
                'Enroll TOTP'
              )
            }
            title="mfa.enroll(otp)"
            disabled={!mfaToken || mfaLoading}
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.enroll({
                    mfaToken,
                    factorType: MfaFactorType.PUSH,
                  }),
                'Enroll Push'
              )
            }
            title="mfa.enroll(push)"
            disabled={!mfaToken || mfaLoading}
          />
          <LabeledInput
            label="Phone Number (SMS / Voice)"
            value={enrollPhone}
            onChangeText={setEnrollPhone}
            placeholder="+12025550135"
            keyboardType="phone-pad"
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.enroll({
                    mfaToken,
                    factorType: MfaFactorType.SMS,
                    phoneNumber: enrollPhone,
                  }),
                'Enroll SMS'
              )
            }
            title="mfa.enroll(sms)"
            disabled={!mfaToken || !enrollPhone || mfaLoading}
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.enroll({
                    mfaToken,
                    factorType: MfaFactorType.VOICE,
                    phoneNumber: enrollPhone,
                  }),
                'Enroll Voice'
              )
            }
            title="mfa.enroll(voice)"
            disabled={!mfaToken || !enrollPhone || mfaLoading}
          />
          <Text style={styles.hint}>
            Voice is a distinct channel on web only. On native it falls back to
            SMS on the same number.
          </Text>
          <LabeledInput
            label="Email (MFA enroll)"
            value={enrollEmailMfa}
            onChangeText={setEnrollEmailMfa}
            placeholder="user@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={() =>
              runMfaTest(
                () =>
                  mfaClient.enroll({
                    mfaToken,
                    factorType: MfaFactorType.EMAIL,
                    email: enrollEmailMfa,
                  }),
                'Enroll Email'
              )
            }
            title="mfa.enroll(email)"
            disabled={!mfaToken || !enrollEmailMfa || mfaLoading}
          />

          <Text style={styles.subTitle}>Challenge</Text>
          <LabeledInput
            label="Authenticator ID"
            value={authenticatorId}
            onChangeText={setAuthenticatorId}
            placeholder="e.g. sms|dev_123"
          />
          <Button
            onPress={() =>
              runMfaTest(
                () => mfaClient.challenge({ mfaToken, authenticatorId }),
                'Challenge'
              )
            }
            title="mfa.challenge()"
            disabled={!mfaToken || !authenticatorId || mfaLoading}
          />

          <Text style={styles.subTitle}>Verify</Text>
          <Text style={styles.hint}>
            Scope/audience are optional; supply them to mint an API access token
            on successful verification.
          </Text>
          <LabeledInput
            label="Scope (optional)"
            value={verifyScope}
            onChangeText={setVerifyScope}
            placeholder="openid profile email"
            autoCapitalize="none"
          />
          <LabeledInput
            label="Audience (optional)"
            value={verifyAudience}
            onChangeText={setVerifyAudience}
            placeholder="https://your-api/"
            autoCapitalize="none"
          />
          <LabeledInput
            label="OTP Code"
            value={mfaOtp}
            onChangeText={setMfaOtp}
            keyboardType="numeric"
          />
          <Button
            onPress={() =>
              runMfaTest(
                async () =>
                  sanitizeCredentialResult(
                    (await mfaClient.verify({
                      mfaToken,
                      otp: mfaOtp,
                      scope: verifyScope || undefined,
                      audience: verifyAudience || undefined,
                    })) as Record<string, unknown>
                  ),
                'Verify OTP'
              )
            }
            title="mfa.verify(otp)"
            disabled={!mfaToken || !mfaOtp || mfaLoading}
          />
          <LabeledInput
            label="OOB Code"
            value={oobCode}
            onChangeText={setOobCode}
            placeholder="From challenge/enroll result"
          />
          <LabeledInput
            label="Binding Code (SMS/Voice/Email)"
            value={bindingCode}
            onChangeText={setBindingCode}
            keyboardType="numeric"
            placeholder="Code from SMS/email/voice"
          />
          <Button
            onPress={() =>
              runMfaTest(
                async () =>
                  sanitizeCredentialResult(
                    (await mfaClient.verify({
                      mfaToken,
                      oobCode,
                      bindingCode: bindingCode || undefined,
                      scope: verifyScope || undefined,
                      audience: verifyAudience || undefined,
                    })) as Record<string, unknown>
                  ),
                'Verify OOB'
              )
            }
            title="mfa.verify(oob)"
            disabled={!mfaToken || !oobCode || mfaLoading}
          />
          <LabeledInput
            label="Recovery Code"
            value={recoveryCode}
            onChangeText={setRecoveryCode}
            placeholder="Recovery code"
            autoCapitalize="none"
          />
          <Button
            onPress={() =>
              runMfaTest(
                async () =>
                  sanitizeCredentialResult(
                    (await mfaClient.verify({
                      mfaToken,
                      recoveryCode,
                      scope: verifyScope || undefined,
                      audience: verifyAudience || undefined,
                    })) as Record<string, unknown>
                  ),
                'Verify Recovery Code'
              )
            }
            title="mfa.verify(recoveryCode)"
            disabled={!mfaToken || !recoveryCode || mfaLoading}
          />
        </Section>

        {Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Passwordless OTP (Database Connection)
            </Text>
            <Text style={styles.description}>
              Two-step flow on a database connection with email_otp / phone_otp
              enabled: challenge → verify code.
            </Text>

            <View style={styles.row}>
              <Button
                onPress={() => setOtpMethod('email')}
                title="Email"
                style={[
                  styles.halfButton,
                  otpMethod !== 'email' && styles.inactiveButton,
                ]}
              />
              <Button
                onPress={() => setOtpMethod('phone')}
                title="Phone"
                style={[
                  styles.halfButton,
                  otpMethod !== 'phone' && styles.inactiveButton,
                ]}
              />
            </View>

            {otpMethod === 'email' ? (
              <LabeledInput
                label="Email"
                value={otpEmail}
                onChangeText={setOtpEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            ) : (
              <LabeledInput
                label="Phone Number (E.164, e.g. +15555550123)"
                value={otpPhone}
                onChangeText={setOtpPhone}
                autoCapitalize="none"
                keyboardType="phone-pad"
              />
            )}
            <Button
              onPress={onSendOtpChallenge}
              title="Send Code"
              loading={loading}
            />

            {challenge && (
              <>
                <LabeledInput
                  label="One-Time Code"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                />
                <Button
                  onPress={onLoginWithOtp}
                  title="Log In with Code"
                  loading={loading}
                />
              </>
            )}
          </View>
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
  content: { padding: 16, gap: 20, paddingBottom: 50 },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  description: { fontSize: 13, color: '#666', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  halfButton: { flex: 1, minWidth: 0 },
  inactiveButton: { backgroundColor: '#BDBDBD' },
});

export default ClassLoginScreen;
