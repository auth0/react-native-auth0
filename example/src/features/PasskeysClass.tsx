import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';
import { createPasskey, getPasskey } from '../passkey/PasskeyModule';

// Class-based reference for Passkeys. Same operations as PasskeysHooks.tsx,
// expressed against the Auth0 class instance. Not imported by the app — kept
// as a side-by-side reference.
const PasskeysClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');

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

  return (
    <Section title="Passkeys">
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Email (for signup)"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Button
          title="Sign Up with Passkey"
          onPress={() =>
            run(async () => {
              const challenge = await auth0.passkeySignupChallenge({
                email: email || undefined,
                realm: 'Username-Password-Authentication',
              });
              const credentialJson = await createPasskey(
                challenge.authParamsPublicKey
              );
              return auth0.getTokenByPasskey({
                authSession: challenge.authSession,
                authResponse: credentialJson,
                realm: 'Username-Password-Authentication',
              });
            })
          }
        />
      </View>
      <Button
        title="Sign In with Passkey"
        onPress={() =>
          run(async () => {
            const challenge = await auth0.passkeyLoginChallenge({
              realm: 'Username-Password-Authentication',
            });
            const credentialJson = await getPasskey(
              challenge.authParamsPublicKey
            );
            return auth0.getTokenByPasskey({
              authSession: challenge.authSession,
              authResponse: credentialJson,
              realm: 'Username-Password-Authentication',
            });
          })
        }
      />
      <ResultView result={result} error={error} />
    </Section>
  );
};

export default PasskeysClass;
