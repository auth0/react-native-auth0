import LocalAuthenticationOptions from '../credentials-manager/localAuthenticationOptions';
import LocalAuthenticationStrategy from '../credentials-manager/localAuthenticationStrategy';
import LocalAuthenticationLevel from '../credentials-manager/localAuthenticationLevel';

const defaultLocalAuthOptions = {
  evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
  authenticationLevel: LocalAuthenticationLevel.strong,
  deviceCredentialFallback: false,
};

function addDefaultLocalAuthOptions(
  localAuthenticationOptions: LocalAuthenticationOptions
): LocalAuthenticationOptions {
  return {
    ...defaultLocalAuthOptions,
    ...localAuthenticationOptions,
  };
}

export default addDefaultLocalAuthOptions;
