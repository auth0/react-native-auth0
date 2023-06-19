var LocalAuthenticationStrategy;
(function (LocalAuthenticationStrategy) {
  LocalAuthenticationStrategy[
    (LocalAuthenticationStrategy['deviceOwnerWithBiometrics'] = 1)
  ] = 'deviceOwnerWithBiometrics';
  LocalAuthenticationStrategy[
    (LocalAuthenticationStrategy['deviceOwner'] = 2)
  ] = 'deviceOwner';
})(LocalAuthenticationStrategy || (LocalAuthenticationStrategy = {}));
export default LocalAuthenticationStrategy;
