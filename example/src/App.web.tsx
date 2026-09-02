import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import Auth0, {
  Auth0Provider,
  useAuth0,
  User,
  MfaError,
  MfaErrorCodes,
  MfaFactorType,
  MyAccountError,
  PasskeyError,
  PreferredAuthenticationMethods,
} from 'react-native-auth0';
import type {
  MfaAuthenticator,
  MfaEnrollmentChallenge,
  MfaChallengeResult,
} from 'react-native-auth0';

import config from './auth0-configuration';
import Button from './components/Button';
import Header from './components/Header';
import Result from './components/Result';
import LabeledInput from './components/LabeledInput';
import { createWebPasskey } from './passkey/webPasskey';

// My Account API is served from the `/me/` audience of the tenant. MRRT
// (Multi-Resource Refresh Tokens) lets a single web session mint an access
// token for this audience via `getApiCredentials` without a fresh redirect.
const MY_ACCOUNT_AUDIENCE = `https://${config.domain}/me/`;
const MY_ACCOUNT_SCOPE =
  'read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors create:me:authentication_methods';

type MfaStep =
  | 'idle'
  | 'list'
  | 'enroll-select'
  | 'enroll-details'
  | 'verify'
  | 'complete';

type EnrollType = MfaFactorType;

// ========================================================================
// --- 1. HOOKS-BASED IMPLEMENTATION (Recommended) ---
// ========================================================================

const HooksAuthContent = (): React.JSX.Element => {
  const {
    authorize,
    clearSession,
    user,
    error,
    isLoading,
    getCredentials,
    getApiCredentials,
    createUser,
    resetPassword,
    loginWithPasswordRealm,
    customTokenExchange,
    mfa,
    myAccount,
    passkeySignupChallenge,
    passkeyLoginChallenge,
    getTokenByPasskey,
  } = useAuth0();

  const [result, setResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkeyEmail, setPasskeyEmail] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Custom Token Exchange (RFC 8693) state
  const [subjectToken, setSubjectToken] = useState('');
  const [subjectTokenType, setSubjectTokenType] = useState(
    'urn:acme:external-idp-token'
  );
  const [actorToken, setActorToken] = useState('');
  const [actorTokenType, setActorTokenType] = useState(
    'urn:ietf:params:oauth:token-type:id_token'
  );

  const fillActorTokenFromSession = async () => {
    setApiError(null);
    try {
      const credentials = await getCredentials();
      if (credentials?.idToken) {
        setActorToken(credentials.idToken);
      } else {
        setApiError(new Error('No ID token available in the current session.'));
      }
    } catch (e) {
      setApiError(e as Error);
    }
  };

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
  const [verifyScope, setVerifyScope] = useState('');
  const [verifyAudience, setVerifyAudience] = useState('');

  // My Account state
  const [maResult, setMaResult] = useState<object | null>(null);
  const [maError, setMaError] = useState<Error | null>(null);
  const [maLoading, setMaLoading] = useState(false);
  const [maToken, setMaToken] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [methodId, setMethodId] = useState('');
  const [methodName, setMethodName] = useState('');
  const [enrollmentState, setEnrollmentState] = useState<{
    id: string;
    authSession: string;
    kind: 'phone' | 'email' | 'totp' | 'recovery';
  } | null>(null);
  const [passkeyChallenge, setPasskeyChallenge] = useState<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Record<string, any>;
  } | null>(null);

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
    setVerifyScope('');
    setVerifyAudience('');
    setMfaLoading(false);
  };

  const runDemo = async (action: () => Promise<any>) => {
    setResult(null);
    setApiError(null);
    try {
      const response = await action();
      setResult(response ?? { success: true });
    } catch (e) {
      if (e instanceof MfaError) {
        setApiError(e);
        return;
      }
      setApiError(e as Error);
    }
  };

  const handleMfaError = (e: unknown, fallbackMsg: string) => {
    if (e instanceof MfaError) {
      if (
        e.type === MfaErrorCodes.EXPIRED_MFA_TOKEN ||
        e.type === MfaErrorCodes.INVALID_MFA_TOKEN
      ) {
        setMfaToken('');
        resetMfaWizard();
      }
      setApiError(e);
    } else {
      setApiError(e as Error);
    }
  };

  const handlePasskeyError = (e: unknown) => {
    if (e instanceof PasskeyError) {
      setApiError(e);
      return;
    }
    setApiError(e as Error);
  };

  const onPasskeySignup = async () => {
    setResult(null);
    setApiError(null);
    setPasskeyLoading(true);
    try {
      const challenge = await passkeySignupChallenge({
        email: passkeyEmail || undefined,
        realm: 'Username-Password-Authentication',
      });

      // navigator.credentials isn't wrapped by the SDK — normalize a
      // cancelled/failed WebAuthn ceremony into a PasskeyError ourselves
      // so callers get the same PasskeyErrorCodes regardless of where the
      // failure occurred.
      let credential: PublicKeyCredential;
      try {
        credential = (await navigator.credentials.create({
          publicKey:
            challenge.authParamsPublicKey as PublicKeyCredentialCreationOptions,
        })) as PublicKeyCredential;
      } catch (e) {
        throw new PasskeyError(e as Error);
      }

      const credentials = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credential,
        realm: 'Username-Password-Authentication',
      });

      setResult({
        success: true,
        accessToken: `${credentials.accessToken.substring(0, 30)}...`,
      });
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const onPasskeyLogin = async () => {
    setResult(null);
    setApiError(null);
    setPasskeyLoading(true);
    try {
      const challenge = await passkeyLoginChallenge({
        realm: 'Username-Password-Authentication',
      });

      let credential: PublicKeyCredential;
      try {
        credential = (await navigator.credentials.get({
          publicKey:
            challenge.authParamsPublicKey as PublicKeyCredentialRequestOptions,
        })) as PublicKeyCredential;
      } catch (e) {
        throw new PasskeyError(e as Error);
      }

      const credentials = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credential,
        realm: 'Username-Password-Authentication',
      });

      setResult({
        success: true,
        accessToken: `${credentials.accessToken.substring(0, 30)}...`,
      });
    } catch (e) {
      handlePasskeyError(e);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const onMfaStart = async () => {
    setMfaLoading(true);
    setApiError(null);
    try {
      const list = await mfa.getAuthenticators({
        mfaToken,
        factorsAllowed: [
          MfaFactorType.OTP,
          MfaFactorType.SMS,
          MfaFactorType.VOICE,
          MfaFactorType.EMAIL,
          MfaFactorType.PUSH,
        ],
      });
      setAuthenticators(list);
      setMfaStep('list');
    } catch (e) {
      handleMfaError(e, 'Failed to list authenticators.');
    } finally {
      setMfaLoading(false);
    }
  };

  const onMfaSelectAuthenticator = async (auth: MfaAuthenticator) => {
    setSelectedAuthenticator(auth);
    setMfaLoading(true);
    try {
      const res = await mfa.challenge({ mfaToken, authenticatorId: auth.id });
      setChallengeResult(res);
      setMfaStep('verify');
    } catch (e) {
      handleMfaError(e, 'Challenge failed.');
      setMfaStep('list');
    } finally {
      setMfaLoading(false);
    }
  };

  const onMfaSelectEnrollType = (type: EnrollType) => {
    setEnrollType(type);
    if (type === MfaFactorType.OTP || type === MfaFactorType.PUSH) {
      onMfaEnroll(type);
    } else {
      setMfaStep('enroll-details');
    }
  };

  const onMfaEnroll = async (type?: EnrollType) => {
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
      } else if (factor === MfaFactorType.VOICE) {
        challenge = await mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.VOICE,
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

  const onMfaVerify = async () => {
    setMfaLoading(true);
    try {
      let credentials;
      // scope/audience are optional: supply them to mint an access token for a
      // specific API once MFA succeeds.
      const extra = {
        scope: verifyScope || undefined,
        audience: verifyAudience || undefined,
      };
      const oobCode =
        challengeResult?.oobCode ||
        (enrollmentChallenge?.type === 'oob' ||
        enrollmentChallenge?.type === 'push'
          ? enrollmentChallenge.oobCode
          : undefined);

      if (oobCode) {
        credentials = await mfa.verify({
          mfaToken,
          oobCode,
          bindingCode: verifyBindingCode || undefined,
          ...extra,
        });
      } else if (enrollmentChallenge?.type === 'recovery-code') {
        credentials = await mfa.verify({
          mfaToken,
          recoveryCode: verifyCode,
          ...extra,
        });
      } else {
        credentials = await mfa.verify({ mfaToken, otp: verifyCode, ...extra });
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

  // --- My Account helpers ---

  // Mint the `/me/` access token once via MRRT and cache it in state. Every
  // My Account call below reuses this token, so this button must be pressed
  // before any other My Account action.
  const onGetMyAccountToken = async () => {
    setMaResult(null);
    setMaError(null);
    setMaLoading(true);
    try {
      const credentials = await getApiCredentials(
        MY_ACCOUNT_AUDIENCE,
        MY_ACCOUNT_SCOPE
      );
      setMaToken(credentials.accessToken);
      setMaResult({
        step: 'getApiCredentials',
        audience: MY_ACCOUNT_AUDIENCE,
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt,
        scope: credentials.scope,
      });
    } catch (e) {
      setMaError(e as Error);
    } finally {
      setMaLoading(false);
    }
  };

  const runMyAccount = async (
    action: (accessToken: string) => Promise<any>
  ) => {
    if (!maToken) {
      setMaResult(null);
      setMaError(new Error('Get the My Account token (MRRT) first.'));
      return;
    }
    setMaResult(null);
    setMaError(null);
    setMaLoading(true);
    try {
      const response = await action(maToken);
      setMaResult(response ?? { success: true });
    } catch (e) {
      // MyAccountError / PasskeyError carry richer fields than a plain message.
      if (e instanceof MyAccountError) {
        setMaError(
          new Error(
            `[${e.statusCode ?? ''}] ${e.title ?? 'My Account Error'}: ${
              e.detail ?? e.message
            }`
          )
        );
      } else if (e instanceof PasskeyError) {
        setMaError(new Error(`[${e.type}] ${e.message}`));
      } else {
        setMaError(e as Error);
      }
    } finally {
      setMaLoading(false);
    }
  };

  const onEnrollPhone = () =>
    runMyAccount(async (accessToken) => {
      const challenge = await myAccount.enrollPhone({
        accessToken,
        phoneNumber: phoneNumber.trim(),
        preferredAuthenticationMethod: PreferredAuthenticationMethods.SMS,
      });
      setEnrollmentState({ ...challenge, kind: 'phone' });
      return { step: 'enrollPhone', ...challenge };
    });

  const onEnrollEmail = () =>
    runMyAccount(async (accessToken) => {
      const challenge = await myAccount.enrollEmail({
        accessToken,
        emailAddress: emailAddress.trim(),
      });
      setEnrollmentState({ ...challenge, kind: 'email' });
      return { step: 'enrollEmail', ...challenge };
    });

  const onEnrollTOTP = () =>
    runMyAccount(async (accessToken) => {
      const challenge = await myAccount.enrollTOTP({ accessToken });
      setEnrollmentState({
        id: challenge.id,
        authSession: challenge.authSession,
        kind: 'totp',
      });
      return {
        step: 'enrollTOTP',
        id: challenge.id,
        barcodeUri: challenge.barcodeUri,
        manualInputCode: challenge.manualInputCode,
      };
    });

  const onEnrollRecoveryCode = () =>
    runMyAccount(async (accessToken) => {
      const challenge = await myAccount.enrollRecoveryCode({ accessToken });
      setEnrollmentState({
        id: challenge.id,
        authSession: challenge.authSession,
        kind: 'recovery',
      });
      return {
        step: 'enrollRecoveryCode',
        id: challenge.id,
        recoveryCode: challenge.recoveryCode,
      };
    });

  const onConfirmEnrollment = () =>
    runMyAccount(async (accessToken) => {
      if (!enrollmentState) {
        throw new Error('Start an enrollment first.');
      }
      let method;
      if (enrollmentState.kind === 'recovery') {
        method = await myAccount.confirmRecoveryCodeEnrollment({
          accessToken,
          id: enrollmentState.id,
          authSession: enrollmentState.authSession,
        });
      } else {
        const confirmByKind = {
          phone: myAccount.confirmPhoneEnrollment,
          email: myAccount.confirmEmailEnrollment,
          totp: myAccount.confirmTOTPEnrollment,
        };
        method = await confirmByKind[enrollmentState.kind].call(myAccount, {
          accessToken,
          id: enrollmentState.id,
          authSession: enrollmentState.authSession,
          otpCode: otpCode.trim(),
        });
      }
      setEnrollmentState(null);
      setOtpCode('');
      return { step: 'confirmEnrollment', ...method };
    });

  const onPasskeyChallenge = () =>
    runMyAccount(async (accessToken) => {
      const challenge = await myAccount.passkeyEnrollmentChallenge({
        accessToken,
      });
      setPasskeyChallenge(challenge);
      return {
        step: 'passkeyEnrollmentChallenge',
        authenticationMethodId: challenge.authenticationMethodId,
        authSession: challenge.authSession,
      };
    });

  const onPasskeyVerify = () =>
    runMyAccount(async (accessToken) => {
      if (!passkeyChallenge) {
        throw new Error('Run the passkey challenge first.');
      }
      const authResponse = await createWebPasskey(
        passkeyChallenge.authParamsPublicKey
      );
      const method = await myAccount.enrollPasskey({
        accessToken,
        authenticationMethodId: passkeyChallenge.authenticationMethodId,
        authSession: passkeyChallenge.authSession,
        authResponse,
        authParamsPublicKey: passkeyChallenge.authParamsPublicKey,
      });
      setPasskeyChallenge(null);
      return { step: 'enrollPasskey', ...method };
    });

  const onGetFactors = () =>
    runMyAccount(async (accessToken) => {
      const factors = await myAccount.getFactors({ accessToken });
      return { step: 'getFactors', factors };
    });

  const onGetAuthenticationMethods = () =>
    runMyAccount(async (accessToken) => {
      const methods = await myAccount.getAuthenticationMethods({ accessToken });
      return {
        step: 'getAuthenticationMethods',
        count: methods.length,
        methods,
      };
    });

  const onUpdateMethod = () =>
    runMyAccount(async (accessToken) => {
      const method = await myAccount.updateAuthenticationMethodById({
        accessToken,
        id: methodId.trim(),
        name: methodName.trim() || undefined,
      });
      return { step: 'updateAuthenticationMethodById', ...method };
    });

  const onDeleteMethod = () =>
    runMyAccount(async (accessToken) => {
      await myAccount.deleteAuthenticationMethodById({
        accessToken,
        id: methodId.trim(),
      });
      setMethodId('');
      return {
        step: 'deleteAuthenticationMethodById',
        deleted: methodId.trim(),
      };
    });

  if (isLoading) {
    return (
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <Header title="React Native Auth0 (Hooks)" />
      {error && <Result title="Hook Error" error={error} result={null} />}
      <Result title="Last Action Result" result={result} error={apiError} />
      {user ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>Welcome, {user.name}!</Text>
            <Result title="User Profile" result={user} error={null} />
            <Button
              onPress={() => runDemo(getCredentials)}
              title="Get Credentials"
            />
            <Button onPress={clearSession} title="Log Out" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Custom Token Exchange (RFC 8693)
            </Text>
            <LabeledInput
              label="Subject Token"
              value={subjectToken}
              onChangeText={setSubjectToken}
              placeholder="External IdP token to exchange"
              autoCapitalize="none"
            />
            <LabeledInput
              label="Subject Token Type"
              value={subjectTokenType}
              onChangeText={setSubjectTokenType}
              autoCapitalize="none"
            />
            <Button
              onPress={() =>
                runDemo(() =>
                  customTokenExchange({ subjectToken, subjectTokenType })
                )
              }
              title="customTokenExchange()"
              disabled={!subjectToken || !subjectTokenType}
            />

            <Text style={styles.hint}>Delegation & Impersonation</Text>
            <LabeledInput
              label="Actor Token"
              value={actorToken}
              onChangeText={setActorToken}
              placeholder="Acting-party token"
              autoCapitalize="none"
            />
            <Button
              onPress={fillActorTokenFromSession}
              title="Use my ID token as actor"
            />
            <LabeledInput
              label="Actor Token Type"
              value={actorTokenType}
              onChangeText={setActorTokenType}
              autoCapitalize="none"
            />
            <Button
              onPress={() =>
                runDemo(() =>
                  customTokenExchange({
                    subjectToken,
                    subjectTokenType,
                    actorToken,
                    actorTokenType,
                  })
                )
              }
              title="customTokenExchange() with actor"
              disabled={
                !subjectToken ||
                !subjectTokenType ||
                !actorToken ||
                !actorTokenType
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Account API</Text>
            <Text style={styles.hint}>
              Uses MRRT to mint a `/me/` access token via getApiCredentials.
            </Text>
            <Result
              title="My Account Result"
              result={maResult}
              error={maError}
            />

            <Text style={styles.subheading}>Access Token (MRRT)</Text>
            <Text style={styles.hint}>
              Fetch the `/me/` token before calling any My Account API below.
            </Text>
            <Button
              onPress={onGetMyAccountToken}
              title={
                maToken ? 'Refresh My Account Token' : 'Get My Account Token'
              }
              loading={maLoading}
            />
            {maToken && (
              <Text style={styles.hint}>Token ready — API calls enabled.</Text>
            )}

            <Text style={styles.subheading}>Query</Text>
            <View style={styles.buttonGroup}>
              <Button
                onPress={onGetFactors}
                title="Get Factors"
                loading={maLoading}
                disabled={!maToken}
              />
              <Button
                onPress={onGetAuthenticationMethods}
                title="Get Authentication Methods"
                loading={maLoading}
                disabled={!maToken}
              />
            </View>

            <Text style={styles.subheading}>Passkey Enrollment</Text>
            <View style={styles.buttonGroup}>
              <Button
                onPress={onPasskeyChallenge}
                title="1. Passkey Challenge"
                loading={maLoading}
                disabled={!maToken}
              />
              <Button
                onPress={onPasskeyVerify}
                title="2. Create & Verify Passkey"
                loading={maLoading}
                disabled={!maToken || !passkeyChallenge}
              />
            </View>

            <Text style={styles.subheading}>Phone Enrollment</Text>
            <LabeledInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1234567890"
              keyboardType="phone-pad"
            />
            <Button
              onPress={onEnrollPhone}
              title="Enroll Phone"
              loading={maLoading}
              disabled={!maToken}
            />

            <Text style={styles.subheading}>Email Enrollment</Text>
            <LabeledInput
              label="Email Address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="user@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button
              onPress={onEnrollEmail}
              title="Enroll Email"
              loading={maLoading}
              disabled={!maToken}
            />

            <Text style={styles.subheading}>TOTP / Recovery Code</Text>
            <View style={styles.buttonGroup}>
              <Button
                onPress={onEnrollTOTP}
                title="Enroll TOTP"
                loading={maLoading}
                disabled={!maToken}
              />
              <Button
                onPress={onEnrollRecoveryCode}
                title="Enroll Recovery Code"
                loading={maLoading}
                disabled={!maToken}
              />
            </View>

            <Text style={styles.subheading}>Confirm Enrollment</Text>
            <Text style={styles.hint}>
              After enrolling phone/email/TOTP enter the OTP; recovery-code
              enrollments confirm without an OTP.
            </Text>
            <LabeledInput
              label="OTP Code"
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="Enter OTP code"
              keyboardType="number-pad"
            />
            <Button
              onPress={onConfirmEnrollment}
              title="Confirm Enrollment"
              loading={maLoading}
              disabled={!maToken || !enrollmentState}
            />
            {enrollmentState && (
              <Text style={styles.hint}>
                Pending: {enrollmentState.kind} enrollment (id{' '}
                {enrollmentState.id})
              </Text>
            )}

            <Text style={styles.subheading}>Update / Delete Method</Text>
            <LabeledInput
              label="Authentication Method ID"
              value={methodId}
              onChangeText={setMethodId}
              placeholder="auth method id"
              autoCapitalize="none"
            />
            <LabeledInput
              label="New Name (for update)"
              value={methodName}
              onChangeText={setMethodName}
              placeholder="Optional new name"
            />
            <View style={styles.buttonGroup}>
              <Button
                onPress={onUpdateMethod}
                title="Update Method"
                loading={maLoading}
                disabled={!maToken}
              />
              <Button
                onPress={onDeleteMethod}
                title="Delete Method"
                loading={maLoading}
                disabled={!maToken}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          <Section title="Web Auth (Recommended Flow)">
            <Button
              onPress={() =>
                authorize({
                  // Request the My Account audience + scopes up front so the
                  // refresh token carries them; getApiCredentials then resolves
                  // from the refresh grant without an interactive step.
                  audience: MY_ACCOUNT_AUDIENCE,
                  scope: `openid profile email offline_access ${MY_ACCOUNT_SCOPE}`,
                })
              }
              title="Log In"
            />
          </Section>
          <Section title="Database Login">
            <LabeledInput
              label="Username or Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <LabeledInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button
              onPress={() =>
                runDemo(async () => {
                  try {
                    return await loginWithPasswordRealm({
                      username: email,
                      password: password,
                      realm: 'Username-Password-Authentication',
                    });
                  } catch (e: any) {
                    if (e?.json?.mfa_token) {
                      setMfaToken(e.json.mfa_token);
                    }
                    throw e;
                  }
                })
              }
              title="Log In with Password"
            />
            <Text style={styles.hint}>
              If MFA is enabled, a failed login will return an mfa_token that
              auto-populates below.
            </Text>
            <Button
              onPress={() =>
                runDemo(() =>
                  createUser({
                    email,
                    password,
                    connection: 'Username-Password-Authentication',
                  })
                )
              }
              title="Create User"
            />
            <Button
              onPress={() =>
                runDemo(() =>
                  resetPassword({
                    email,
                    connection: 'Username-Password-Authentication',
                  })
                )
              }
              title="Reset Password"
            />
          </Section>
          <Section title="MFA Flexible Factors Grant">
            {mfaStep === 'idle' && (
              <>
                <Text style={styles.hint}>
                  Get an mfa_token from a password login with MFA enabled.
                </Text>
                <LabeledInput
                  label="MFA Token"
                  value={mfaToken}
                  onChangeText={setMfaToken}
                  placeholder="Paste mfa_token here"
                />
                <Button
                  onPress={onMfaStart}
                  title="Start MFA"
                  disabled={!mfaToken || mfaLoading}
                />
              </>
            )}
            {mfaStep === 'list' && (
              <>
                <Text style={styles.sectionTitle}>
                  Step 1: Select Authenticator
                </Text>
                {authenticators.length > 0 ? (
                  authenticators.map((auth) => (
                    <TouchableOpacity
                      key={auth.id}
                      style={webStyles.authItem}
                      onPress={() => onMfaSelectAuthenticator(auth)}
                    >
                      <Text style={webStyles.authItemTitle}>
                        {auth.type ?? auth.authenticatorType}
                        {auth.oobChannel ? ` (${auth.oobChannel})` : ''}
                      </Text>
                      <Text style={webStyles.authItemSub}>
                        {auth.id} · authenticatorType: {auth.authenticatorType}
                        {auth.active ? '' : ' · inactive'}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.hint}>No authenticators enrolled.</Text>
                )}
                <Button
                  onPress={() => setMfaStep('enroll-select')}
                  title="Enroll New Authenticator"
                />
                <Button onPress={resetMfaWizard} title="Back" />
              </>
            )}
            {mfaStep === 'enroll-select' && (
              <>
                <Text style={styles.sectionTitle}>
                  Step 2: Choose Factor Type
                </Text>
                <Button
                  onPress={() => onMfaSelectEnrollType(MfaFactorType.OTP)}
                  title="TOTP (Authenticator App)"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType(MfaFactorType.SMS)}
                  title="SMS"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType(MfaFactorType.VOICE)}
                  title="Voice"
                  disabled={mfaLoading}
                />
                <Text style={styles.hint}>
                  Voice is a distinct channel on web. On native it falls back to
                  SMS on the same number.
                </Text>
                <Button
                  onPress={() => onMfaSelectEnrollType(MfaFactorType.EMAIL)}
                  title="Email"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType(MfaFactorType.PUSH)}
                  title="Push Notification"
                  disabled={mfaLoading}
                />
                <Button onPress={() => setMfaStep('list')} title="Back" />
              </>
            )}
            {mfaStep === 'enroll-details' && (
              <>
                <Text style={styles.sectionTitle}>Step 2: Enter Details</Text>
                {(enrollType === MfaFactorType.SMS ||
                  enrollType === MfaFactorType.VOICE) && (
                  <>
                    <LabeledInput
                      label="Phone Number"
                      value={enrollPhoneNumber}
                      onChangeText={setEnrollPhoneNumber}
                      placeholder="+12025550135"
                    />
                    <Button
                      onPress={() => onMfaEnroll()}
                      title={
                        enrollType === MfaFactorType.VOICE
                          ? 'Enroll Voice'
                          : 'Enroll SMS'
                      }
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
                    />
                    <Button
                      onPress={() => onMfaEnroll()}
                      title="Enroll Email"
                      disabled={!enrollEmail || mfaLoading}
                    />
                  </>
                )}
                <Button
                  onPress={() => setMfaStep('enroll-select')}
                  title="Back"
                />
              </>
            )}
            {mfaStep === 'verify' && (
              <>
                <Text style={styles.sectionTitle}>Step 3: Verify</Text>
                {enrollmentChallenge?.type === 'totp' && (
                  <View style={webStyles.infoBox}>
                    {enrollmentChallenge.barcodeUri && (
                      <>
                        <View style={webStyles.qrContainer}>
                          <Image
                            source={{
                              uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollmentChallenge.barcodeUri)}`,
                            }}
                            style={webStyles.qrImage}
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
                    <Text>Secret: {enrollmentChallenge.secret}</Text>
                  </View>
                )}
                {enrollmentChallenge?.type === 'push' && (
                  <View style={webStyles.infoBox}>
                    <Text style={styles.hint}>
                      Scan this QR with the Auth0 Guardian app to pair, then
                      approve the push notification on your device.
                    </Text>
                    {enrollmentChallenge.barcodeUri ? (
                      <View style={webStyles.qrContainer}>
                        <Image
                          source={{
                            uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollmentChallenge.barcodeUri)}`,
                          }}
                          style={webStyles.qrImage}
                        />
                      </View>
                    ) : null}
                    <Button
                      onPress={onMfaVerify}
                      title="I've approved the push"
                      disabled={mfaLoading}
                    />
                  </View>
                )}
                {enrollmentChallenge?.type === 'recovery-code' ? (
                  <View style={webStyles.infoBox}>
                    <Text style={styles.hint}>
                      Save this recovery code — it is shown only once. Enter it
                      below to complete verification.
                    </Text>
                    <Text selectable>
                      Recovery Code: {enrollmentChallenge.recoveryCode}
                    </Text>
                    <LabeledInput
                      label="Confirm Recovery Code"
                      value={verifyCode}
                      onChangeText={setVerifyCode}
                      placeholder="Re-enter the recovery code"
                    />
                    <Button
                      onPress={onMfaVerify}
                      title="Verify"
                      disabled={!verifyCode || mfaLoading}
                    />
                  </View>
                ) : challengeResult?.challengeType === 'oob' ||
                  enrollmentChallenge?.type === 'oob' ? (
                  <>
                    <Text style={styles.hint}>
                      A code has been sent. Enter the binding code below.
                    </Text>
                    <LabeledInput
                      label="Binding Code"
                      value={verifyBindingCode}
                      onChangeText={setVerifyBindingCode}
                      placeholder="Code from SMS/email"
                    />
                    <Button
                      onPress={onMfaVerify}
                      title="Verify"
                      disabled={!verifyBindingCode || mfaLoading}
                    />
                  </>
                ) : (
                  <>
                    <LabeledInput
                      label="OTP Code"
                      value={verifyCode}
                      onChangeText={setVerifyCode}
                      placeholder="6-digit code"
                    />
                    <Button
                      onPress={onMfaVerify}
                      title="Verify"
                      disabled={!verifyCode || mfaLoading}
                    />
                  </>
                )}
                <Text style={styles.hint}>
                  Optional: request a scope/audience to mint an API access token
                  on successful verification.
                </Text>
                <LabeledInput
                  label="Scope (optional)"
                  value={verifyScope}
                  onChangeText={setVerifyScope}
                  placeholder="openid profile email"
                />
                <LabeledInput
                  label="Audience (optional)"
                  value={verifyAudience}
                  onChangeText={setVerifyAudience}
                  placeholder={`https://${config.domain}/api/v2/`}
                />
                <Button onPress={() => setMfaStep('list')} title="Back" />
              </>
            )}
            {mfaStep === 'complete' && (
              <>
                <Text style={webStyles.successText}>
                  Authentication successful!
                </Text>
                {result && (
                  <Result title="Credentials" error={null} result={result} />
                )}
                <Button onPress={resetMfaWizard} title="Done" />
              </>
            )}
          </Section>
          <Section title="Passkeys">
            <Text style={styles.hint}>
              Uses the browser's built-in WebAuthn API (navigator.credentials)
              via @auth0/auth0-spa-js.
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
              disabled={!passkeyEmail || passkeyLoading}
            />
            <Button
              onPress={onPasskeyLogin}
              title="Sign In with Passkey"
              disabled={passkeyLoading}
            />
          </Section>
        </>
      )}
    </View>
  );
};

const HooksApp = () => (
  <Auth0Provider
    domain={config.domain}
    clientId={config.clientId}
    useMrrt={true}
    // Persist tokens across reloads (memory cache is lost on refresh) and
    // guarantee the refresh-token grant so getApiCredentials never falls back
    // to the silent /authorize iframe (which stalls behind 3rd-party cookies).
    cacheLocation="localstorage"
    useRefreshTokens={true}
  >
    <HooksAuthContent />
  </Auth0Provider>
);

// ========================================================================
// --- 2. CLASS-BASED IMPLEMENTATION ---
// ========================================================================

interface ClassAppState {
  auth0: Auth0;
  user: User | null;
  result: any;
  apiError: Error | null;
  isLoading: boolean;
  email: string;
  password: string;
  mfaToken: string;
  mfaStep: MfaStep;
  mfaLoading: boolean;
  authenticators: MfaAuthenticator[];
  enrollType: EnrollType | null;
  enrollPhoneNumber: string;
  enrollEmail: string;
  enrollmentChallenge: MfaEnrollmentChallenge | null;
  challengeResult: MfaChallengeResult | null;
  verifyCode: string;
  verifyBindingCode: string;
  verifyScope: string;
  verifyAudience: string;
}

class ClassApp extends React.Component<{}, ClassAppState> {
  state: ClassAppState = {
    auth0: new Auth0({
      domain: config.domain,
      clientId: config.clientId,
      useMrrt: true,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    }),
    user: null,
    result: null,
    apiError: null,
    isLoading: true,
    email: '',
    password: '',
    mfaToken: '',
    mfaStep: 'idle',
    mfaLoading: false,
    authenticators: [],
    enrollType: null,
    enrollPhoneNumber: '',
    enrollEmail: '',
    enrollmentChallenge: null,
    challengeResult: null,
    verifyCode: '',
    verifyBindingCode: '',
    verifyScope: '',
    verifyAudience: '',
  };

  componentDidMount() {
    this.handleAuthentication();
  }

  handleAuthentication = async () => {
    const hasRedirectParams =
      typeof window !== 'undefined' &&
      (window.location.search.includes('code=') ||
        window.location.search.includes('error=')) &&
      window.location.search.includes('state=');
    if (hasRedirectParams) {
      try {
        await this.state.auth0.webAuth.handleRedirectCallback();
      } catch (e) {
        this.setState({ apiError: e as Error, isLoading: false });
      } finally {
        if (typeof window !== 'undefined') {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    }

    try {
      const credentials =
        await this.state.auth0.credentialsManager.getCredentials();
      const user = await this.state.auth0.auth.userInfo({
        token: credentials.accessToken,
      });
      this.setState({ user, result: credentials, isLoading: false });
    } catch {
      this.setState({ user: null, isLoading: false });
    }
  };

  runDemo = async (action: () => Promise<any>) => {
    this.setState({ result: null, apiError: null });
    try {
      const response = await action();
      this.setState({ result: response ?? { success: true } });
    } catch (e) {
      this.setState({ apiError: e as Error });
    }
  };

  onLogin = async () => {
    await this.state.auth0.webAuth.authorize({
      audience: MY_ACCOUNT_AUDIENCE,
      scope: `openid profile email offline_access ${MY_ACCOUNT_SCOPE}`,
    });
  };

  onLogout = async () => {
    try {
      await this.state.auth0.webAuth.clearSession();
      this.setState({ user: null, result: null, apiError: null });
    } catch (e) {
      this.setState({ apiError: e as Error });
    }
  };

  resetMfaWizard = () => {
    this.setState({
      mfaStep: 'idle',
      authenticators: [],
      enrollType: null,
      enrollPhoneNumber: '',
      enrollEmail: '',
      enrollmentChallenge: null,
      challengeResult: null,
      verifyCode: '',
      verifyBindingCode: '',
      verifyScope: '',
      verifyAudience: '',
      mfaLoading: false,
    });
  };

  onMfaStart = async () => {
    this.setState({ mfaLoading: true, apiError: null });
    try {
      const list = await this.state.auth0.mfa.getAuthenticators({
        mfaToken: this.state.mfaToken,
        factorsAllowed: [
          MfaFactorType.OTP,
          MfaFactorType.SMS,
          MfaFactorType.VOICE,
          MfaFactorType.EMAIL,
          MfaFactorType.PUSH,
        ],
      });
      this.setState({ authenticators: list, mfaStep: 'list' });
    } catch (e) {
      this.setState({ apiError: e as Error });
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onMfaChallenge = async (auth: MfaAuthenticator) => {
    this.setState({ mfaLoading: true });
    try {
      const res = await this.state.auth0.mfa.challenge({
        mfaToken: this.state.mfaToken,
        authenticatorId: auth.id,
      });
      this.setState({ challengeResult: res, mfaStep: 'verify' });
    } catch (e) {
      this.setState({ apiError: e as Error, mfaStep: 'list' });
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onMfaEnroll = async (type?: EnrollType) => {
    const factor = type || this.state.enrollType;
    if (!factor) return;
    this.setState({ mfaLoading: true });
    try {
      let challenge: MfaEnrollmentChallenge;
      const {
        mfaToken,
        enrollPhoneNumber: phone,
        enrollEmail: em,
      } = this.state;
      if (factor === MfaFactorType.SMS) {
        challenge = await this.state.auth0.mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.SMS,
          phoneNumber: phone,
        });
      } else if (factor === MfaFactorType.VOICE) {
        challenge = await this.state.auth0.mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.VOICE,
          phoneNumber: phone,
        });
      } else if (factor === MfaFactorType.EMAIL) {
        challenge = await this.state.auth0.mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.EMAIL,
          email: em,
        });
      } else {
        challenge = await this.state.auth0.mfa.enroll({
          mfaToken,
          factorType: factor,
        });
      }
      this.setState({ enrollmentChallenge: challenge, mfaStep: 'verify' });
    } catch (e) {
      this.setState({ apiError: e as Error });
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onMfaVerify = async () => {
    this.setState({ mfaLoading: true });
    try {
      const {
        mfaToken,
        challengeResult,
        enrollmentChallenge,
        verifyCode,
        verifyBindingCode,
        verifyScope,
        verifyAudience,
      } = this.state;
      let credentials;
      // scope/audience are optional: supply them to mint an access token for a
      // specific API once MFA succeeds.
      const extra = {
        scope: verifyScope || undefined,
        audience: verifyAudience || undefined,
      };
      const oobCode =
        challengeResult?.oobCode ||
        (enrollmentChallenge?.type === 'oob' ||
        enrollmentChallenge?.type === 'push'
          ? enrollmentChallenge.oobCode
          : undefined);
      if (oobCode) {
        credentials = await this.state.auth0.mfa.verify({
          mfaToken,
          oobCode,
          bindingCode: verifyBindingCode || undefined,
          ...extra,
        });
      } else if (enrollmentChallenge?.type === 'recovery-code') {
        credentials = await this.state.auth0.mfa.verify({
          mfaToken,
          recoveryCode: verifyCode,
          ...extra,
        });
      } else {
        credentials = await this.state.auth0.mfa.verify({
          mfaToken,
          otp: verifyCode,
          ...extra,
        });
      }
      this.setState({
        result: {
          success: true,
          accessToken: credentials.accessToken.substring(0, 20) + '...',
        },
        mfaStep: 'complete',
      });
    } catch (e) {
      this.setState({ apiError: e as Error });
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onGetMyAccountFactors = async () => {
    const credentials =
      await this.state.auth0.credentialsManager.getApiCredentials(
        MY_ACCOUNT_AUDIENCE,
        MY_ACCOUNT_SCOPE
      );
    return this.state.auth0.myAccount.getFactors({
      accessToken: credentials.accessToken,
    });
  };

  render() {
    const {
      user,
      result,
      apiError,
      isLoading,
      email,
      password,
      mfaToken,
      mfaStep,
      mfaLoading,
      authenticators,
      enrollType,
      enrollPhoneNumber,
      enrollEmail,
      enrollmentChallenge,
      challengeResult,
      verifyCode,
      verifyBindingCode,
      verifyScope,
      verifyAudience,
    } = this.state;
    if (isLoading) {
      return (
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Header title="React Native Auth0 (Class)" />
        <Result title="Last Action Result" result={result} error={apiError} />
        {user ? (
          <View style={styles.section}>
            <Text style={styles.title}>Welcome, {user.name}!</Text>
            <Result title="User Profile" result={user} error={null} />
            <Button
              onPress={() =>
                this.runDemo(() =>
                  this.state.auth0.credentialsManager.getCredentials()
                )
              }
              title="Get Credentials"
            />
            <Button
              onPress={() => this.runDemo(this.onGetMyAccountFactors)}
              title="My Account: Get Factors (MRRT)"
            />
            <Button onPress={this.onLogout} title="Log Out" />
          </View>
        ) : (
          <>
            <Section title="Web Auth (Recommended Flow)">
              <Button onPress={this.onLogin} title="Log In" />
            </Section>
            <Section title="Database Login">
              <LabeledInput
                label="Username or Email"
                value={email}
                onChangeText={(val) => this.setState({ email: val })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <LabeledInput
                label="Password"
                value={password}
                onChangeText={(val) => this.setState({ password: val })}
                secureTextEntry
              />
              <Button
                onPress={() =>
                  this.runDemo(async () => {
                    try {
                      return await this.state.auth0.auth.passwordRealm({
                        username: email,
                        password,
                        realm: 'Username-Password-Authentication',
                      });
                    } catch (e: any) {
                      if (e?.json?.mfa_token) {
                        this.setState({ mfaToken: e.json.mfa_token });
                      }
                      throw e;
                    }
                  })
                }
                title="Log In with Password"
              />
              <Text style={styles.hint}>
                If MFA is enabled, a failed login will return an mfa_token that
                auto-populates below.
              </Text>
              <Button
                onPress={() =>
                  this.runDemo(() =>
                    this.state.auth0.auth.createUser({
                      email,
                      password,
                      connection: 'Username-Password-Authentication',
                    })
                  )
                }
                title="Create User"
              />
              <Button
                onPress={() =>
                  this.runDemo(() =>
                    this.state.auth0.auth.resetPassword({
                      email,
                      connection: 'Username-Password-Authentication',
                    })
                  )
                }
                title="Reset Password"
              />
            </Section>
            <Section title="MFA Flexible Factors Grant">
              {mfaStep === 'idle' && (
                <>
                  <Text style={styles.hint}>
                    Get an mfa_token from a password login with MFA enabled.
                  </Text>
                  <LabeledInput
                    label="MFA Token"
                    value={mfaToken}
                    onChangeText={(val: string) =>
                      this.setState({ mfaToken: val })
                    }
                    placeholder="Paste mfa_token here"
                  />
                  <Button
                    onPress={this.onMfaStart}
                    title="Start MFA"
                    disabled={!mfaToken || mfaLoading}
                  />
                </>
              )}
              {mfaStep === 'list' && (
                <>
                  <Text style={styles.sectionTitle}>
                    Step 1: Select Authenticator
                  </Text>
                  {authenticators.length > 0 ? (
                    authenticators.map((auth) => (
                      <TouchableOpacity
                        key={auth.id}
                        style={webStyles.authItem}
                        onPress={() => this.onMfaChallenge(auth)}
                      >
                        <Text style={webStyles.authItemTitle}>
                          {auth.type ?? auth.authenticatorType}
                          {auth.oobChannel ? ` (${auth.oobChannel})` : ''}
                        </Text>
                        <Text style={webStyles.authItemSub}>
                          {auth.id} · authenticatorType:{' '}
                          {auth.authenticatorType}
                          {auth.active ? '' : ' · inactive'}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.hint}>No authenticators enrolled.</Text>
                  )}
                  <Button
                    onPress={() => this.setState({ mfaStep: 'enroll-select' })}
                    title="Enroll New Authenticator"
                  />
                  <Button onPress={this.resetMfaWizard} title="Back" />
                </>
              )}
              {mfaStep === 'enroll-select' && (
                <>
                  <Text style={styles.sectionTitle}>
                    Step 2: Choose Factor Type
                  </Text>
                  <Button
                    onPress={() => {
                      this.setState({ enrollType: MfaFactorType.OTP });
                      this.onMfaEnroll(MfaFactorType.OTP);
                    }}
                    title="TOTP (Authenticator App)"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() =>
                      this.setState({
                        enrollType: MfaFactorType.SMS,
                        mfaStep: 'enroll-details',
                      })
                    }
                    title="SMS"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() =>
                      this.setState({
                        enrollType: MfaFactorType.VOICE,
                        mfaStep: 'enroll-details',
                      })
                    }
                    title="Voice"
                    disabled={mfaLoading}
                  />
                  <Text style={styles.hint}>
                    Voice is a distinct channel on web. On native it falls back
                    to SMS on the same number.
                  </Text>
                  <Button
                    onPress={() =>
                      this.setState({
                        enrollType: MfaFactorType.EMAIL,
                        mfaStep: 'enroll-details',
                      })
                    }
                    title="Email"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() => {
                      this.setState({ enrollType: MfaFactorType.PUSH });
                      this.onMfaEnroll(MfaFactorType.PUSH);
                    }}
                    title="Push Notification"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() => this.setState({ mfaStep: 'list' })}
                    title="Back"
                  />
                </>
              )}
              {mfaStep === 'enroll-details' && (
                <>
                  <Text style={styles.sectionTitle}>Step 2: Enter Details</Text>
                  {(enrollType === MfaFactorType.SMS ||
                    enrollType === MfaFactorType.VOICE) && (
                    <>
                      <LabeledInput
                        label="Phone Number"
                        value={enrollPhoneNumber}
                        onChangeText={(val: string) =>
                          this.setState({ enrollPhoneNumber: val })
                        }
                        placeholder="+12025550135"
                      />
                      <Button
                        onPress={() => this.onMfaEnroll()}
                        title={
                          enrollType === MfaFactorType.VOICE
                            ? 'Enroll Voice'
                            : 'Enroll SMS'
                        }
                        disabled={!enrollPhoneNumber || mfaLoading}
                      />
                    </>
                  )}
                  {enrollType === MfaFactorType.EMAIL && (
                    <>
                      <LabeledInput
                        label="Email"
                        value={enrollEmail}
                        onChangeText={(val: string) =>
                          this.setState({ enrollEmail: val })
                        }
                        placeholder="user@example.com"
                      />
                      <Button
                        onPress={() => this.onMfaEnroll()}
                        title="Enroll Email"
                        disabled={!enrollEmail || mfaLoading}
                      />
                    </>
                  )}
                  <Button
                    onPress={() => this.setState({ mfaStep: 'enroll-select' })}
                    title="Back"
                  />
                </>
              )}
              {mfaStep === 'verify' && (
                <>
                  <Text style={styles.sectionTitle}>Step 3: Verify</Text>
                  {enrollmentChallenge?.type === 'totp' && (
                    <View style={webStyles.infoBox}>
                      {enrollmentChallenge.barcodeUri && (
                        <>
                          <View style={webStyles.qrContainer}>
                            <Image
                              source={{
                                uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollmentChallenge.barcodeUri)}`,
                              }}
                              style={webStyles.qrImage}
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
                      <Text>Secret: {enrollmentChallenge.secret}</Text>
                    </View>
                  )}
                  {enrollmentChallenge?.type === 'push' && (
                    <View style={webStyles.infoBox}>
                      <Text style={styles.hint}>
                        Scan this QR with the Auth0 Guardian app to pair, then
                        approve the push notification on your device.
                      </Text>
                      {enrollmentChallenge.barcodeUri ? (
                        <View style={webStyles.qrContainer}>
                          <Image
                            source={{
                              uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(enrollmentChallenge.barcodeUri)}`,
                            }}
                            style={webStyles.qrImage}
                          />
                        </View>
                      ) : null}
                      <Button
                        onPress={this.onMfaVerify}
                        title="I've approved the push"
                        disabled={mfaLoading}
                      />
                    </View>
                  )}
                  {enrollmentChallenge?.type === 'recovery-code' ? (
                    <View style={webStyles.infoBox}>
                      <Text style={styles.hint}>
                        Save this recovery code — it is shown only once. Enter
                        it below to complete verification.
                      </Text>
                      <Text selectable>
                        Recovery Code: {enrollmentChallenge.recoveryCode}
                      </Text>
                      <LabeledInput
                        label="Confirm Recovery Code"
                        value={verifyCode}
                        onChangeText={(val: string) =>
                          this.setState({ verifyCode: val })
                        }
                        placeholder="Re-enter the recovery code"
                      />
                      <Button
                        onPress={this.onMfaVerify}
                        title="Verify"
                        disabled={!verifyCode || mfaLoading}
                      />
                    </View>
                  ) : challengeResult?.challengeType === 'oob' ||
                    enrollmentChallenge?.type === 'oob' ? (
                    <>
                      <Text style={styles.hint}>
                        A code has been sent. Enter the binding code below.
                      </Text>
                      <LabeledInput
                        label="Binding Code"
                        value={verifyBindingCode}
                        onChangeText={(val: string) =>
                          this.setState({ verifyBindingCode: val })
                        }
                        placeholder="Code from SMS/email"
                      />
                      <Button
                        onPress={this.onMfaVerify}
                        title="Verify"
                        disabled={!verifyBindingCode || mfaLoading}
                      />
                    </>
                  ) : (
                    <>
                      <LabeledInput
                        label="OTP Code"
                        value={verifyCode}
                        onChangeText={(val: string) =>
                          this.setState({ verifyCode: val })
                        }
                        placeholder="6-digit code"
                      />
                      <Button
                        onPress={this.onMfaVerify}
                        title="Verify"
                        disabled={!verifyCode || mfaLoading}
                      />
                    </>
                  )}
                  <Text style={styles.hint}>
                    Optional: request a scope/audience to mint an API access
                    token on successful verification.
                  </Text>
                  <LabeledInput
                    label="Scope (optional)"
                    value={verifyScope}
                    onChangeText={(val: string) =>
                      this.setState({ verifyScope: val })
                    }
                    placeholder="openid profile email"
                  />
                  <LabeledInput
                    label="Audience (optional)"
                    value={verifyAudience}
                    onChangeText={(val: string) =>
                      this.setState({ verifyAudience: val })
                    }
                    placeholder={`https://${config.domain}/api/v2/`}
                  />
                  <Button
                    onPress={() => this.setState({ mfaStep: 'list' })}
                    title="Back"
                  />
                </>
              )}
              {mfaStep === 'complete' && (
                <>
                  <Text style={webStyles.successText}>
                    Authentication successful!
                  </Text>
                  {result && (
                    <Result title="Credentials" error={null} result={result} />
                  )}
                  <Button onPress={this.resetMfaWizard} title="Done" />
                </>
              )}
            </Section>
          </>
        )}
      </View>
    );
  }
}

// ========================================================================
// --- 3. MAIN APP COMPONENT WITH TOGGLE ---
// ========================================================================

const App = (): React.JSX.Element => {
  const [showHooksDemo, setShowHooksDemo] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {showHooksDemo ? <HooksApp /> : <ClassApp />}

        <View style={styles.toggleContainer}>
          <Button
            onPress={() => setShowHooksDemo(!showHooksDemo)}
            title={`Switch to ${showHooksDemo ? 'Class-Based' : 'Hooks'} Demo`}
            style={styles.toggleButton}
          />
        </View>
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  buttonGroup: { gap: 10 },
  hint: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 8 },
  toggleContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fafafa',
  },
  toggleButton: { backgroundColor: '#6c757d' },
});

const webStyles = StyleSheet.create({
  authItem: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#F9F9F9',
    marginBottom: 8,
  },
  authItemTitle: { fontSize: 14, fontWeight: '600' },
  authItemSub: { fontSize: 11, color: '#666', marginTop: 2 },
  infoBox: {
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
  },
  qrContainer: { alignItems: 'center', marginVertical: 12 },
  qrImage: { width: 200, height: 200 },
});

export default App;
