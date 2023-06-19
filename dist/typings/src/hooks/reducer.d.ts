import { User } from '../types';
import { AuthState } from './auth0-context';
declare type Action =
  | {
      type: 'LOGIN_COMPLETE';
      user: User;
    }
  | {
      type: 'LOGOUT_COMPLETE';
    }
  | {
      type: 'ERROR';
      error: Error;
    }
  | {
      type: 'INITIALIZED';
      user: User | null;
    }
  | {
      type: 'SET_USER';
      user: User;
    };
/**
 * @ignore
 */
declare const reducer: (state: AuthState, action: Action) => AuthState;
export default reducer;
