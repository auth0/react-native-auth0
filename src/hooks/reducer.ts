import { User } from '../types';
import { deepEqual } from '../utils/deepEqual';
import { AuthState } from './auth0-context';

type Action =
  | { type: 'LOGIN_COMPLETE'; user: User }
  | { type: 'LOGOUT_COMPLETE' }
  | { type: 'ERROR'; error: Error }
  | { type: 'INITIALIZED'; user: User | null }
  | { type: 'SET_USER'; user: User };

/**
 * @ignore
 */
const reducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case 'LOGIN_COMPLETE':
      return { ...state, error: null, user: action.user };

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

export default reducer;
