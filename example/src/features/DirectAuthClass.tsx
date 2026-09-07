import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

// Class-based reference for the Direct Authentication API. Same operations as
// DirectAuthHooks.tsx (plus userInfo and refreshToken), expressed against the
// Auth0 class instance. Not imported by the app — kept as a side-by-side reference.
const DirectAuthClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connection, setConnection] = useState(
    'Username-Password-Authentication'
  );
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [subjectToken, setSubjectToken] = useState('');
  const [subjectTokenType, setSubjectTokenType] = useState(
    'http://auth0.com/oauth/token-type/google-access-token'
  );

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
    <Section title="Direct Authentication API (Native only)">
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Realm / connection"
          value={connection}
          onChangeText={setConnection}
        />
        <Button
          title="auth.passwordRealm()"
          onPress={() =>
            run(() =>
              auth0.auth.passwordRealm({
                username,
                password,
                realm: connection,
              })
            )
          }
          disabled={!username || !password || !connection}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Button
          title="auth.createUser()"
          onPress={() =>
            run(() => auth0.auth.createUser({ email, password, connection }))
          }
          disabled={!email || !password || !connection}
        />
        <Button
          title="auth.resetPassword()"
          onPress={() =>
            run(() => auth0.auth.resetPassword({ email, connection }))
          }
          disabled={!email || !connection}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Access token"
          value={accessToken}
          onChangeText={setAccessToken}
        />
        <Button
          title="auth.userInfo()"
          onPress={() => run(() => auth0.auth.userInfo({ token: accessToken }))}
          disabled={!accessToken}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Refresh token"
          value={refreshToken}
          onChangeText={setRefreshToken}
        />
        <Button
          title="auth.refreshToken()"
          onPress={() => run(() => auth0.auth.refreshToken({ refreshToken }))}
          disabled={!refreshToken}
        />
        <Button
          title="auth.revoke()"
          onPress={() => run(() => auth0.auth.revoke({ refreshToken }))}
          disabled={!refreshToken}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Native social subject token"
          value={subjectToken}
          onChangeText={setSubjectToken}
        />
        <TextInput
          placeholder="Subject token type"
          value={subjectTokenType}
          onChangeText={setSubjectTokenType}
        />
        <Button
          title="auth.exchangeNativeSocial()"
          onPress={() =>
            run(() =>
              auth0.auth.exchangeNativeSocial({
                subjectToken,
                subjectTokenType,
              })
            )
          }
          disabled={!subjectToken || !subjectTokenType}
        />
      </View>

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default DirectAuthClass;
