import type { User } from '../types';
import type { AuthError } from '../core/models';
import { deepEqual } from '../core/utils/deepEqual';

/**
 * The shape of the authentication state managed by the Auth0Provider.
 */
export interface AuthState {
  user: User | null;
  error: AuthError | null;
  isLoading: boolean;
}

/**
 * The possible actions that can be dispatched to update the authentication state.
 * @internal
 */
export type AuthAction =
  | { type: 'LOGIN_COMPLETE'; user: User }
  | { type: 'LOGOUT_COMPLETE' }
  | { type: 'ERROR'; error: AuthError }
  | { type: 'INITIALIZED'; user: User | null }
  | { type: 'SET_USER'; user: User | null };

/**
 * A pure function that calculates the new state based on the previous state and a dispatched action.
 * @internal
 */
export const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_COMPLETE':
      return { ...state, error: null, isLoading: false, user: action.user };
    case 'LOGOUT_COMPLETE':
      return { ...state, error: null, user: null };
    case 'ERROR':
      return { ...state, isLoading: false, error: action.error };
    case 'INITIALIZED':
      return { ...state, isLoading: false, user: action.user };
    case 'SET_USER':
      if (deepEqual(state.user, action.user)) {
        return state;
      }
      return { ...state, user: action.user };
  }
};
