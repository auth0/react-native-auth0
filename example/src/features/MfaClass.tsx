import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { MfaFactorType } from 'react-native-auth0';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

// Class-based reference for MFA (Flexible Factors Grant). Same operations as
// MfaHooks.tsx, expressed against the Auth0 class instance. Not imported
// by the app — kept as a side-by-side reference.
const MfaClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [bindingCode, setBindingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [authenticatorId, setAuthenticatorId] = useState('');

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
    <Section title="MFA (Flexible Factors Grant)">
      <TextInput
        placeholder="MFA token (from MFA_REQUIRED error)"
        value={mfaToken}
        onChangeText={setMfaToken}
      />

      <Button
        title="getAuthenticators()"
        onPress={() =>
          run(() =>
            auth0.mfa.getAuthenticators({
              mfaToken,
              factorsAllowed: [
                MfaFactorType.OTP,
                MfaFactorType.SMS,
                MfaFactorType.EMAIL,
                MfaFactorType.PUSH,
                MfaFactorType.VOICE,
              ],
            })
          )
        }
        disabled={!mfaToken}
      />

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Phone number for SMS/Voice enroll (+12025550135)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TextInput
          placeholder="Email for email enroll"
          keyboardType="email-address"
          value={enrollEmail}
          onChangeText={setEnrollEmail}
        />
        <Button
          title="enroll() — OTP (Authenticator App)"
          onPress={() =>
            run(() =>
              auth0.mfa.enroll({ mfaToken, factorType: MfaFactorType.OTP })
            )
          }
          disabled={!mfaToken}
        />
        <Button
          title="enroll() — SMS"
          onPress={() =>
            run(() =>
              auth0.mfa.enroll({
                mfaToken,
                factorType: MfaFactorType.SMS,
                phoneNumber,
              })
            )
          }
          disabled={!mfaToken || !phoneNumber}
        />
        <Button
          title="enroll() — Voice"
          onPress={() =>
            run(() =>
              auth0.mfa.enroll({
                mfaToken,
                factorType: MfaFactorType.VOICE,
                phoneNumber,
              })
            )
          }
          disabled={!mfaToken || !phoneNumber}
        />
        <Button
          title="enroll() — Email"
          onPress={() =>
            run(() =>
              auth0.mfa.enroll({
                mfaToken,
                factorType: MfaFactorType.EMAIL,
                email: enrollEmail,
              })
            )
          }
          disabled={!mfaToken || !enrollEmail}
        />
        <Button
          title="enroll() — Push"
          onPress={() =>
            run(() =>
              auth0.mfa.enroll({ mfaToken, factorType: MfaFactorType.PUSH })
            )
          }
          disabled={!mfaToken}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Authenticator ID (from getAuthenticators)"
          value={authenticatorId}
          onChangeText={setAuthenticatorId}
        />
        <Button
          title="challenge()"
          onPress={() =>
            run(() => auth0.mfa.challenge({ mfaToken, authenticatorId }))
          }
          disabled={!mfaToken || !authenticatorId}
        />
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="OTP code (6-digit, for OTP/TOTP)"
          keyboardType="numeric"
          value={otpCode}
          onChangeText={setOtpCode}
        />
        <TextInput
          placeholder="OOB code (from challenge response)"
          value={oobCode}
          onChangeText={setOobCode}
        />
        <TextInput
          placeholder="Binding code (from SMS/email/push)"
          keyboardType="numeric"
          value={bindingCode}
          onChangeText={setBindingCode}
        />
        <Button
          title="verify() — OTP"
          onPress={() =>
            run(() => auth0.mfa.verify({ mfaToken, otp: otpCode }))
          }
          disabled={!mfaToken || !otpCode}
        />
        <Button
          title="verify() — OOB"
          onPress={() =>
            run(() =>
              auth0.mfa.verify({
                mfaToken,
                oobCode,
                bindingCode: bindingCode || undefined,
              })
            )
          }
          disabled={!mfaToken || !oobCode}
        />
      </View>

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default MfaClass;
