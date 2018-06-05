import Linking from './linking';
import A0Auth0 from './auth0';

const mock = {};

mock.Linking = new Linking();
mock.NativeModules = { A0Auth0: new A0Auth0() };
mock.Platform = { OS: "ios", Version: 11.1 };

module.exports = mock;