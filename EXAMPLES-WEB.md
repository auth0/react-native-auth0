# React Native Auth0 for Web: Examples

This guide provides usage examples specifically for developers targeting **React Native Web**. The web platform uses the underlying `@auth0/auth0-spa-js` library, and its features are aligned with browser security best practices.

## Setup: The `Auth0Provider`

All web-based authentication starts with wrapping your application in the `Auth0Provider`. You can also pass `auth0-spa-js` specific options.

```jsx
// App.js
import { Auth0Provider } from 'react-native-auth0';

const App = () => {
  return (
    <Auth0Provider
      domain="YOUR_AUTH0_DOMAIN"
      clientId="YOUR_AUTH0_CLIENT_ID"
      // Optional spa-js specific settings
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <YourAppRoot />
    </Auth0Provider>
  );
};

export default App;
```

## Basic Login and Logout

Use the `useAuth0` hook to access authentication methods and state. The primary flow involves redirecting the user to the Auth0 Universal Login page.

```jsx
import { useAuth0 } from 'react-native-auth0';
import { View, Button, Text } from 'react-native';

const LoginProfile = () => {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();

  const onLogin = async () => {
    try {
      // This will redirect the user to the login page.
      // The promise does not resolve as the page context is lost.
      await authorize({ scope: 'openid profile email' });
    } catch (e) {
      console.log('Login cancelled or failed', e);
    }
  };

  const onLogout = async () => {
    try {
      // This will redirect the user to the logout page.
      await clearSession();
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      {user && (
        <>
          <Text>Logged in as {user.name}</Text>
          <Button onPress={onLogout} title="Log Out" />
        </>
      )}
      {!user && <Button onPress={onLogin} title="Log In" />}
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
    </View>
  );
};
```

## Accessing User Information and Tokens

After a user is logged in, you can access their profile from the `user` object. To get a fresh access token for calling a protected API, use `getCredentials`.

```jsx
import { useAuth0 } from 'react-native-auth0';

const Profile = () => {
  const { user } = useAuth0();
  return user ? <Text>Welcome, {user.name}!</Text> : null;
};

const ApiButton = () => {
  const { getCredentials } = useAuth0();

  const callApi = async () => {
    try {
      // getCredentials uses getTokenSilently() from auth0-spa-js
      // to get a valid token, refreshing it if necessary.
      const credentials = await getCredentials();
      const accessToken = credentials.accessToken;

      const response = await fetch('https://api.example.com/data', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      console.log('API Data:', data);
    } catch (e) {
      console.error('Failed to get token or call API', e);
    }
  };

  return <Button onPress={callApi} title="Call Protected API" />;
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

```

```
