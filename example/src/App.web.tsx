import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Auth0, {
  Auth0Provider,
  useAuth0,
  User,
  MfaError,
  MfaErrorCodes,
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

type MfaStep =
  | 'idle'
  | 'list'
  | 'enroll-select'
  | 'enroll-details'
  | 'verify'
  | 'complete';

type EnrollType = 'otp' | 'phone' | 'email' | 'push';

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
    createUser,
    resetPassword,
    loginWithPasswordRealm,
    mfa,
    users,
  } = useAuth0();

  const [result, setResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const onMfaStart = async () => {
    setMfaLoading(true);
    setApiError(null);
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
    if (type === 'otp' || type === 'push') {
      onMfaEnroll(type);
    } else {
      setMfaStep('enroll-details');
    }
  };

  const onMfaEnroll = async (type?: EnrollType) => {
    const factorType = type || enrollType;
    if (!factorType) return;
    setMfaLoading(true);
    try {
      let challenge: MfaEnrollmentChallenge;
      if (factorType === 'phone') {
        challenge = await mfa.enroll({
          mfaToken,
          phoneNumber: enrollPhoneNumber,
        });
      } else if (factorType === 'email') {
        challenge = await mfa.enroll({ mfaToken, email: enrollEmail });
      } else {
        challenge = await mfa.enroll({ mfaToken, type: factorType });
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
        <View style={styles.section}>
          <Text style={styles.title}>Welcome, {user.name}!</Text>
          <Result title="User Profile" result={user} error={null} />
          <Button
            onPress={() => runDemo(getCredentials)}
            title="Get Credentials"
          />
          <Button
            onPress={() =>
              runDemo(() =>
                users(result?.accessToken).getUser({ id: user.sub })
              )
            }
            title="Get Full Profile (Mgmt API)"
            disabled={!result?.accessToken}
          />
          <Button onPress={clearSession} title="Log Out" />
        </View>
      ) : (
        <>
          <Section title="Web Auth (Recommended Flow)">
            <Button
              onPress={() =>
                authorize({ scope: 'openid profile email offline_access' })
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
                        {auth.authenticatorType}
                        {auth.oobChannel ? ` (${auth.oobChannel})` : ''}
                      </Text>
                      <Text style={webStyles.authItemSub}>{auth.id}</Text>
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
                  onPress={() => onMfaSelectEnrollType('otp')}
                  title="TOTP (Authenticator App)"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType('phone')}
                  title="SMS"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType('email')}
                  title="Email"
                  disabled={mfaLoading}
                />
                <Button
                  onPress={() => onMfaSelectEnrollType('push')}
                  title="Push Notification"
                  disabled={mfaLoading}
                />
                <Button onPress={() => setMfaStep('list')} title="Back" />
              </>
            )}
            {mfaStep === 'enroll-details' && (
              <>
                <Text style={styles.sectionTitle}>Step 2: Enter Details</Text>
                {enrollType === 'phone' && (
                  <>
                    <LabeledInput
                      label="Phone Number"
                      value={enrollPhoneNumber}
                      onChangeText={setEnrollPhoneNumber}
                      placeholder="+12025550135"
                    />
                    <Button
                      onPress={() => onMfaEnroll()}
                      title="Enroll SMS"
                      disabled={!enrollPhoneNumber || mfaLoading}
                    />
                  </>
                )}
                {enrollType === 'email' && (
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
                    <Text>Secret: {enrollmentChallenge.secret}</Text>
                  </View>
                )}
                {challengeResult?.challengeType === 'oob' ||
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
        </>
      )}
    </View>
  );
};

const HooksApp = () => (
  <Auth0Provider domain={config.domain} clientId={config.clientId}>
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
}

class ClassApp extends React.Component<{}, ClassAppState> {
  state: ClassAppState = {
    auth0: new Auth0({ domain: config.domain, clientId: config.clientId }),
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
      scope: 'openid profile email offline_access',
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
      mfaLoading: false,
    });
  };

  onMfaStart = async () => {
    this.setState({ mfaLoading: true, apiError: null });
    try {
      const list = await this.state.auth0
        .mfa()
        .getAuthenticators({ mfaToken: this.state.mfaToken });
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
      const res = await this.state.auth0
        .mfa()
        .challenge({ mfaToken: this.state.mfaToken, authenticatorId: auth.id });
      this.setState({ challengeResult: res, mfaStep: 'verify' });
    } catch (e) {
      this.setState({ apiError: e as Error, mfaStep: 'list' });
    } finally {
      this.setState({ mfaLoading: false });
    }
  };

  onMfaEnroll = async (type?: EnrollType) => {
    const factorType = type || this.state.enrollType;
    if (!factorType) return;
    this.setState({ mfaLoading: true });
    try {
      let challenge: MfaEnrollmentChallenge;
      const {
        mfaToken,
        enrollPhoneNumber: phone,
        enrollEmail: em,
      } = this.state;
      if (factorType === 'phone') {
        challenge = await this.state.auth0
          .mfa()
          .enroll({ mfaToken, phoneNumber: phone });
      } else if (factorType === 'email') {
        challenge = await this.state.auth0
          .mfa()
          .enroll({ mfaToken, email: em });
      } else {
        challenge = await this.state.auth0
          .mfa()
          .enroll({ mfaToken, type: factorType });
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
      } = this.state;
      let credentials;
      const oobCode =
        challengeResult?.oobCode ||
        (enrollmentChallenge?.type === 'oob'
          ? enrollmentChallenge.oobCode
          : undefined);
      if (oobCode) {
        credentials = await this.state.auth0
          .mfa()
          .verify({
            mfaToken,
            oobCode,
            bindingCode: verifyBindingCode || undefined,
          });
      } else {
        credentials = await this.state.auth0
          .mfa()
          .verify({ mfaToken, otp: verifyCode });
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
              onPress={() =>
                this.runDemo(() =>
                  this.state.auth0
                    .users(result?.accessToken)
                    .getUser({ id: user.sub })
                )
              }
              title="Get Full Profile (Mgmt API)"
              disabled={!result?.accessToken}
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
                          {auth.authenticatorType}
                          {auth.oobChannel ? ` (${auth.oobChannel})` : ''}
                        </Text>
                        <Text style={webStyles.authItemSub}>{auth.id}</Text>
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
                      this.setState({ enrollType: 'otp' });
                      this.onMfaEnroll('otp');
                    }}
                    title="TOTP (Authenticator App)"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() =>
                      this.setState({
                        enrollType: 'phone',
                        mfaStep: 'enroll-details',
                      })
                    }
                    title="SMS"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() =>
                      this.setState({
                        enrollType: 'email',
                        mfaStep: 'enroll-details',
                      })
                    }
                    title="Email"
                    disabled={mfaLoading}
                  />
                  <Button
                    onPress={() => {
                      this.setState({ enrollType: 'push' });
                      this.onMfaEnroll('push');
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
                  {enrollType === 'phone' && (
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
                        title="Enroll SMS"
                        disabled={!enrollPhoneNumber || mfaLoading}
                      />
                    </>
                  )}
                  {enrollType === 'email' && (
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
                      <Text>Secret: {enrollmentChallenge.secret}</Text>
                    </View>
                  )}
                  {challengeResult?.challengeType === 'oob' ||
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
});

export default App;
