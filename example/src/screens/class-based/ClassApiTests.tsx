import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import auth0 from '../../api/auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import LabeledInput from '../../components/LabeledInput';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';

type ApiTestsRouteProp = RouteProp<ClassDemoStackParamList, 'ClassApiTests'>;

type Props = {
  route: ApiTestsRouteProp;
};

const ClassApiTestsScreen = ({ route }: Props) => {
  const { accessToken } = route.params;
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // State for specific API calls
  const [email, setEmail] = useState('test-user@auth0.com'); // dummy username
  const [password, setPassword] = useState('P@ssword123'); // dummy password
  const [mfaToken, setMfaToken] = useState('');
  const [otp, setOtp] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const runTest = async (testFn: () => Promise<any>, title: string) => {
    setError(null);
    setResult(null);
    console.log(`Running test: ${title}`);
    try {
      const res = await testFn();
      const successMessage = res ?? {
        success: `${title} completed successfully`,
      };
      console.log('Success:', successMessage);
      setResult(successMessage);

      // If we got credentials, update our state for subsequent tests
      if (res?.mfa_token) setMfaToken(res.mfa_token);
      if (res?.refreshToken) setRefreshToken(res.refreshToken);
    } catch (e) {
      console.log('Error:', e);
      setError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Direct API Tests" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result title="Last Action Result" result={result} error={error} />

        <Section title="User Profile">
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.userInfo({ token: accessToken }),
                'Get User Info'
              )
            }
            title="auth.userInfo()"
          />
        </Section>

        <Section title="Passwordless">
          <LabeledInput
            label="Email for Passwordless"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.passwordlessWithEmail({ email, send: 'code' }),
                'Passwordless Email'
              )
            }
            title="auth.passwordlessWithEmail(code)"
          />
          {/* Note: loginWithEmail would require getting the code from the email */}
        </Section>

        <Section title="DB Connections">
          <LabeledInput
            label="Email"
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
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.auth.createUser({
                    email,
                    password,
                    connection: 'Username-Password-Authentication',
                  }),
                'Create User'
              )
            }
            title="auth.createUser()"
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  auth0.auth.resetPassword({
                    email,
                    connection: 'Username-Password-Authentication',
                  }),
                'Reset Password'
              )
            }
            title="auth.resetPassword()"
          />
        </Section>

        <Section title="MFA & Tokens">
          <LabeledInput
            label="MFA Token"
            value={mfaToken}
            onChangeText={setMfaToken}
            placeholder="From a failed password login"
          />
          <LabeledInput
            label="OTP Code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.loginWithOTP({ mfaToken, otp }),
                'Login with OTP'
              )
            }
            title="auth.loginWithOTP()"
            disabled={!mfaToken}
          />
          <LabeledInput
            label="Refresh Token"
            value={refreshToken}
            onChangeText={setRefreshToken}
            placeholder="From a successful login"
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.refreshToken({ refreshToken }),
                'Refresh Token'
              )
            }
            title="auth.refreshToken()"
            disabled={!refreshToken}
          />
          <Button
            onPress={() =>
              runTest(
                () => auth0.auth.revoke({ refreshToken }),
                'Revoke Refresh Token'
              )
            }
            title="auth.revoke()"
            disabled={!refreshToken}
          />
        </Section>

        {/* Other methods can be added here following the same pattern */}
        {/* e.g., exchange, exchangeNativeSocial, other passwordless/MFA flows */}
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
    <View style={styles.buttonGroup}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 10,
  },
});

export default ClassApiTestsScreen;
