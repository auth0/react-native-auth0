import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

// Class-based reference for Advanced Token operations. Same operations as
// AdvancedTokensHooks.tsx, expressed against the Auth0 class instance. Not
// imported by the app — kept as a side-by-side reference.
const AdvancedTokensClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);

  // Custom Token Exchange
  const [subjectToken, setSubjectToken] = useState('');
  const [subjectTokenType, setSubjectTokenType] = useState(
    'urn:acme:external-idp-token'
  );
  const [actorToken, setActorToken] = useState('');
  const [actorTokenType, setActorTokenType] = useState(
    'urn:ietf:params:oauth:token-type:id_token'
  );

  // DPoP Headers
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [accessToken, setAccessToken] = useState('');
  const [tokenType, setTokenType] = useState('DPoP');

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
    <Section title="Advanced Tokens">
      <View style={{ gap: 8 }}>
        <TextInput
          placeholder="Subject token"
          value={subjectToken}
          onChangeText={setSubjectToken}
        />
        <TextInput
          placeholder="Subject token type (urn:...)"
          value={subjectTokenType}
          onChangeText={setSubjectTokenType}
        />
        <Button
          title="customTokenExchange()"
          onPress={() =>
            run(() =>
              auth0.customTokenExchange({ subjectToken, subjectTokenType })
            )
          }
          disabled={!subjectToken || !subjectTokenType}
        />

        <TextInput
          placeholder="Actor token (for delegation)"
          value={actorToken}
          onChangeText={setActorToken}
        />
        <TextInput
          placeholder="Actor token type (urn:...)"
          value={actorTokenType}
          onChangeText={setActorTokenType}
        />
        <Button
          title="customTokenExchange() with actor"
          onPress={() =>
            run(() =>
              auth0.customTokenExchange({
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
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="URL (requires useDPoP: true on Auth0Provider)"
          value={url}
          onChangeText={setUrl}
        />
        <TextInput
          placeholder="HTTP method (GET, POST, …)"
          value={method}
          onChangeText={setMethod}
        />
        <TextInput
          placeholder="Access token (DPoP)"
          value={accessToken}
          onChangeText={setAccessToken}
        />
        <TextInput
          placeholder="Token type"
          value={tokenType}
          onChangeText={setTokenType}
        />
        <Button
          title="getDPoPHeaders()"
          onPress={() =>
            run(() =>
              auth0.getDPoPHeaders({ url, method, accessToken, tokenType })
            )
          }
          disabled={!url || !method || !accessToken || !tokenType}
        />
      </View>

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default AdvancedTokensClass;
