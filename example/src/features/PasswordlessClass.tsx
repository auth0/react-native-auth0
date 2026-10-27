import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import type { PasswordlessChallenge } from 'react-native-auth0';
import auth0 from '../shared/api';
import Section from '../shared/Section';
import ResultView from '../shared/ResultView';

// Class-based reference for Passwordless. Same operations as
// PasswordlessHooks.tsx, expressed against the Auth0 class instance. Not
// imported by the app — kept as a side-by-side reference.
const PasswordlessClass = () => {
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challenge, setChallenge] = useState<PasswordlessChallenge | null>(
    null
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
    <Section title="Passwordless (Native only)">
      {/* Email code flow */}
      <View style={{ gap: 8 }}>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <Button
          title="auth.passwordlessWithEmail(code)"
          onPress={() =>
            run(() => auth0.auth.passwordlessWithEmail({ email, send: 'code' }))
          }
          disabled={!email}
        />
        <TextInput
          placeholder="Code from email"
          value={emailCode}
          onChangeText={setEmailCode}
          keyboardType="numeric"
        />
        <Button
          title="auth.loginWithEmail()"
          onPress={() =>
            run(() => auth0.auth.loginWithEmail({ email, code: emailCode }))
          }
          disabled={!email || !emailCode}
        />
      </View>

      {/* SMS code flow */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <TextInput
          placeholder="Phone number (E.164)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button
          title="auth.passwordlessWithSMS(code)"
          onPress={() =>
            run(() =>
              auth0.auth.passwordlessWithSMS({ phoneNumber, send: 'code' })
            )
          }
          disabled={!phoneNumber}
        />
        <TextInput
          placeholder="Code from SMS"
          value={smsCode}
          onChangeText={setSmsCode}
          keyboardType="numeric"
        />
        <Button
          title="auth.loginWithSMS()"
          onPress={() =>
            run(() => auth0.auth.loginWithSMS({ phoneNumber, code: smsCode }))
          }
          disabled={!phoneNumber || !smsCode}
        />
      </View>

      {/* DB connection OTP flow (passwordless.*) */}
      <View style={{ marginTop: 12, gap: 8 }}>
        <Button
          title="passwordless.challengeWithEmail()"
          onPress={() =>
            run(async () => {
              const ch = await auth0.passwordless.challengeWithEmail({
                email,
                connection: 'Username-Password-Authentication',
                allowSignup: true,
              });
              setChallenge(ch);
              return ch;
            })
          }
          disabled={!email}
        />
        <Button
          title="passwordless.challengeWithPhoneNumber()"
          onPress={() =>
            run(async () => {
              const ch = await auth0.passwordless.challengeWithPhoneNumber({
                phoneNumber,
                connection: 'Username-Password-Authentication',
                deliveryMethod: 'text',
                allowSignup: true,
              });
              setChallenge(ch);
              return ch;
            })
          }
          disabled={!phoneNumber}
        />
        <TextInput
          placeholder="OTP code (DB connection)"
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="numeric"
        />
        <Button
          title="passwordless.loginWithOTP()"
          onPress={() =>
            run(() =>
              auth0.passwordless.loginWithOTP({
                challenge: challenge!,
                otp: otpCode,
              })
            )
          }
          disabled={!challenge || !otpCode}
        />
      </View>

      <ResultView result={result} error={error} />
    </Section>
  );
};

export default PasswordlessClass;
