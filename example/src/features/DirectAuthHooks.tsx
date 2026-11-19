import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';
import { mfaTokenFrom } from '../shared/mfaToken';

type Props = { onMfaToken?: (mfaToken: string) => void };

const DirectAuthHooks = ({ onMfaToken }: Props) => {
  const {
    loginWithPasswordRealm,
    createUser,
    resetPassword,
    revokeRefreshToken,
    authorizeWithExchangeNativeSocial,
  } = useAuth0();

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connection, setConnection] = useState(
    'Username-Password-Authentication'
  );
  const [refreshToken, setRefreshToken] = useState('');
  const [subjectToken, setSubjectToken] = useState('');
  const [subjectTokenType, setSubjectTokenType] = useState(
    'http://auth0.com/oauth/token-type/google-access-token'
  );

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    setResult(null);
    setMfaRequired(false);
    try {
      const res = await fn();
      setResult(res ?? { success: true });
    } catch (e) {
      setError(e as Error);
      const mfaToken = mfaTokenFrom(e);
      if (mfaToken) {
        onMfaToken?.(mfaToken);
        setMfaRequired(true);
      }
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
          title="loginWithPasswordRealm()"
          onPress={() =>
            run(() =>
              loginWithPasswordRealm({ username, password, realm: connection })
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
          title="createUser()"
          onPress={() => run(() => createUser({ email, password, connection }))}
          disabled={!email || !password || !connection}
        />
        <Button
          title="resetPassword()"
          onPress={() => run(() => resetPassword({ email, connection }))}
          disabled={!email || !connection}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Refresh token"
          value={refreshToken}
          onChangeText={setRefreshToken}
        />
        <Button
          title="revokeRefreshToken()"
          onPress={() => run(() => revokeRefreshToken({ refreshToken }))}
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
          title="authorizeWithExchangeNativeSocial()"
          onPress={() =>
            run(() =>
              authorizeWithExchangeNativeSocial({
                subjectToken,
                subjectTokenType,
              })
            )
          }
          disabled={!subjectToken || !subjectTokenType}
        />
      </View>

      <ResultView result={result} error={error} />
      {mfaRequired ? (
        <Text>MFA required: the MFA token was passed to the MFA section.</Text>
      ) : null}
    </Section>
  );
};

export default DirectAuthHooks;
