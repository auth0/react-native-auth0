import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { useAuth0, Credentials } from 'react-native-auth0';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

const CredentialsHooks = () => {
  const {
    getCredentials,
    saveCredentials,
    hasValidCredentials,
    clearCredentials,
    getApiCredentials,
    clearApiCredentials,
    getSSOCredentials,
  } = useAuth0();

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [audience, setAudience] = useState('');
  const [scope, setScope] = useState('openid profile email');
  const [last, setLast] = useState<Credentials | null>(null);

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
    <Section title="Credentials Manager">
      <Button
        title="getCredentials()"
        onPress={() =>
          run(async () => {
            const creds = await getCredentials();
            setLast(creds ?? null);
            return creds;
          })
        }
      />
      <Button
        title="hasValidCredentials()"
        onPress={() => run(() => hasValidCredentials())}
      />
      <Button
        title="saveCredentials() (Native only)"
        onPress={() => run(() => saveCredentials(last as Credentials))}
        disabled={!last}
      />
      <Button
        title="clearCredentials()"
        onPress={() => run(() => clearCredentials())}
      />

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="API audience"
          value={audience}
          onChangeText={setAudience}
        />
        <TextInput placeholder="Scope" value={scope} onChangeText={setScope} />
        <Button
          title="getApiCredentials() (MRRT)"
          onPress={() => run(() => getApiCredentials(audience, scope))}
          disabled={!audience}
        />
        <Button
          title="clearApiCredentials() (Native only)"
          onPress={() => run(() => clearApiCredentials(audience))}
          disabled={!audience}
        />
      </View>

      <Button
        title="getSSOCredentials() (Native only)"
        onPress={() => run(() => getSSOCredentials())}
      />

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default CredentialsHooks;
