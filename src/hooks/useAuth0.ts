import { useContext } from 'react';
import { Auth0Context, type Auth0ContextInterface } from './Auth0Context';

/**
 * The primary hook for interacting with the Auth0 SDK in a React component.
 *
 * It provides access to the authentication state (`user`, `error`, `isLoading`)
 * and methods for performing authentication (`authorize`, `clearSession`, etc.).
 *
 * @example
 * ```
 * const { user, authorize, clearSession, isLoading } = useAuth0();
 * ```
 *
 * @returns The current authentication state and methods.
 */
export const useAuth0 = (): Auth0ContextInterface => {
  const context = useContext(Auth0Context);
  return context;
};
