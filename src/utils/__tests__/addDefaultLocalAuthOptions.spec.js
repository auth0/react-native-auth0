import LocalAuthenticationLevel from '../../credentials-manager/localAuthenticationLevel';
import addDefaultLocalAuthOptions from '../addDefaultLocalAuthOptions';
import LocalAuthenticationStrategy from '../../credentials-manager/localAuthenticationStrategy';

describe('addDefaultLocalAuthenticationOptions', () => {
  it('should return default options when no options are provided', () => {
    const localAuthOptions = { title: 'Please authenticate' };
    const result = addDefaultLocalAuthOptions(localAuthOptions);
    expect(result).toEqual({
      title: 'Please authenticate',
      authenticationLevel: LocalAuthenticationLevel.strong,
      evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
      deviceCredentialFallback: false,
    });
  });

  it('should override default options with provided options', () => {
    const localAuthOptions = {
      title: 'Please authenticate',
      authenticationLevel: LocalAuthenticationLevel.deviceCredential,
      evaluationPolicy: LocalAuthenticationStrategy.deviceOwner,
      deviceCredentialFallback: false,
    };
    const result = addDefaultLocalAuthOptions(localAuthOptions);
    expect(result).toEqual(localAuthOptions);
  });

  it('should merge default options with partially provided options', () => {
    const options = {
      title: 'Please authenticate',
      authenticationLevel: LocalAuthenticationLevel.deviceCredential,
    };
    const result = addDefaultLocalAuthOptions(options);
    expect(result).toEqual({
      title: 'Please authenticate',
      authenticationLevel: LocalAuthenticationLevel.deviceCredential,
      evaluationPolicy: LocalAuthenticationStrategy.deviceOwnerWithBiometrics,
      deviceCredentialFallback: false,
    });
  });
});
