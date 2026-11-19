import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

const WebAuthHooks = () => {
  const {
    authorize,
    clearSession,
    cancelWebAuth,
    resumeSession,
    user,
    isLoading,
  } = useAuth0();

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [organization, setOrganization] = useState('');

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
    <Section title="Web Authentication">
      <Button
        title="authorize() (login)"
        onPress={() => run(() => authorize())}
      />
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Organization ID or name"
          value={organization}
          onChangeText={setOrganization}
        />
        <Button
          title="authorize() with organization"
          onPress={() => run(() => authorize({ organization }))}
          disabled={!organization}
        />
      </View>
      <Button
        title="authorize() ephemeral (iOS/Android)"
        onPress={() => run(() => authorize({}, { ephemeralSession: true }))}
      />
      <Button
        title="clearSession() (logout)"
        onPress={() => run(() => clearSession())}
      />
      <Button
        title="cancelWebAuth() (iOS)"
        onPress={() => run(() => cancelWebAuth())}
      />
      <Button
        title="resumeSession() (Android)"
        onPress={() => run(() => resumeSession())}
      />
      <Button
        title="Show current user"
        onPress={() => {
          setError(null);
          setResult(user);
        }}
        disabled={isLoading}
      />
      <ResultView result={result} error={error} />
    </Section>
  );
};

export default WebAuthHooks;
