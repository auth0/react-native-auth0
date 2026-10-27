import React, { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import Auth0, {
  Auth0Provider,
  useAuth0,
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
  DPoPHeadersParameters,
} from 'react-native-auth0';

import config from './auth0-configuration';
import Section from './shared/Section';
import ResultView from './shared/ResultView';
import { createWebPasskey } from './passkey/webPasskey';

const MY_ACCOUNT_AUDIENCE = `https://${config.domain}/me/`;
const MY_ACCOUNT_SCOPE =
  'read:me:authentication_methods delete:me:authentication_methods ' +
  'update:me:authentication_methods read:me:factors create:me:authentication_methods';

type MfaStep =
  'idle' | 'list' | 'enroll-select' | 'enroll-details' | 'verify' | 'complete';

type EnrollType = MfaFactorType;

function makeRun(
  setResult: (r: unknown) => void,
  setError: (e: Error | null) => void
) {
  return async (fn: () => Promise<unknown>) => {
    setResult(null);
    setError(null);
    try {
      const res = await fn();
      setResult(res ?? { success: true });
    } catch (e) {
      setError(e as Error);
    }
  };
}

// ============================================================
// Hooks — Web Auth
// ============================================================

function WebAuthSection() {
  const { authorize, clearSession, user } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const run = makeRun(setResult, setError);

  return (
    <Section title="Web Auth">
      <View style={{ gap: 8 }}>
        {user ? (
          <>
            <Text>Logged in as {user.name ?? user.email ?? user.sub}</Text>
            <Button
              title="clearSession()"
              onPress={() => run(() => clearSession())}
            />
          </>
        ) : (
          <Button
            title="authorize() — Log In"
            onPress={() =>
              run(() =>
                authorize({
                  audience: MY_ACCOUNT_AUDIENCE,
                  scope: `openid profile email offline_access ${MY_ACCOUNT_SCOPE}`,
                })
              )
            }
          />
        )}
        <Text>
          handleRedirectCallback(), getWebUser(), and checkWebSession() (Web
          only) are called automatically by Auth0Provider on page load.
        </Text>
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — Credentials Manager
// ============================================================

function CredentialsSection() {
  const { getCredentials, hasValidCredentials, clearCredentials } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const run = makeRun(setResult, setError);

  return (
    <Section title="Credentials Manager">
      <View style={{ gap: 8 }}>
        <Button
          title="getCredentials()"
          onPress={() => run(() => getCredentials())}
        />
        <Button
          title="hasValidCredentials()"
          onPress={() => run(() => hasValidCredentials())}
        />
        <Button
          title="clearCredentials()"
          onPress={() => run(() => clearCredentials())}
        />
        <Text>
          saveCredentials and clearApiCredentials are no-ops on web.
          getSSOCredentials throws on web.
        </Text>
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — API Credentials / MRRT
// ============================================================

function ApiCredentialsSection() {
  const { getApiCredentials } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [audience, setAudience] = useState(MY_ACCOUNT_AUDIENCE);
  const [scope, setScope] = useState(MY_ACCOUNT_SCOPE);
  const run = makeRun(setResult, setError);

  return (
    <Section title="API Credentials (MRRT)">
      <View style={{ gap: 8 }}>
        <TextInput
          placeholder="Audience"
          value={audience}
          onChangeText={setAudience}
        />
        <TextInput placeholder="Scope" value={scope} onChangeText={setScope} />
        <Button
          title="getApiCredentials()"
          onPress={() => run(() => getApiCredentials(audience, scope))}
          disabled={!audience}
        />
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — MFA Flexible Factors
// ============================================================

function MfaSection() {
  const { mfa } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [step, setStep] = useState<MfaStep>('idle');
  const [loading, setLoading] = useState(false);
  const [authenticators, setAuthenticators] = useState<MfaAuthenticator[]>([]);
  const [enrollType, setEnrollType] = useState<EnrollType | null>(null);
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollmentChallenge, setEnrollmentChallenge] =
    useState<MfaEnrollmentChallenge | null>(null);
  const [challengeResult, setChallengeResult] =
    useState<MfaChallengeResult | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyBinding, setVerifyBinding] = useState('');
  const [verifyScope, setVerifyScope] = useState('');
  const [verifyAudience, setVerifyAudience] = useState('');

  const reset = () => {
    setStep('idle');
    setAuthenticators([]);
    setEnrollType(null);
    setEnrollPhone('');
    setEnrollEmail('');
    setEnrollmentChallenge(null);
    setChallengeResult(null);
    setVerifyCode('');
    setVerifyBinding('');
    setVerifyScope('');
    setVerifyAudience('');
    setLoading(false);
  };

  const handleMfaError = (e: unknown) => {
    if (
      e instanceof MfaError &&
      (e.type === MfaErrorCodes.EXPIRED_MFA_TOKEN ||
        e.type === MfaErrorCodes.INVALID_MFA_TOKEN)
    ) {
      setMfaToken('');
      reset();
    }
    setError(e as Error);
  };

  const onStart = async () => {
    setLoading(true);
    setError(null);
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
      setStep('list');
    } catch (e) {
      handleMfaError(e);
    } finally {
      setLoading(false);
    }
  };

  const onChallenge = async (auth: MfaAuthenticator) => {
    setLoading(true);
    try {
      const res = await mfa.challenge({ mfaToken, authenticatorId: auth.id });
      setChallengeResult(res);
      setStep('verify');
    } catch (e) {
      handleMfaError(e);
      setStep('list');
    } finally {
      setLoading(false);
    }
  };

  const onEnroll = async (type?: EnrollType) => {
    const factor = type ?? enrollType;
    if (!factor) return;
    setLoading(true);
    try {
      let challenge: MfaEnrollmentChallenge;
      if (factor === MfaFactorType.SMS) {
        challenge = await mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.SMS,
          phoneNumber: enrollPhone,
        });
      } else if (factor === MfaFactorType.VOICE) {
        challenge = await mfa.enroll({
          mfaToken,
          factorType: MfaFactorType.VOICE,
          phoneNumber: enrollPhone,
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
      setStep('verify');
    } catch (e) {
      handleMfaError(e);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setLoading(true);
    try {
      const extra = {
        scope: verifyScope || undefined,
        audience: verifyAudience || undefined,
      };
      const oobCode =
        challengeResult?.oobCode ??
        (enrollmentChallenge?.type === 'oob' ||
        enrollmentChallenge?.type === 'push'
          ? enrollmentChallenge.oobCode
          : undefined);
      let credentials;
      if (oobCode) {
        credentials = await mfa.verify({
          mfaToken,
          oobCode,
          bindingCode: verifyBinding || undefined,
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
      setStep('complete');
    } catch (e) {
      handleMfaError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="MFA Flexible Factors">
      <View style={{ gap: 8 }}>
        {step === 'idle' && (
          <>
            <Text>
              Obtain an mfa_token from a password-login attempt with MFA
              enabled, then paste it here.
            </Text>
            <TextInput
              placeholder="MFA token"
              value={mfaToken}
              onChangeText={setMfaToken}
            />
            <Button
              title="mfa.getAuthenticators()"
              onPress={onStart}
              disabled={!mfaToken || loading}
            />
          </>
        )}

        {step === 'list' && (
          <>
            <Text style={{ fontWeight: '600' }}>Select authenticator:</Text>
            {authenticators.length === 0 && (
              <Text>No authenticators enrolled.</Text>
            )}
            {authenticators.map((auth) => (
              <Button
                key={auth.id}
                title={`mfa.challenge() — ${auth.type ?? auth.authenticatorType}${auth.oobChannel ? ` (${auth.oobChannel})` : ''}`}
                onPress={() => onChallenge(auth)}
                disabled={loading}
              />
            ))}
            <Button
              title="mfa.enroll() — Enroll new"
              onPress={() => setStep('enroll-select')}
            />
            <Button title="Back" onPress={reset} />
          </>
        )}

        {step === 'enroll-select' && (
          <>
            <Text style={{ fontWeight: '600' }}>Choose factor type:</Text>
            <Button
              title="TOTP"
              onPress={() => {
                setEnrollType(MfaFactorType.OTP);
                onEnroll(MfaFactorType.OTP);
              }}
              disabled={loading}
            />
            <Button
              title="SMS"
              onPress={() => {
                setEnrollType(MfaFactorType.SMS);
                setStep('enroll-details');
              }}
              disabled={loading}
            />
            <Button
              title="Voice"
              onPress={() => {
                setEnrollType(MfaFactorType.VOICE);
                setStep('enroll-details');
              }}
              disabled={loading}
            />
            <Button
              title="Email"
              onPress={() => {
                setEnrollType(MfaFactorType.EMAIL);
                setStep('enroll-details');
              }}
              disabled={loading}
            />
            <Button
              title="Push"
              onPress={() => {
                setEnrollType(MfaFactorType.PUSH);
                onEnroll(MfaFactorType.PUSH);
              }}
              disabled={loading}
            />
            <Button title="Back" onPress={() => setStep('list')} />
          </>
        )}

        {step === 'enroll-details' && (
          <>
            {(enrollType === MfaFactorType.SMS ||
              enrollType === MfaFactorType.VOICE) && (
              <>
                <TextInput
                  placeholder="+12025550135"
                  value={enrollPhone}
                  onChangeText={setEnrollPhone}
                />
                <Button
                  title={
                    enrollType === MfaFactorType.VOICE
                      ? 'Enroll Voice'
                      : 'Enroll SMS'
                  }
                  onPress={() => onEnroll()}
                  disabled={!enrollPhone || loading}
                />
              </>
            )}
            {enrollType === MfaFactorType.EMAIL && (
              <>
                <TextInput
                  placeholder="user@example.com"
                  value={enrollEmail}
                  onChangeText={setEnrollEmail}
                />
                <Button
                  title="Enroll Email"
                  onPress={() => onEnroll()}
                  disabled={!enrollEmail || loading}
                />
              </>
            )}
            <Button title="Back" onPress={() => setStep('enroll-select')} />
          </>
        )}

        {step === 'verify' && (
          <>
            <Text style={{ fontWeight: '600' }}>mfa.verify()</Text>
            {enrollmentChallenge?.type === 'recovery-code' ? (
              <>
                <Text selectable>
                  Recovery Code: {enrollmentChallenge.recoveryCode}
                </Text>
                <TextInput
                  placeholder="Re-enter the recovery code"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                />
                <Button
                  title="Verify"
                  onPress={onVerify}
                  disabled={!verifyCode || loading}
                />
              </>
            ) : challengeResult?.challengeType === 'oob' ||
              enrollmentChallenge?.type === 'oob' ? (
              <>
                <Text>Code sent. Enter the binding code:</Text>
                <TextInput
                  placeholder="Binding code"
                  value={verifyBinding}
                  onChangeText={setVerifyBinding}
                />
                <Button
                  title="Verify"
                  onPress={onVerify}
                  disabled={!verifyBinding || loading}
                />
              </>
            ) : enrollmentChallenge?.type === 'push' ? (
              <>
                <Text>Approve the push on your device, then:</Text>
                <Button
                  title="I've approved the push"
                  onPress={onVerify}
                  disabled={loading}
                />
              </>
            ) : (
              <>
                <TextInput
                  placeholder="6-digit OTP"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                  keyboardType="number-pad"
                />
                <Button
                  title="Verify"
                  onPress={onVerify}
                  disabled={!verifyCode || loading}
                />
              </>
            )}
            <TextInput
              placeholder="Scope (optional)"
              value={verifyScope}
              onChangeText={setVerifyScope}
            />
            <TextInput
              placeholder={`Audience (optional) — e.g. https://${config.domain}/api/v2/`}
              value={verifyAudience}
              onChangeText={setVerifyAudience}
            />
            <Button title="Back" onPress={() => setStep('list')} />
          </>
        )}

        {step === 'complete' && (
          <>
            <Text>Authentication successful!</Text>
            <Button title="Done" onPress={reset} />
          </>
        )}
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — My Account API
// ============================================================

function MyAccountSection() {
  const { getApiCredentials, myAccount } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [maToken, setMaToken] = useState('');
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
    authParamsPublicKey: Record<string, unknown>;
  } | null>(null);

  const runMA = async (action: (token: string) => Promise<unknown>) => {
    if (!maToken) {
      setError(new Error('Fetch the My Account token first.'));
      return;
    }
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const res = await action(maToken);
      setResult(res ?? { success: true });
    } catch (e) {
      if (e instanceof MyAccountError) {
        setError(
          new Error(
            `[${e.statusCode ?? ''}] ${e.title ?? 'My Account Error'}: ${e.detail ?? e.message}`
          )
        );
      } else {
        setError(e as Error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="My Account API">
      <View style={{ gap: 8 }}>
        <Text>
          Uses MRRT to mint a /me/ access token via getApiCredentials. Fetch it
          before calling any method below.
        </Text>

        <Button
          title={
            maToken
              ? 'Refresh My Account Token'
              : 'getApiCredentials() for /me/'
          }
          onPress={async () => {
            setResult(null);
            setError(null);
            setLoading(true);
            try {
              const creds = await getApiCredentials(
                MY_ACCOUNT_AUDIENCE,
                MY_ACCOUNT_SCOPE
              );
              setMaToken(creds.accessToken);
              setResult({ step: 'getApiCredentials', ...creds });
            } catch (e) {
              setError(e as Error);
            } finally {
              setLoading(false);
            }
          }}
        />
        {maToken ? <Text>Token ready.</Text> : null}

        <Text style={{ marginTop: 8, fontWeight: '600' }}>Query</Text>
        <Button
          title="myAccount.getFactors()"
          onPress={() =>
            runMA(async (t) => {
              const factors = await myAccount.getFactors({ accessToken: t });
              return { step: 'getFactors', factors };
            })
          }
          disabled={!maToken || loading}
        />
        <Button
          title="myAccount.getAuthenticationMethods()"
          onPress={() =>
            runMA(async (t) => {
              const methods = await myAccount.getAuthenticationMethods({
                accessToken: t,
              });
              return {
                step: 'getAuthenticationMethods',
                count: methods.length,
                methods,
              };
            })
          }
          disabled={!maToken || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          Passkey Enrollment (Web only — uses WebAuthn)
        </Text>
        <Button
          title="1. myAccount.passkeyEnrollmentChallenge()"
          onPress={() =>
            runMA(async (t) => {
              const challenge = await myAccount.passkeyEnrollmentChallenge({
                accessToken: t,
              });
              setPasskeyChallenge(challenge);
              return {
                step: 'passkeyEnrollmentChallenge',
                authenticationMethodId: challenge.authenticationMethodId,
                authSession: challenge.authSession,
              };
            })
          }
          disabled={!maToken || loading}
        />
        <Button
          title="2. myAccount.enrollPasskey() — WebAuthn ceremony"
          onPress={() =>
            runMA(async (t) => {
              if (!passkeyChallenge) {
                throw new Error('Run the challenge first.');
              }
              const authResponse = await createWebPasskey(
                passkeyChallenge.authParamsPublicKey
              );
              const method = await myAccount.enrollPasskey({
                accessToken: t,
                authenticationMethodId: passkeyChallenge.authenticationMethodId,
                authSession: passkeyChallenge.authSession,
                authResponse,
                authParamsPublicKey: passkeyChallenge.authParamsPublicKey,
              });
              setPasskeyChallenge(null);
              return { step: 'enrollPasskey', ...method };
            })
          }
          disabled={!maToken || !passkeyChallenge || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          Phone Enrollment
        </Text>
        <TextInput
          placeholder="+1234567890"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button
          title="myAccount.enrollPhone()"
          onPress={() =>
            runMA(async (t) => {
              const challenge = await myAccount.enrollPhone({
                accessToken: t,
                phoneNumber: phoneNumber.trim(),
                preferredAuthenticationMethod:
                  PreferredAuthenticationMethods.SMS,
              });
              setEnrollmentState({ ...challenge, kind: 'phone' });
              return { step: 'enrollPhone', ...challenge };
            })
          }
          disabled={!maToken || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          Email Enrollment
        </Text>
        <TextInput
          placeholder="user@example.com"
          value={emailAddress}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />
        <Button
          title="myAccount.enrollEmail()"
          onPress={() =>
            runMA(async (t) => {
              const challenge = await myAccount.enrollEmail({
                accessToken: t,
                emailAddress: emailAddress.trim(),
              });
              setEnrollmentState({ ...challenge, kind: 'email' });
              return { step: 'enrollEmail', ...challenge };
            })
          }
          disabled={!maToken || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          TOTP / Recovery Code
        </Text>
        <Button
          title="myAccount.enrollTOTP()"
          onPress={() =>
            runMA(async (t) => {
              const challenge = await myAccount.enrollTOTP({ accessToken: t });
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
            })
          }
          disabled={!maToken || loading}
        />
        <Button
          title="myAccount.enrollRecoveryCode()"
          onPress={() =>
            runMA(async (t) => {
              const challenge = await myAccount.enrollRecoveryCode({
                accessToken: t,
              });
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
            })
          }
          disabled={!maToken || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          Confirm Enrollment
        </Text>
        {enrollmentState ? (
          <Text>
            Pending: {enrollmentState.kind} (id {enrollmentState.id})
          </Text>
        ) : null}
        <TextInput
          placeholder="OTP code (not needed for recovery-code)"
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
        />
        <Button
          title="myAccount.confirm*Enrollment()"
          onPress={() =>
            runMA(async (t) => {
              if (!enrollmentState) {
                throw new Error('Start an enrollment first.');
              }
              let method;
              if (enrollmentState.kind === 'recovery') {
                method = await myAccount.confirmRecoveryCodeEnrollment({
                  accessToken: t,
                  id: enrollmentState.id,
                  authSession: enrollmentState.authSession,
                });
              } else {
                const confirmByKind = {
                  phone: myAccount.confirmPhoneEnrollment,
                  email: myAccount.confirmEmailEnrollment,
                  totp: myAccount.confirmTOTPEnrollment,
                };
                method = await confirmByKind[enrollmentState.kind].call(
                  myAccount,
                  {
                    accessToken: t,
                    id: enrollmentState.id,
                    authSession: enrollmentState.authSession,
                    otpCode: otpCode.trim(),
                  }
                );
              }
              setEnrollmentState(null);
              setOtpCode('');
              return { step: 'confirmEnrollment', ...method };
            })
          }
          disabled={!maToken || !enrollmentState || loading}
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>Update / Delete</Text>
        <TextInput
          placeholder="Authentication method ID"
          value={methodId}
          onChangeText={setMethodId}
        />
        <TextInput
          placeholder="New name (for update)"
          value={methodName}
          onChangeText={setMethodName}
        />
        <Button
          title="myAccount.updateAuthenticationMethodById()"
          onPress={() =>
            runMA(async (t) => {
              const method = await myAccount.updateAuthenticationMethodById({
                accessToken: t,
                id: methodId.trim(),
                name: methodName.trim() || undefined,
              });
              return { step: 'updateAuthenticationMethodById', ...method };
            })
          }
          disabled={!maToken || !methodId || loading}
        />
        <Button
          title="myAccount.deleteAuthenticationMethodById()"
          onPress={() =>
            runMA(async (t) => {
              await myAccount.deleteAuthenticationMethodById({
                accessToken: t,
                id: methodId.trim(),
              });
              const deleted = methodId.trim();
              setMethodId('');
              return { step: 'deleteAuthenticationMethodById', deleted };
            })
          }
          disabled={!maToken || !methodId || loading}
        />
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — Passkeys (browser WebAuthn)
// ============================================================

function PasskeysSection() {
  const { passkeySignupChallenge, passkeyLoginChallenge, getTokenByPasskey } =
    useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyEmail, setPasskeyEmail] = useState('');

  const onSignup = async () => {
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const challenge = await passkeySignupChallenge({
        email: passkeyEmail || undefined,
        realm: 'Username-Password-Authentication',
      });
      let credential: PublicKeyCredential;
      try {
        credential = (await navigator.credentials.create({
          publicKey:
            challenge.authParamsPublicKey as PublicKeyCredentialCreationOptions,
        })) as PublicKeyCredential;
      } catch (e) {
        throw new PasskeyError(e as Error);
      }
      const creds = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credential,
        realm: 'Username-Password-Authentication',
      });
      setResult({
        success: true,
        accessToken: creds.accessToken.substring(0, 30) + '...',
      });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    setResult(null);
    setError(null);
    setLoading(true);
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
      const creds = await getTokenByPasskey({
        authSession: challenge.authSession,
        authResponse: credential,
        realm: 'Username-Password-Authentication',
      });
      setResult({
        success: true,
        accessToken: creds.accessToken.substring(0, 30) + '...',
      });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Passkeys (browser WebAuthn)">
      <View style={{ gap: 8 }}>
        <Text>
          Uses navigator.credentials via @auth0/auth0-spa-js. Requires a
          passkey-enabled connection.
        </Text>
        <TextInput
          placeholder="Email (for signup)"
          value={passkeyEmail}
          onChangeText={setPasskeyEmail}
          keyboardType="email-address"
        />
        <Button
          title="passkeySignupChallenge() + getTokenByPasskey()"
          onPress={onSignup}
          disabled={!passkeyEmail || loading}
        />
        <Button
          title="passkeyLoginChallenge() + getTokenByPasskey()"
          onPress={onLogin}
          disabled={loading}
        />
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Hooks — Advanced Tokens (Custom Token Exchange, DPoP)
// ============================================================

function AdvancedTokensSection() {
  const { customTokenExchange, getDPoPHeaders, getCredentials } = useAuth0();
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [subjectToken, setSubjectToken] = useState('');
  const [subjectTokenType, setSubjectTokenType] = useState(
    'urn:acme:external-idp-token'
  );
  const [actorToken, setActorToken] = useState('');
  const [actorTokenType, setActorTokenType] = useState(
    'urn:ietf:params:oauth:token-type:id_token'
  );
  const [dpopUrl, setDpopUrl] = useState('');
  const [dpopMethod, setDpopMethod] = useState('GET');
  const run = makeRun(setResult, setError);

  const fillActorFromSession = async () => {
    setError(null);
    try {
      const creds = await getCredentials();
      if (creds?.idToken) {
        setActorToken(creds.idToken);
      } else {
        setError(new Error('No ID token in current session.'));
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  return (
    <Section title="Advanced Tokens">
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600' }}>
          customTokenExchange() (RFC 8693)
        </Text>
        <TextInput
          placeholder="Subject token"
          value={subjectToken}
          onChangeText={setSubjectToken}
        />
        <TextInput
          placeholder="Subject token type"
          value={subjectTokenType}
          onChangeText={setSubjectTokenType}
        />
        <Button
          title="customTokenExchange()"
          onPress={() =>
            run(() => customTokenExchange({ subjectToken, subjectTokenType }))
          }
          disabled={!subjectToken || !subjectTokenType}
        />

        <Text style={{ marginTop: 8 }}>
          Delegation / Impersonation (with actor token):
        </Text>
        <TextInput
          placeholder="Actor token"
          value={actorToken}
          onChangeText={setActorToken}
        />
        <Button
          title="Fill actor from session ID token"
          onPress={fillActorFromSession}
        />
        <TextInput
          placeholder="Actor token type"
          value={actorTokenType}
          onChangeText={setActorTokenType}
        />
        <Button
          title="customTokenExchange() with actor"
          onPress={() =>
            run(() =>
              customTokenExchange({
                subjectToken,
                subjectTokenType,
                actorToken,
                actorTokenType,
              })
            )
          }
          disabled={
            !subjectToken || !subjectTokenType || !actorToken || !actorTokenType
          }
        />

        <Text style={{ marginTop: 8, fontWeight: '600' }}>
          getDPoPHeaders()
        </Text>
        <Text>
          Requires an active session (useDPoP: true on the provider). Provide
          the access token and token type from getCredentials, then call
          getDPoPHeaders to generate the DPoP proof for a specific request.
        </Text>
        <TextInput
          placeholder="Endpoint URL"
          value={dpopUrl}
          onChangeText={setDpopUrl}
        />
        <TextInput
          placeholder="HTTP method (GET, POST, …)"
          value={dpopMethod}
          onChangeText={setDpopMethod}
        />
        <Button
          title="getCredentials() then getDPoPHeaders()"
          onPress={() =>
            run(async () => {
              const creds = await getCredentials();
              const params: DPoPHeadersParameters = {
                url: dpopUrl,
                method: dpopMethod,
                accessToken: creds.accessToken,
                tokenType: creds.tokenType ?? 'DPoP',
              };
              return getDPoPHeaders(params);
            })
          }
          disabled={!dpopUrl || !dpopMethod}
        />
      </View>
      <ResultView result={result} error={error} />
    </Section>
  );
}

// ============================================================
// Class approach (reference — never called at runtime)
// Exported to satisfy noUnusedLocals. All methods are
// self-consistent but not wired to any UI.
// ============================================================

const _auth0Class = new Auth0({
  domain: config.domain,
  clientId: config.clientId,
  useMrrt: true,
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
});

export const classReference = {
  // Web Auth
  authorize: () =>
    _auth0Class.webAuth.authorize({
      audience: MY_ACCOUNT_AUDIENCE,
      scope: `openid profile email offline_access ${MY_ACCOUNT_SCOPE}`,
    }),
  clearSession: () => _auth0Class.webAuth.clearSession(),
  // Web only
  handleRedirectCallback: () => _auth0Class.webAuth.handleRedirectCallback(),
  getWebUser: () => _auth0Class.webAuth.getWebUser(),
  checkWebSession: () => _auth0Class.webAuth.checkWebSession(),
  // Credentials Manager
  getCredentials: () => _auth0Class.credentialsManager.getCredentials(),
  hasValidCredentials: () =>
    _auth0Class.credentialsManager.hasValidCredentials(),
  clearCredentials: () => _auth0Class.credentialsManager.clearCredentials(),
  // API Credentials / MRRT
  getApiCredentials: (audience: string, scope: string) =>
    _auth0Class.credentialsManager.getApiCredentials(audience, scope),
  // MFA
  mfaGetAuthenticators: (mfaToken: string) =>
    _auth0Class.mfa.getAuthenticators({ mfaToken }),
  mfaChallenge: (mfaToken: string, authenticatorId: string) =>
    _auth0Class.mfa.challenge({ mfaToken, authenticatorId }),
  mfaEnrollOTP: (mfaToken: string) =>
    _auth0Class.mfa.enroll({ mfaToken, factorType: MfaFactorType.OTP }),
  mfaVerify: (mfaToken: string, otp: string) =>
    _auth0Class.mfa.verify({ mfaToken, otp }),
  // My Account
  getFactors: async () => {
    const creds = await _auth0Class.credentialsManager.getApiCredentials(
      MY_ACCOUNT_AUDIENCE,
      MY_ACCOUNT_SCOPE
    );
    return _auth0Class.myAccount.getFactors({ accessToken: creds.accessToken });
  },
  getAuthenticationMethods: async () => {
    const creds = await _auth0Class.credentialsManager.getApiCredentials(
      MY_ACCOUNT_AUDIENCE,
      MY_ACCOUNT_SCOPE
    );
    return _auth0Class.myAccount.getAuthenticationMethods({
      accessToken: creds.accessToken,
    });
  },
  // Advanced Tokens
  customTokenExchange: (subjectToken: string, subjectTokenType: string) =>
    _auth0Class.customTokenExchange({ subjectToken, subjectTokenType }),
  getDPoPHeaders: (params: DPoPHeadersParameters) =>
    _auth0Class.getDPoPHeaders(params),
};

// ============================================================
// App
// ============================================================

function Content() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <WebAuthSection />
      <CredentialsSection />
      <ApiCredentialsSection />
      <MfaSection />
      <MyAccountSection />
      <PasskeysSection />
      <AdvancedTokensSection />
    </ScrollView>
  );
}

export default function App() {
  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      useMrrt
      cacheLocation="localstorage"
      useRefreshTokens
    >
      <Content />
    </Auth0Provider>
  );
}
