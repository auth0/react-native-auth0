jest.mock('react-native');
import Agent from '../agent';
import { NativeModules, Linking } from 'react-native';
const A0Auth0 = NativeModules.A0Auth0;

describe('Agent', () => {
  const agent = new Agent();

  const callbackScheme = 'callback';
  const url = 'https://auth0.com';
  const authorizeUrl = 'https://auth0.com/authorize';

  describe('show', () => {

    describe('allowAuthenticationSession = false', () => {
    
      beforeEach(() => {
        NativeModules.A0Auth0 = A0Auth0;
        A0Auth0.reset();
      });

      it('should fail if native module is not linked', async () => {
        NativeModules.A0Auth0 = undefined;
        expect.assertions(1);
        await expect(agent.show({ url, callbackScheme })).rejects.toMatchSnapshot();
      });

      describe('complete web flow', () => {
        beforeEach(() => {
          A0Auth0.onUrl = () => {
            Linking.emitter.emit('url', { url });
          };
        });

        it('should call the correct method', async () => {
          await agent.show({ url, callbackScheme })
          expect(A0Auth0.showUrlCalled).toBeTruthy();
          expect(A0Auth0.showAuthorizationCalled).toBeFalsy();
        });

        it('should resolve promise with url result', async () => {
          expect.assertions(1);
          await expect(agent.show({ url, callbackScheme })).resolves.toMatchSnapshot();
        });

        it('should show initial url', async () => {
          expect.assertions(1);
          await agent.show({ url: authorizeUrl, callbackScheme });
          expect(A0Auth0.url).toEqual(authorizeUrl);
        });
      });

      describe('listeners', () => {

        it('should register url listeners', () => {
          A0Auth0.onUrl = () => {};
          agent.show({ url: authorizeUrl, callbackScheme });
          expect(Linking.emitter.listenerCount('url')).toEqual(1);
        });

        it('should remove url listeners when done', async () => {
          A0Auth0.onUrl = () => {
            Linking.emitter.emit('url', { url });
          };
          expect.assertions(1);
          await agent.show({ url: authorizeUrl, callbackScheme });
          expect(Linking.emitter.listenerCount('url')).toEqual(0);
        });

        it('should remove url listeners when load fails', async () => {
          expect.assertions(1);
          A0Auth0.error = new Error('failed to load');
          await agent.show({ url: authorizeUrl, callbackScheme }).catch((err) => Promise.resolve(err));
          expect(Linking.emitter.listenerCount('url')).toEqual(0);
        });

        it('should remove url listeners on first load', async () => {
          expect.assertions(1);
          await agent.show({ url: authorizeUrl, callbackScheme, closeOnLoad: true });
          expect(Linking.emitter.listenerCount('url')).toEqual(0);
        });

      });

      describe('failed flow', () => {

        it('should reject with error', async () => {
          expect.assertions(1);
          A0Auth0.error = new Error('failed to load');
          await expect(agent.show({ url, callbackScheme })).rejects.toMatchSnapshot();
        });

      });
    });

    describe('allowAuthenticationSession = true', () => {

      beforeEach(() => {
        NativeModules.A0Auth0 = A0Auth0;
        A0Auth0.reset();
      });

      it('should fail if native module is not linked', async () => {
        NativeModules.A0Auth0 = undefined;
        expect.assertions(1);
        await expect(agent.show({
          url,
          callbackScheme,
          allowAuthenticationSession: true
        })).rejects.toMatchSnapshot();
      });

      describe('complete authorization flow', () => {
        beforeEach(() => {
          A0Auth0.callbackUrl = url;
        });

        it('should call the correct method', async () => {
          await agent.show({
            url,
            callbackScheme,
            allowAuthenticationSession: true
          })
          expect(A0Auth0.showAuthorizationCalled).toBeTruthy();
          expect(A0Auth0.showUrlCalled).toBeFalsy();
        });

        it('should resolve promise with url result', async () => {
          expect.assertions(1);
          await expect(agent.show({
            url: authorizeUrl,
            callbackScheme,
            allowAuthenticationSession: true
          })).resolves.toMatchSnapshot();
        });

        it('should show initial url', async () => {
          expect.assertions(1);
          await agent.show({
            url: authorizeUrl,
            callbackScheme,
            allowAuthenticationSession: true
          });
          expect(A0Auth0.url).toEqual(authorizeUrl);
        });
      });

      describe('failed flow', () => {

        it('should reject with error', async () => {
          expect.assertions(1);
          A0Auth0.error = new Error('failed to load');
          await expect(agent.show({
            url,
            callbackScheme,
            allowAuthenticationSession: true
          })).rejects.toMatchSnapshot();
        });

      });
    });
  });

  describe('newTransaction', () => {
    
    it('should call native integration', async () => {
      const parameters = {state: 'state'};
      A0Auth0.parameters = parameters;
      expect.assertions(1);
      await expect(agent.newTransaction()).resolves.toMatchSnapshot();
    });

    it('should fail if native module is not linked', async () => {
      NativeModules.A0Auth0 = undefined;
      expect.assertions(1);
      await expect(agent.newTransaction()).rejects.toMatchSnapshot();
    });

  });
});
