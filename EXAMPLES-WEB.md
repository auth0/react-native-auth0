# React Native Auth0 for Web: Examples

This guide provides usage examples specifically for developers targeting **React Native Web**. The web platform uses the underlying `@auth0/auth0-spa-js` library, and its features are aligned with browser security best practices.

## 1. The Hooks-Based Approach (Recommended)

This is the simplest and recommended way to integrate Auth0. The `Auth0Provider` handles all the complexity of the redirect flow automatically.

### Step 1: Wrap Your App in the `Auth0Provider`

In your main application entry point (e.g., `App.tsx`), wrap your application with the provider.

```jsx
// src/App.tsx
import React from 'react';
import { Auth0Provider } from 'react-native-auth0';
import config from './auth0-configuration';
import MainComponent from './MainComponent'; // Your main app UI

const App = () => (
  <Auth0Provider domain={config.domain} clientId={config.clientId}>
    <MainComponent />
  </Auth0Provider>
);

export default App;
```

### Step 2: Use the `useAuth0` Hook in Your Components

The `Auth0Provider` will automatically handle the redirect callback when your app loads. The `useAuth0` hook will then provide the authentication state.

```jsx
// src/MainComponent.tsx
import React from 'react';
import { useAuth0 } from 'react-native-auth0';
import { View, Button, Text, ActivityIndicator } from 'react-native';

const MainComponent = () => {
  const { authorize, clearSession, user, isLoading, error } = useAuth0();

  const onLogin = async () => {
    try {
      // This triggers a redirect to the Auth0 Universal Login page.
      await authorize({ scope: 'openid profile email' });
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      {error && <Text>Error: {error.message}</Text>}
      {user ? (
        <>
          <Text>Welcome, {user.name}!</Text>
          <Button title="Log Out" onPress={onLogout} />
        </>
      ) : (
        <Button title="Log In" onPress={onLogin} />
      )}
    </View>
  );
};
```

## 2. The Class-Based / Manual Approach

If you are not using React Hooks or need more fine-grained control, you can instantiate the `Auth0` class and handle the redirect callback manually.

### Step 1: Instantiate the `Auth0` Client

Create a singleton instance of the client.

```javascript
// src/api/auth0.ts
import Auth0 from 'react-native-auth0';
import config from '../auth0-configuration';

const auth0 = new Auth0({
  domain: config.domain,
  clientId: config.clientId,
});

export default auth0;
```

### Step 2: Handle the Redirect Callback

In your application's root component or entry point, you need to add logic to process the result from Auth0 after the user is redirected back.

```jsx
// src/App.tsx
import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import auth0 from './api/auth0'; // Import your singleton
import type { User } from 'react-native-auth0';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Check if the URL contains redirect parameters
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        try {
          // Process the redirect
          await auth0.webAuth.handleRedirectCallback();
        } catch (e) {
          console.error(e);
        }
        // Clean the URL
        window.history.replaceState({}, document.title, '/');
      }

      // After handling a potential redirect, check for an existing session
      try {
        const credentials = await auth0.credentialsManager.getCredentials();
        // Assuming you have a way to decode the idToken to get the user
        // const decodedUser = jwt_decode(credentials.idToken);
        // setUser(decodedUser);
      } catch (e) {
        // No credentials, user is not logged in
        setUser(null);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const onLogin = async () => {
    await auth0.webAuth.authorize({ scope: 'openid profile email' });
  };

  const onLogout = async () => {
    await auth0.webAuth.clearSession();
  };

  // ... Render UI based on isLoading and user state ...
};
```

## Unsupported Web Features

For security reasons, the web platform **does not support** direct authentication grants. The following methods from the `auth` provider will throw a `NotImplemented` error:

- `auth.passwordRealm()`
- `auth.loginWithOTP()`
- `auth.loginWithSMS()`
- `auth.loginWithEmail()`
- `auth.refreshToken()`

All these flows should be configured in your [Auth0 Universal Login](https://auth0.com/docs/universal-login) page and initiated via the `authorize()` method.
