import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MfaFactorType } from 'react-native-auth0';
import auth0 from '../../api/auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import LabeledInput from '../../components/LabeledInput';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';

type ApiTestsRouteProp = RouteProp<ClassDemoStackParamList, 'ClassApiTests'>;

type Props = {
  route: ApiTestsRouteProp;
};

const ClassApiTestsScreen = ({ route }: Props) => {
  const { accessToken } = route.params;
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // State for specific API calls
  const [email, setEmail] = useState('test-user@auth0.com'); // dummy username
  const [password, setPassword] = useState('P@ssword123'); // dummy password
  const [mfaToken, setMfaToken] = useState('');
  const [otp, setOtp] = useState('');
  const [authenticatorId, setAuthenticatorId] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollEmailMfa, setEnrollEmailMfa] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [bindingCode, setBindingCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [verifyScope, setVerifyScope] = useState('');
  const [verifyAudience, setVerifyAudience] = useState('');

  // mfa.verify() returns credentials; redact tokens before they reach the
  // logged/displayed result panel. The refresh token is carried into state for
  // subsequent tests but omitted from the returned object so runTest doesn't
  // overwrite that state with a redacted placeholder.
  const sanitizeCredentialResult = (res: Record<string, unknown>) => {
    const { accessToken, refreshToken, idToken, ...safe } = res;
    if (typeof refreshToken === 'string') {
      setRefreshToken(refreshToken);
    }
    return {
      ...safe,
      ...(accessToken ? { accessToken: '[REDACTED]' } : {}),
      ...(idToken ? { idToken: '[REDACTED]' } : {}),
    };
  };

  const runTest = async (testFn: () => Promise<any>, title: string) => {
    setError(null);
    setResult(null);
    console.log(`Running test: ${title}`);
    try {
      const res = await testFn();
      const successMessage = res ?? {
        success: `${title} completed successfully`,
      };
      console.log('Success:', successMessage);
      setResult(successMessage);

      // If we got credentials, update our state for subsequent tests
      if (res?.mfa_token) setMfaToken(res.mfa_token);
      if (res?.refreshToken) setRefreshToken(res.refreshToken);
      // Carry an oobCode forward from a challenge/enroll result so the verify
      // call below can use it without manual copy/paste.
      if (res?.oobCode) setOobCode(res.oobCode);
    } catch (e) {
      console.log('Error:', e);
      setError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Direct API Tests" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result title="Last Action Result" result={result} error={error} />

        <Section title="User Profile">
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.userInfo({ token: accessToken }),
                'Get User Info'
              )
            }
            title="auth.userInfo()"
          />
        </Section>

        <Section title="Passwordless">
          <LabeledInput
            label="Email for Passwordless"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.passwordlessWithEmail({ email, send: 'code' }),
                'Passwordless Email'
              )
            }
            title="auth.passwordlessWithEmail(code)"
          />
          {/* Note: loginWithEmail would require getting the code from the email */}
        </Section>

        <Section title="DB Connections">
          <LabeledInput
            label="Email"
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
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.auth.createUser({
                    email,
                    password,
                    connection: 'Username-Password-Authentication',
                  }),
                'Create User'
              )
            }
            title="auth.createUser()"
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.auth.resetPassword({
                    email,
                    connection: 'Username-Password-Authentication',
                  }),
                'Reset Password'
              )
            }
            title="auth.resetPassword()"
          />
        </Section>

        <Section title="MFA Flexible Factors Grant">
          <Text style={styles.hint}>
            Uses auth0.mfa class-based API for flexible MFA operations.
          </Text>
          <LabeledInput
            label="MFA Token"
            value={mfaToken}
            onChangeText={setMfaToken}
            placeholder="From a failed password login"
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.mfa.getAuthenticators({
                    mfaToken,
                    factorsAllowed: [
                      MfaFactorType.OTP,
                      MfaFactorType.SMS,
                      MfaFactorType.VOICE,
                      MfaFactorType.EMAIL,
                      MfaFactorType.PUSH,
                    ],
                  }),
                'List Authenticators'
              )
            }
            title="mfa.getAuthenticators()"
            disabled={!mfaToken}
          />
          <Text style={styles.hint}>
            Each authenticator carries a `type`
            (otp/phone/email/push-notification) alongside `authenticatorType`
            and `oobChannel`.
          </Text>

          <Text style={styles.subTitle}>Enroll a factor</Text>
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.mfa.enroll({ mfaToken, factorType: MfaFactorType.OTP }),
                'Enroll TOTP'
              )
            }
            title="mfa.enroll(otp)"
            disabled={!mfaToken}
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.mfa.enroll({
                    mfaToken,
                    factorType: MfaFactorType.PUSH,
                  }),
                'Enroll Push'
              )
            }
            title="mfa.enroll(push)"
            disabled={!mfaToken}
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
              runTest(
                () =>
                  auth0.mfa.enroll({
                    mfaToken,
                    factorType: MfaFactorType.SMS,
                    phoneNumber: enrollPhone,
                  }),
                'Enroll SMS'
              )
            }
            title="mfa.enroll(sms)"
            disabled={!mfaToken || !enrollPhone}
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.mfa.enroll({
                    mfaToken,
                    factorType: MfaFactorType.VOICE,
                    phoneNumber: enrollPhone,
                  }),
                'Enroll Voice'
              )
            }
            title="mfa.enroll(voice)"
            disabled={!mfaToken || !enrollPhone}
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
              runTest(
                () =>
                  auth0.mfa.enroll({
                    mfaToken,
                    factorType: MfaFactorType.EMAIL,
                    email: enrollEmailMfa,
                  }),
                'Enroll Email'
              )
            }
            title="mfa.enroll(email)"
            disabled={!mfaToken || !enrollEmailMfa}
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
              runTest(
                () => auth0.mfa.challenge({ mfaToken, authenticatorId }),
                'Challenge'
              )
            }
            title="mfa.challenge()"
            disabled={!mfaToken || !authenticatorId}
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
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button
            onPress={() =>
              runTest(
                async () =>
                  sanitizeCredentialResult(
                    (await auth0.mfa.verify({
                      mfaToken,
                      otp,
                      scope: verifyScope || undefined,
                      audience: verifyAudience || undefined,
                    })) as Record<string, unknown>
                  ),
                'Verify OTP'
              )
            }
            title="mfa.verify(otp)"
            disabled={!mfaToken || !otp}
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
              runTest(
                async () =>
                  sanitizeCredentialResult(
                    (await auth0.mfa.verify({
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
            disabled={!mfaToken || !oobCode}
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
              runTest(
                async () =>
                  sanitizeCredentialResult(
                    (await auth0.mfa.verify({
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
            disabled={!mfaToken || !recoveryCode}
          />
        </Section>

        <Section title="Legacy MFA & Tokens">
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.loginWithOTP({ mfaToken, otp }),
                'Login with OTP'
              )
            }
            title="auth.loginWithOTP()"
            disabled={!mfaToken}
          />
          <LabeledInput
            label="Refresh Token"
            value={refreshToken}
            onChangeText={setRefreshToken}
            placeholder="From a successful login"
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.refreshToken({ refreshToken }),
                'Refresh Token'
              )
            }
            title="auth.refreshToken()"
            disabled={!refreshToken}
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.revoke({ refreshToken }),
                'Revoke Refresh Token'
              )
            }
            title="auth.revoke()"
            disabled={!refreshToken}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 10,
  },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
});

export default ClassApiTestsScreen;
