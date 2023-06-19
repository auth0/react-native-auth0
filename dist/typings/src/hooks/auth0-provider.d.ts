import React, { PropsWithChildren } from 'react';
/**
 * Provides the Auth0Context to its child components.
 *
 * ```html
 * <Auth0Provider domain="YOUR AUTH0 DOMAIN" clientId="YOUR CLIENT ID">
 *   <App />
 * </Auth0Provider>
 * ```
 */
declare const Auth0Provider: ({
  domain,
  clientId,
  children,
}: React.PropsWithChildren<{
  domain: string;
  clientId: string;
}>) => React.JSX.Element;
export default Auth0Provider;
