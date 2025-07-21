import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import LabeledInput from '../../components/LabeledInput';

const MoreScreen = () => {
  const { createUser, resetPassword, authorizeWithExchangeNativeSocial } =
    useAuth0();

  const [apiResult, setApiResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const runTest = async (testFn: () => Promise<any>, title: string) => {
    setApiError(null);
    setApiResult(null);
    try {
      const res = await testFn();
      setApiResult(res ?? { success: `${title} completed` });
    } catch (e) {
      setApiError(e as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="More Auth Methods" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result title="API Result" result={apiResult} error={apiError} />

        <Section title="Create User">
          <LabeledInput
            label="New User Email"
            value={newUserEmail}
            onChangeText={setNewUserEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <LabeledInput
            label="New User Password"
            value={newUserPassword}
            onChangeText={setNewUserPassword}
            secureTextEntry
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  createUser({
                    email: newUserEmail,
                    password: newUserPassword,
                    connection: 'Username-Password-Authentication',
                  }),
                'Create User'
              )
            }
            title="hooks.createUser()"
          />
        </Section>

        <Section title="Password Reset">
          <LabeledInput
            label="Email for Reset"
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={() =>
              runTest(
                () =>
                  resetPassword({
                    email: resetEmail,
                    connection: 'Username-Password-Authentication',
                  }),
                'Reset Password'
              )
            }
            title="hooks.resetPassword()"
          />
        </Section>

        <Section title="Native Social Login (Advanced)">
          <Text style={styles.description}>
            This requires getting a token from a native social SDK (e.g., Google
            Sign-In) first.
          </Text>
          <Button
            onPress={() =>
              runTest(
                () =>
                  authorizeWithExchangeNativeSocial({
                    subjectToken: 'NATIVE_SOCIAL_TOKEN',
                    subjectTokenType:
                      'http://auth0.com/oauth/token-type/google-access-token',
                  }),
                'Exchange Social Token'
              )
            }
            title="hooks.authorizeWithExchangeNativeSocial()"
          />
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
  content: { padding: 16, paddingBottom: 50 },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, color: '#757575', marginBottom: 10 },
});

export default MoreScreen;
