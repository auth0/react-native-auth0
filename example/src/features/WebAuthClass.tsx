import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

// Class-based reference for Web Authentication. Same operations as
// WebAuthHooks.tsx, expressed against the Auth0 class instance. Not imported
// by the app — kept as a side-by-side reference.
const WebAuthClass = () => {
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
        onPress={() => run(() => auth0.webAuth.authorize({}))}
      />
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Organization ID or name"
          value={organization}
          onChangeText={setOrganization}
        />
        <Button
          title="authorize() with organization"
          onPress={() => run(() => auth0.webAuth.authorize({ organization }))}
          disabled={!organization}
        />
      </View>
      <Button
        title="authorize() ephemeral (iOS/Android)"
        onPress={() =>
          run(() => auth0.webAuth.authorize({}, { ephemeralSession: true }))
        }
      />
      <Button
        title="clearSession() (logout)"
        onPress={() => run(() => auth0.webAuth.clearSession())}
      />
      <Button
        title="cancelWebAuth() (iOS)"
        onPress={() => run(() => auth0.webAuth.cancelWebAuth())}
      />
      <Button
        title="resumeSession() (Android)"
        onPress={() => run(() => auth0.webAuth.resumeSession())}
      />
      <Button
        title="getWebUser() (Web only)"
        onPress={() => run(() => auth0.webAuth.getWebUser())}
      />
      <Button
        title="checkWebSession() (Web only)"
        onPress={() => run(() => auth0.webAuth.checkWebSession())}
      />
      <Button
        title="handleRedirectCallback() (Web only)"
        onPress={() => run(() => auth0.webAuth.handleRedirectCallback())}
      />
      <ResultView result={result} error={error} />
    </Section>
  );
};

export default WebAuthClass;
