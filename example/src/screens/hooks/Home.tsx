import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabeledInput from '../../components/LabeledInput';
import Result from '../../components/Result';
import config from '../../auth0-configuration';

const HomeScreen = () => {
  const {
    authorize,
    loginWithPasswordRealm,
    sendEmailCode,
    authorizeWithEmail,
    error,
  } = useAuth0();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);

  const onLogin = async () => {
    try {
      await authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
    } catch (e) {
      console.log('Login error: ', e);
    }
  };

  const onLoginWithPassword = async () => {
    try {
      await loginWithPasswordRealm({
        username: email,
        password: password,
        realm: 'Username-Password-Authentication',
      });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onSendEmailCode = async () => {
    try {
      await sendEmailCode({ email });
      setShowOtpInput(true);
      Alert.alert('Success', 'Check your email for the one-time code.');
    } catch (e) {
      setApiError(e as Error);
    }
  };

  const onLoginWithEmailCode = async () => {
    try {
      await authorizeWithEmail({ email, code: otp });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Welcome" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>React Native Auth0 Hooks</Text>

        {error && <Result title="Hook Error" error={error} result={null} />}
        {apiError && (
          <Result title="API Error" error={apiError} result={null} />
        )}

        <Section title="Web Auth (Recommended)">
          <Button onPress={onLogin} title="Log In" />
        </Section>

        <Section title="Database Login">
          <LabeledInput
            label="Username or Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button onPress={onLoginWithPassword} title="Log In with Password" />
        </Section>

        <Section title="Passwordless (Email OTP)">
          <LabeledInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button onPress={onSendEmailCode} title="Send Email Code" />

          {showOtpInput && (
            <>
              <LabeledInput
                label="One-Time Code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
              <Button onPress={onLoginWithEmailCode} title="Log In with Code" />
            </>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, gap: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});

export default HomeScreen;
