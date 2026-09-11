import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { PreferredAuthenticationMethods } from 'react-native-auth0';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';
import config from '../auth0-configuration';
import { createPasskey } from '../passkey/PasskeyModule';

// Class-based reference for the My Account API. Same operations as
// MyAccountHooks.tsx, expressed against the Auth0 class instance. Not imported
// by the app — kept as a side-by-side reference.

const MY_ACCOUNT_SCOPE =
  'read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors create:me:authentication_methods';

const MyAccountClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [methodId, setMethodId] = useState('');
  const [methodName, setMethodName] = useState('');
  const [enrollmentState, setEnrollmentState] = useState<{
    id: string;
    authSession: string;
  } | null>(null);
  const [challengeState, setChallengeState] = useState<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Record<string, unknown>;
  } | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    setResult(null);
    try {
      const res = await fn();
      setResult(res ?? { success: true });
    } catch (e) {
      setError(e as Error);
    }
  };

  const getToken = async (): Promise<string> => {
    if (accessToken) return accessToken;
    const creds = await auth0.credentialsManager.getApiCredentials(
      `https://${config.domain}/me/`,
      MY_ACCOUNT_SCOPE
    );
    setAccessToken(creds.accessToken);
    return creds.accessToken;
  };

  return (
    <Section title="My Account API">
      <Button
        title="Get My Account token"
        onPress={() =>
          run(async () => {
            const creds = await auth0.credentialsManager.getApiCredentials(
              `https://${config.domain}/me/`,
              MY_ACCOUNT_SCOPE
            );
            setAccessToken(creds.accessToken);
            return { accessToken: creds.accessToken.substring(0, 20) + '...' };
          })
        }
      />

      <Button
        title="getFactors()"
        onPress={() =>
          run(async () => {
            const token = await getToken();
            return auth0.myAccount.getFactors({ accessToken: token });
          })
        }
        disabled={!accessToken}
      />

      <Button
        title="getAuthenticationMethods()"
        onPress={() =>
          run(async () => {
            const token = await getToken();
            return auth0.myAccount.getAuthenticationMethods({
              accessToken: token,
            });
          })
        }
        disabled={!accessToken}
      />

      <View style={{ marginTop: 8, gap: 8 }}>
        <TextInput
          placeholder="Authentication Method ID"
          value={methodId}
          onChangeText={setMethodId}
        />
        <Button
          title="getAuthenticationMethodById()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              return auth0.myAccount.getAuthenticationMethodById({
                accessToken: token,
                id: methodId.trim(),
              });
            })
          }
          disabled={!accessToken || !methodId}
        />
        <TextInput
          placeholder="New name (for update)"
          value={methodName}
          onChangeText={setMethodName}
        />
        <Button
          title="updateAuthenticationMethodById()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              return auth0.myAccount.updateAuthenticationMethodById({
                accessToken: token,
                id: methodId.trim(),
                name: methodName.trim() || undefined,
              });
            })
          }
          disabled={!accessToken || !methodId}
        />
        <Button
          title="deleteAuthenticationMethodById()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              return auth0.myAccount.deleteAuthenticationMethodById({
                accessToken: token,
                id: methodId.trim(),
              });
            })
          }
          disabled={!accessToken || !methodId}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <TextInput
          placeholder="+1234567890"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button
          title="enrollPhone()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const challenge = await auth0.myAccount.enrollPhone({
                accessToken: token,
                phoneNumber: phoneNumber.trim(),
                preferredAuthenticationMethod:
                  PreferredAuthenticationMethods.SMS,
              });
              setEnrollmentState(challenge);
              return challenge;
            })
          }
          disabled={!accessToken || !phoneNumber}
        />
        <Button
          title="confirmPhoneEnrollment()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const method = await auth0.myAccount.confirmPhoneEnrollment({
                accessToken: token,
                id: enrollmentState!.id,
                authSession: enrollmentState!.authSession,
                otpCode: otpCode.trim(),
              });
              setEnrollmentState(null);
              return method;
            })
          }
          disabled={!accessToken || !enrollmentState || !otpCode}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <TextInput
          placeholder="user@example.com"
          keyboardType="email-address"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />
        <Button
          title="enrollEmail()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const challenge = await auth0.myAccount.enrollEmail({
                accessToken: token,
                emailAddress: emailAddress.trim(),
              });
              setEnrollmentState(challenge);
              return challenge;
            })
          }
          disabled={!accessToken || !emailAddress}
        />
        <Button
          title="confirmEmailEnrollment()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const method = await auth0.myAccount.confirmEmailEnrollment({
                accessToken: token,
                id: enrollmentState!.id,
                authSession: enrollmentState!.authSession,
                otpCode: otpCode.trim(),
              });
              setEnrollmentState(null);
              return method;
            })
          }
          disabled={!accessToken || !enrollmentState || !otpCode}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <TextInput
          placeholder="OTP / code"
          keyboardType="number-pad"
          value={otpCode}
          onChangeText={setOtpCode}
        />
        <Button
          title="enrollTOTP()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const challenge = await auth0.myAccount.enrollTOTP({
                accessToken: token,
              });
              setEnrollmentState({
                id: challenge.id,
                authSession: challenge.authSession,
              });
              return challenge;
            })
          }
          disabled={!accessToken}
        />
        <Button
          title="confirmTOTPEnrollment()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const method = await auth0.myAccount.confirmTOTPEnrollment({
                accessToken: token,
                id: enrollmentState!.id,
                authSession: enrollmentState!.authSession,
                otpCode: otpCode.trim(),
              });
              setEnrollmentState(null);
              return method;
            })
          }
          disabled={!accessToken || !enrollmentState || !otpCode}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <Button
          title="enrollRecoveryCode()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const challenge = await auth0.myAccount.enrollRecoveryCode({
                accessToken: token,
              });
              setEnrollmentState({
                id: challenge.id,
                authSession: challenge.authSession,
              });
              return challenge;
            })
          }
          disabled={!accessToken}
        />
        <Button
          title="confirmRecoveryCodeEnrollment()"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const method =
                await auth0.myAccount.confirmRecoveryCodeEnrollment({
                  accessToken: token,
                  id: enrollmentState!.id,
                  authSession: enrollmentState!.authSession,
                });
              setEnrollmentState(null);
              return method;
            })
          }
          disabled={!accessToken || !enrollmentState}
        />
      </View>

      <View style={{ marginTop: 8, gap: 8 }}>
        <Button
          title="passkeyEnrollmentChallenge() (Native / WebAuthn)"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const challenge =
                await auth0.myAccount.passkeyEnrollmentChallenge({
                  accessToken: token,
                });
              setChallengeState(challenge);
              return challenge;
            })
          }
          disabled={!accessToken}
        />
        <Button
          title="enrollPasskey() (Native / WebAuthn)"
          onPress={() =>
            run(async () => {
              const token = await getToken();
              const authResponse = await createPasskey(
                challengeState!.authParamsPublicKey
              );
              return auth0.myAccount.enrollPasskey({
                accessToken: token,
                authenticationMethodId: challengeState!.authenticationMethodId,
                authSession: challengeState!.authSession,
                authParamsPublicKey: challengeState!.authParamsPublicKey,
                authResponse,
              });
            })
          }
          disabled={!accessToken || !challengeState}
        />
      </View>

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default MyAccountClass;
