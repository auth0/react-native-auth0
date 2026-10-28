import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import {
  DeliveryMethod,
  PasskeyError,
  type PasskeyVerificationMethod,
  type PasswordlessDeliveryMethod,
} from 'react-native-auth0';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';
import { createPasskey, getPasskey } from '../passkey/PasskeyModule';

const REALM = 'Username-Password-Authentication';

// A signup on a connection that verifies identifiers is split in two. The challenge lists what to verify; the
// passkey is only created once the codes are in, and a wrong code is retried with the same credential.
type PendingSignup = {
  authSession: string;
  authParamsPublicKey: Record<string, any>;
  verificationRequired: PasskeyVerificationMethod[];
  credentialJson?: string;
};

type Codes = Partial<Record<PasskeyVerificationMethod, string>>;

// Class-based reference for Passkeys. Same operations as PasskeysHooks.tsx,
// expressed against the Auth0 class instance. Not imported by the app — kept
// as a side-by-side reference.
const PasskeysClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] =
    useState<PasswordlessDeliveryMethod>(DeliveryMethod.TEXT);
  const [pending, setPending] = useState<PendingSignup | null>(null);
  const [codes, setCodes] = useState<Codes>({});

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

  const cancelSignup = () => {
    setPending(null);
    setCodes({});
  };

  const finishSignup = async (signup: PendingSignup) => {
    // Created once, after every code is entered; a retry reuses it instead of prompting for a second passkey.
    const credentialJson =
      signup.credentialJson ??
      (await createPasskey(signup.authParamsPublicKey));
    const current = { ...signup, credentialJson };
    setPending(current);

    try {
      const credentials = await auth0.getTokenByPasskey({
        authSession: current.authSession,
        authResponse: credentialJson,
        realm: REALM,
        verification: codes,
      });
      cancelSignup();
      return credentials;
    } catch (e) {
      const retry =
        e instanceof PasskeyError ? e.getVerificationRetryPayload() : null;
      if (!retry) {
        // Not retryable (attempts used up, session expired, ...): start the signup over.
        cancelSignup();
        throw e;
      }
      const failed = retry.verificationRequired?.length
        ? retry.verificationRequired
        : current.verificationRequired;
      setPending({
        ...current,
        authSession: retry.authSession ?? current.authSession,
        verificationRequired: failed,
      });
      // Keep the codes that were right; only the listed identifiers are asked for again.
      setCodes((previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(
            ([method]) => !failed.includes(method as PasskeyVerificationMethod)
          )
        )
      );
      throw e;
    }
  };

  const startSignup = async () => {
    const challenge = await auth0.passkeySignupChallenge({
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      realm: REALM,
      deliveryMethod: phoneNumber ? deliveryMethod : undefined,
    });

    if (challenge.verificationRequired?.length) {
      // Auth0 sent a code to each identifier; wait for the user to enter them.
      setCodes({});
      setPending({
        authSession: challenge.authSession,
        authParamsPublicKey: challenge.authParamsPublicKey,
        verificationRequired: challenge.verificationRequired,
      });
      return {
        verificationRequired: challenge.verificationRequired,
        next: 'Enter the codes below, then verify.',
      };
    }

    const credentialJson = await createPasskey(challenge.authParamsPublicKey);
    return auth0.getTokenByPasskey({
      authSession: challenge.authSession,
      authResponse: credentialJson,
      realm: REALM,
    });
  };

  const missingCode = pending?.verificationRequired.some(
    (method) => !codes[method]
  );

  return (
    <Section title="Passkeys">
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Email (for signup)"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Phone number (for signup, +12025550135)"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <Button
          title={`Phone code by: ${deliveryMethod} (tap to switch)`}
          onPress={() =>
            setDeliveryMethod((current) =>
              current === DeliveryMethod.TEXT
                ? DeliveryMethod.VOICE
                : DeliveryMethod.TEXT
            )
          }
          disabled={!phoneNumber}
        />
        <Button
          title="Sign Up with Passkey"
          onPress={() => run(startSignup)}
          disabled={pending !== null}
        />
        {pending && (
          <View style={{ gap: 8 }}>
            <Text>
              Enter the code sent to each identifier to finish the signup.
            </Text>
            {pending.verificationRequired.map((method) => (
              <TextInput
                key={method}
                placeholder={`${method} code`}
                keyboardType="number-pad"
                value={codes[method] ?? ''}
                onChangeText={(code) =>
                  setCodes((previous) => ({ ...previous, [method]: code }))
                }
              />
            ))}
            <Button
              title="Verify and Create Passkey"
              onPress={() => run(() => finishSignup(pending))}
              disabled={missingCode}
            />
            <Button title="Cancel Signup" onPress={cancelSignup} />
          </View>
        )}
      </View>
      <Button
        title="Sign In with Passkey"
        onPress={() =>
          run(async () => {
            const challenge = await auth0.passkeyLoginChallenge({
              realm: REALM,
            });
            const credentialJson = await getPasskey(
              challenge.authParamsPublicKey
            );
            return auth0.getTokenByPasskey({
              authSession: challenge.authSession,
              authResponse: credentialJson,
              realm: REALM,
            });
          })
        }
      />
      <ResultView result={result} error={error} />
    </Section>
  );
};

export default PasskeysClass;
