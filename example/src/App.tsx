import React from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Auth0Provider } from 'react-native-auth0';
import config from './auth0-configuration';

import WebAuthHooks from './features/WebAuthHooks';
import CredentialsHooks from './features/CredentialsHooks';
import DirectAuthHooks from './features/DirectAuthHooks';
import PasswordlessHooks from './features/PasswordlessHooks';
import MfaHooks from './features/MfaHooks';
import MyAccountHooks from './features/MyAccountHooks';
import PasskeysHooks from './features/PasskeysHooks';
import AdvancedTokensHooks from './features/AdvancedTokensHooks';

// Native example app. Every feature is demonstrated with the hooks approach
// (wired up below). A matching *Class.tsx file sits next to each feature file
// showing the same feature with the Auth0 class instance as unused reference.
//
// Biometric-protected credentials can be enabled by passing
// localAuthenticationOptions to Auth0Provider, e.g.:
//   <Auth0Provider domain={...} clientId={...} localAuthenticationOptions={{
//     title: 'Authenticate', evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
//   }}>
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <Auth0Provider domain={config.domain} clientId={config.clientId}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              react-native-auth0 example
            </Text>
            <WebAuthHooks />
            <CredentialsHooks />
            <DirectAuthHooks />
            <PasswordlessHooks />
            <MfaHooks />
            <MyAccountHooks />
            <PasskeysHooks />
            <AdvancedTokensHooks />
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Auth0Provider>
    </SafeAreaProvider>
  );
}

export default App;
