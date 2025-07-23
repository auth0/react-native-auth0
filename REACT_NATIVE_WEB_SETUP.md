# React Native Web Configuration Guide

This guide provides instructions for using React Native Auth0 with React Native Web.

## What is React Native Web?

React Native Web is a library that provides React Native components and APIs that are compatible with React and the web. It allows you to write your application once using React Native and run it on iOS, Android, and web platforms.

**Official React Native Web Repository:** https://github.com/necolas/react-native-web

## Setup Instructions

If you want to use React Native Web with React Native Auth0, follow these steps:

### 1. Install React Native Web

Follow the official React Native Web installation guide:
**https://necolas.github.io/react-native-web/docs/setup/**

### 2. Install Auth0 SPA JS (Required for Web)

React Native Auth0 requires `@auth0/auth0-spa-js` for web platform support:

```bash
# Using npm
npm install @auth0/auth0-spa-js

# Using yarn
yarn add @auth0/auth0-spa-js
```

### 3. Use React Native Auth0

Once React Native Web and Auth0 SPA JS are installed, you can use React Native Auth0 exactly as you would in a native React Native app. The library will automatically detect the web platform and use the appropriate implementation.

---

## 🔁 Web Callback and Logout URL Setup

When running on Web—especially with **Expo** or custom Webpack servers—you must configure **callback** and **logout URLs** in your [Auth0 Application settings](https://manage.auth0.com/#/applications):

### ✅ For local development (Expo or Metro)

Add the following URLs:

* **Allowed Callback URLs**:
  `http://localhost:8081`

* **Allowed Logout URLs**:
  `http://localhost:8081`

> ⚠️ If you've customized your Webpack Dev Server port (e.g., `3000`), replace `8081` accordingly.

---

## Example Usage

```jsx
import React from 'react';
import { Auth0Provider } from 'react-native-auth0';

const App = () => (
  <Auth0Provider domain="YOUR_AUTH0_DOMAIN" clientId="YOUR_AUTH0_CLIENT_ID">
    {/* Your app components */}
  </Auth0Provider>
);

export default App;
```

## Resources

- **React Native Web Setup Guide**: https://necolas.github.io/react-native-web/docs/setup/
- **React Native Web GitHub**: https://github.com/necolas/react-native-web
- **Auth0 SPA JS**: https://github.com/auth0/auth0-spa-js
- **React Native Auth0 Documentation**: https://auth0.github.io/react-native-auth0/

## Notes

- React Native Auth0 automatically detects when running on web and uses the Auth0 SPA JS library under the hood
- All React Native Auth0 APIs work the same across platforms (iOS, Android, and Web)
- For web-specific examples, see the [EXAMPLES-WEB.md](https://github.com/auth0/react-native-auth0/blob/master/EXAMPLES-WEB.md) file in this repository
