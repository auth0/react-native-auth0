import A0Auth0 from './auth0';

const mock = {};

mock.NativeModules = { A0Auth0: new A0Auth0() };
mock.Platform = { OS: 'test-os' };

module.exports = mock;
