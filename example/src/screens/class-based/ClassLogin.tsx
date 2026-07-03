// example/src/screens/class-based/ClassLogin.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { PasswordlessChallenge } from 'react-native-auth0';
import auth0 from '../../api/auth0'; // Import our singleton instance
import Button from '../../components/Button';
import Header from '../../components/Header';
import LabeledInput from '../../components/LabeledInput';
import Result from '../../components/Result';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';
import config from '../../auth0-configuration';

type NavigationProp = StackNavigationProp<
  ClassDemoStackParamList,
  'ClassLogin'
>;

const ClassLoginScreen = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<PasswordlessChallenge | null>(
    null
  );

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email offline_access',
        audience: `https://${config.domain}/api/v2/`,
      });
      // On success, we save the credentials and navigate to the profile screen.
      await auth0.credentialsManager.saveCredentials(credentials);
      navigation.replace('ClassProfile', { credentials });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const onSendOtpChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const result =
        otpMethod === 'email'
          ? await auth0.passwordless.challengeWithEmail({
              email: otpEmail,
              connection: 'Username-Password-Authentication',
              allowSignup: true,
            })
          : await auth0.passwordless.challengeWithPhoneNumber({
              phoneNumber: otpPhone,
              connection: 'Username-Password-Authentication',
              deliveryMethod: 'text',
              allowSignup: true,
            });
      setChallenge(result);
      Alert.alert(
        'Success',
        otpMethod === 'email'
          ? 'Check your email for the one-time code.'
          : 'Check your phone for the one-time code.'
      );
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const onLoginWithOtp = async () => {
    if (!challenge) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credentials = await auth0.passwordless.loginWithOTP({
        challenge,
        otp,
        audience: `https://${config.domain}/api/v2/`,
      });
      await auth0.credentialsManager.saveCredentials(credentials);
      navigation.replace('ClassProfile', { credentials });
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Class-Based Login" />
      <ScrollView contentContainerStyle={styles.content}>
        <Result title="Error" error={error} result={null} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Web Auth</Text>
          <Button onPress={onLogin} title="Log In" loading={loading} />
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Passwordless OTP (Database Connection)
            </Text>
            <Text style={styles.description}>
              Two-step flow on a database connection with email_otp / phone_otp
              enabled: challenge → verify code.
            </Text>

            <View style={styles.row}>
              <Button
                onPress={() => setOtpMethod('email')}
                title="Email"
                style={[
                  styles.halfButton,
                  otpMethod !== 'email' && styles.inactiveButton,
                ]}
              />
              <Button
                onPress={() => setOtpMethod('phone')}
                title="Phone"
                style={[
                  styles.halfButton,
                  otpMethod !== 'phone' && styles.inactiveButton,
                ]}
              />
            </View>

            {otpMethod === 'email' ? (
              <LabeledInput
                label="Email"
                value={otpEmail}
                onChangeText={setOtpEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            ) : (
              <LabeledInput
                label="Phone Number (E.164, e.g. +15555550123)"
                value={otpPhone}
                onChangeText={setOtpPhone}
                autoCapitalize="none"
                keyboardType="phone-pad"
              />
            )}
            <Button
              onPress={onSendOtpChallenge}
              title="Send Code"
              loading={loading}
            />

            {challenge && (
              <>
                <LabeledInput
                  label="One-Time Code"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                />
                <Button
                  onPress={onLoginWithOtp}
                  title="Log In with Code"
                  loading={loading}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 13, color: '#666', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  halfButton: { flex: 1, minWidth: 0 },
  inactiveButton: { backgroundColor: '#BDBDBD' },
});

export default ClassLoginScreen;
