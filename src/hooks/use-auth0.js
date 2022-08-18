import {useContext} from 'react';
import Auth0Context from './auth0-context';

const useAuth0 = () => useContext(Auth0Context);

export default useAuth0;
