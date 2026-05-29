import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import {
  useAuth0,
  MyAccountError,
  MyAccountErrorCodes,
  PasskeyError,
  PasskeyErrorCodes,
  PreferredAuthenticationMethods,
} from 'react-native-auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import Result from '../../components/Result';
import { createPasskey } from '../../passkey/PasskeyModule';
import config from '../../auth0-configuration';

const MyAccountScreen = () => {
  const { getApiCredentials, myAccount } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<object | null>(null);
  const [apiError, setApiError] = useState<Error | null>(null);
  const [challengeState, setChallengeState] = useState<{
    authenticationMethodId: string;
    authSession: string;
    authParamsPublicKey: Record<string, any>;
  } | null>(null);
  const [enrollmentState, setEnrollmentState] = useState<{
    id: string;
    authSession: string;
  } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [methodId, setMethodId] = useState('');
  const [methodName, setMethodName] = useState('');

  const handleError = (e: any) => {
    if (e instanceof PasskeyError) {
      switch (e.type) {
        case PasskeyErrorCodes.USER_CANCELLED:
          Alert.alert('Cancelled', 'You dismissed the passkey prompt.');
          break;
        case PasskeyErrorCodes.NOT_AVAILABLE:
          Alert.alert(
            'Not Available',
            'Passkeys are not supported on this device.'
          );
          break;
        default:
          Alert.alert('Passkey Error', `[${e.type}] ${e.message}`);
      }
    } else if (e instanceof MyAccountError) {
      switch (e.type) {
        case MyAccountErrorCodes.ENROLLMENT_FAILED:
          Alert.alert('Enrollment Failed', e.message);
          break;
        case MyAccountErrorCodes.VERIFICATION_FAILED:
          Alert.alert('Verification Failed', e.message);
          break;
        case MyAccountErrorCodes.UNAUTHORIZED:
          Alert.alert('Unauthorized', e.message);
          break;
        default:
          Alert.alert('My Account Error', `[${e.type}] ${e.message}`);
      }
    } else {
      Alert.alert('Error', (e as Error).message);
    }
    setApiError(e as Error);
  };

  const getMyAccountAccessToken = async (): Promise<string> => {
    const credentials = await getApiCredentials(
      `https://${config.domain}/me/`,
      'read:me:authentication_methods delete:me:authentication_methods update:me:authentication_methods read:me:factors create:me:authentication_methods'
    );
    return credentials.accessToken;
  };

  // --- Passkey Enrollment ---

  const onPasskeyEnrollmentChallenge = async () => {
    setApiError(null);
    setApiResult(null);
    setChallengeState(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const challenge = await myAccount.passkeyEnrollmentChallenge({
        accessToken,
      });

      setChallengeState(challenge);
      setApiResult({
        step: 'passkeyEnrollmentChallenge',
        authenticationMethodId: challenge.authenticationMethodId,
        authSession: challenge.authSession,
      });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const onPasskeyEnrollmentVerify = async () => {
    if (!challengeState) {
      Alert.alert('Error', 'Run Enrollment Challenge first.');
      return;
    }

    setApiError(null);
    setLoading(true);
    try {
      const credentialJson = await createPasskey(
        challengeState.authParamsPublicKey
      );

      const accessToken = await getMyAccountAccessToken();
      const method = await myAccount.enrollPasskey({
        accessToken,
        authenticationMethodId: challengeState.authenticationMethodId,
        authSession: challengeState.authSession,
        authResponse: credentialJson,
        authParamsPublicKey: challengeState.authParamsPublicKey,
      });

      setChallengeState(null);
      setApiResult({
        step: 'passkeyEnrollmentVerify',
        id: method.id,
        type: method.type,
        keyId: method.keyId,
        credentialDeviceType: method.credentialDeviceType,
        credentialBackedUp: method.credentialBackedUp,
        relyingPartyId: method.relyingPartyId,
        createdAt: method.createdAt,
      });
      Alert.alert('Success', 'Passkey enrolled successfully!');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Phone Enrollment ---

  const onEnrollPhone = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }
    setApiError(null);
    setApiResult(null);
    setEnrollmentState(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const challenge = await myAccount.enrollPhone({
        accessToken,
        phoneNumber: phoneNumber.trim(),
        preferredAuthenticationMethod: PreferredAuthenticationMethods.SMS,
      });
      setEnrollmentState(challenge);
      setApiResult({ step: 'enrollPhone', ...challenge });
      Alert.alert('OTP Sent', 'Check your phone for the verification code.');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Email Enrollment ---

  const onEnrollEmail = async () => {
    if (!emailAddress.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }
    setApiError(null);
    setApiResult(null);
    setEnrollmentState(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const challenge = await myAccount.enrollEmail({
        accessToken,
        emailAddress: emailAddress.trim(),
      });
      setEnrollmentState(challenge);
      setApiResult({ step: 'enrollEmail', ...challenge });
      Alert.alert('OTP Sent', 'Check your email for the verification code.');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- TOTP Enrollment ---

  const onEnrollTOTP = async () => {
    setApiError(null);
    setApiResult(null);
    setEnrollmentState(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const challenge = await myAccount.enrollTOTP({ accessToken });
      setEnrollmentState({
        id: challenge.id,
        authSession: challenge.authSession,
      });
      setApiResult({
        step: 'enrollTOTP',
        id: challenge.id,
        barcodeUri: challenge.barcodeUri,
        manualInputCode: challenge.manualInputCode,
      });
      Alert.alert(
        'TOTP Enrolled',
        'Scan the QR code with your authenticator app, then confirm with OTP.'
      );
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Recovery Code Enrollment ---

  const onEnrollRecoveryCode = async () => {
    setApiError(null);
    setApiResult(null);
    setEnrollmentState(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const challenge = await myAccount.enrollRecoveryCode({ accessToken });
      setEnrollmentState({
        id: challenge.id,
        authSession: challenge.authSession,
      });
      setApiResult({
        step: 'enrollRecoveryCode',
        id: challenge.id,
        recoveryCode: challenge.recoveryCode,
      });
      Alert.alert(
        'Recovery Code',
        `Store this code securely: ${challenge.recoveryCode}`
      );
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Confirm Enrollment with OTP ---

  const onConfirmEnrollment = async () => {
    if (!enrollmentState) {
      Alert.alert('Error', 'Start an enrollment first.');
      return;
    }
    if (!otpCode.trim()) {
      Alert.alert('Error', 'Please enter the OTP code.');
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const method = await myAccount.confirmPhoneEnrollment({
        accessToken,
        id: enrollmentState.id,
        authSession: enrollmentState.authSession,
        otpCode: otpCode.trim(),
      });
      setEnrollmentState(null);
      setOtpCode('');
      setApiResult({ step: 'confirmEnrollment', ...method });
      Alert.alert('Success', 'Enrollment confirmed!');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Confirm Recovery Code Enrollment ---

  const onConfirmRecoveryCode = async () => {
    if (!enrollmentState) {
      Alert.alert('Error', 'Start a recovery code enrollment first.');
      return;
    }
    setApiError(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const method = await myAccount.confirmRecoveryCodeEnrollment({
        accessToken,
        id: enrollmentState.id,
        authSession: enrollmentState.authSession,
      });
      setEnrollmentState(null);
      setApiResult({ step: 'confirmRecoveryCode', ...method });
      Alert.alert('Success', 'Recovery code enrollment confirmed!');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Get Factors ---

  const onGetFactors = async () => {
    setApiError(null);
    setApiResult(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const factors = await myAccount.getFactors({ accessToken });
      setApiResult({ step: 'getFactors', factors });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Get Authentication Methods ---

  const onGetAuthenticationMethods = async () => {
    setApiError(null);
    setApiResult(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const methods = await myAccount.getAuthenticationMethods({ accessToken });
      setApiResult({
        step: 'getAuthenticationMethods',
        count: methods.length,
        methods,
      });
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Update Authentication Method ---

  const onUpdateAuthenticationMethod = async () => {
    if (!methodId.trim()) {
      Alert.alert('Error', 'Please enter an authentication method ID.');
      return;
    }
    setApiError(null);
    setApiResult(null);
    setLoading(true);
    try {
      const accessToken = await getMyAccountAccessToken();
      const method = await myAccount.updateAuthenticationMethod({
        accessToken,
        id: methodId.trim(),
        name: methodName.trim() || undefined,
      });
      setApiResult({ step: 'updateAuthenticationMethod', ...method });
      Alert.alert('Success', 'Authentication method updated!');
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Authentication Method ---

  const onDeleteAuthenticationMethod = async () => {
    if (!methodId.trim()) {
      Alert.alert('Error', 'Please enter an authentication method ID.');
      return;
    }
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete method ${methodId.trim()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setApiError(null);
            setApiResult(null);
            setLoading(true);
            try {
              const accessToken = await getMyAccountAccessToken();
              await myAccount.deleteAuthenticationMethod({
                accessToken,
                id: methodId.trim(),
              });
              setApiResult({
                step: 'deleteAuthenticationMethod',
                deleted: methodId.trim(),
              });
              setMethodId('');
              Alert.alert('Success', 'Authentication method deleted!');
            } catch (e) {
              handleError(e);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="My Account" />
        <View style={styles.content}>
          <Text style={styles.description}>
            My Account API is only available on native platforms.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Account" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Manage authentication methods for the currently authenticated user via
          the My Account API.
        </Text>

        <Result title="Result" result={apiResult} error={apiError} />

        <Section title="Passkey Enrollment">
          <Button
            onPress={onPasskeyEnrollmentChallenge}
            title="1. Passkey Challenge"
            loading={loading}
          />
          <Button
            onPress={onPasskeyEnrollmentVerify}
            title="2. Create & Verify Passkey"
            loading={loading}
            disabled={!challengeState}
          />
        </Section>

        <Section title="Phone Enrollment">
          <TextInput
            style={styles.input}
            placeholder="+1234567890"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Button
            onPress={onEnrollPhone}
            title="Enroll Phone"
            loading={loading}
          />
        </Section>

        <Section title="Email Enrollment">
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            onPress={onEnrollEmail}
            title="Enroll Email"
            loading={loading}
          />
        </Section>

        <Section title="TOTP Enrollment">
          <Button
            onPress={onEnrollTOTP}
            title="Enroll TOTP"
            loading={loading}
          />
        </Section>

        <Section title="Recovery Code Enrollment">
          <Button
            onPress={onEnrollRecoveryCode}
            title="Enroll Recovery Code"
            loading={loading}
          />
          <Button
            onPress={onConfirmRecoveryCode}
            title="Confirm Recovery Code"
            loading={loading}
            disabled={!enrollmentState}
          />
        </Section>

        <Section title="Confirm with OTP">
          <Text style={styles.sectionDescription}>
            After enrolling phone, email, or TOTP, confirm with the OTP code.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP code"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
          />
          <Button
            onPress={onConfirmEnrollment}
            title="Confirm Enrollment"
            loading={loading}
            disabled={!enrollmentState}
          />
        </Section>

        <Section title="Query">
          <Button
            onPress={onGetFactors}
            title="Get Factors"
            loading={loading}
          />
          <Button
            onPress={onGetAuthenticationMethods}
            title="Get Authentication Methods"
            loading={loading}
          />
        </Section>

        <Section title="Update / Delete">
          <Text style={styles.sectionDescription}>
            Enter an authentication method ID to update or delete it.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Authentication Method ID"
            value={methodId}
            onChangeText={setMethodId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="New name (optional, for update)"
            value={methodName}
            onChangeText={setMethodName}
          />
          <Button
            onPress={onUpdateAuthenticationMethod}
            title="Update Method"
            loading={loading}
          />
          <Button
            onPress={onDeleteAuthenticationMethod}
            title="Delete Method"
            loading={loading}
          />
        </Section>

        {enrollmentState && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Pending Enrollment:</Text>
            <Text style={styles.resultValue}>
              id: {enrollmentState.id}
              {'\n'}authSession: {enrollmentState.authSession.substring(0, 20)}
              ...
            </Text>
          </View>
        )}
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
  content: { padding: 16, gap: 16 },
  description: { fontSize: 14, color: '#666', textAlign: 'center' },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  sectionDescription: { fontSize: 13, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  resultBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  resultLabel: { fontSize: 12, fontWeight: '600', color: '#333' },
  resultValue: { fontSize: 11, color: '#555', fontFamily: 'monospace' },
});

export default MyAccountScreen;
