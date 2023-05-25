jest.mock('react-native');
import Agent from '../agent';
import {NativeModules, Linking, Platform} from 'react-native';
const A0Auth0 = NativeModules.A0Auth0;

describe('Agent', () => {
  const agent = new Agent();

  describe('show', () => {
    beforeEach(() => {
      NativeModules.A0Auth0 = A0Auth0;
      Linking.removeAllListeners();
      A0Auth0.reset();
      A0Auth0.onUrl = () => {
        Linking.emitter.emit('url', {url: 'https://auth0.com'});
      };
    });

    it('should fail if native module is not linked', async () => {
      NativeModules.A0Auth0 = undefined;
      expect.assertions(1);
      await expect(agent.show('https://auth0.com')).rejects.toMatchSnapshot();
    });

    describe('complete web flow', () => {
      it('should resolve promise with url result', async () => {
        expect.assertions(1);
        await expect(
          agent.show('https://auth0.com'),
        ).resolves.toMatchSnapshot();
      });

      it('should show initial url', async () => {
        expect.assertions(1);
        const url = 'https://auth0.com/authorize';
        await agent.show(url);
        expect(A0Auth0.url).toEqual(url);
      });

      it('should not pass ephemeral session parameter', async () => {
        Platform.OS = 'android';
        expect.assertions(1);
        const url = 'https://auth0.com';
        await agent.show(url);
        expect(A0Auth0.ephemeralSession).toEqual(false);
      });

      it('should not use ephemeral session by default', async () => {
        Platform.OS = 'ios';
        expect.assertions(1);
        const url = 'https://auth0.com';
        await agent.show(url);
        expect(A0Auth0.ephemeralSession).toEqual(false);
      });

      it('should set ephemeral session', async () => {
        Platform.OS = 'ios';
        expect.assertions(1);
        const url = 'https://auth0.com';
        await agent.show(url, true);
        expect(A0Auth0.ephemeralSession).toEqual(true);
      });
    });

    describe('listeners', () => {
      it('should register url listeners', () => {
        A0Auth0.onUrl = () => {};
        const url = 'https://auth0.com/authorize';
        agent.show(url);
        expect(Linking.emitter.listenerCount('url')).toEqual(1);
      });

      it('should not register url listeners', () => {
        const url = 'https://auth0.com/authorize';
        agent.show(url, false, true);
        expect(Linking.emitter.listenerCount('url')).toEqual(0);
      });

      it('should remove url listeners when done', async () => {
        expect.assertions(1);
        const url = 'https://auth0.com/authorize';
        await agent.show(url);
        expect(Linking.emitter.listenerCount('url')).toEqual(0);
      });

      it('should remove url listeners when load fails', async () => {
        expect.assertions(1);
        A0Auth0.error = new Error('failed to load');
        const url = 'https://auth0.com/authorize';
        await agent.show(url).catch(err => Promise.resolve(err));
        expect(Linking.emitter.listenerCount('url')).toEqual(0);
      });

      it('should remove url listeners on first load', async () => {
        expect.assertions(1);
        const url = 'https://auth0.com/authorize';
        await agent.show(url, false, false, true);
        expect(Linking.emitter.listenerCount('url')).toEqual(0);
      });
    });

    describe('failed flow', () => {
      it('should reject with error', async () => {
        expect.assertions(1);
        A0Auth0.error = new Error('failed to load');
        await expect(agent.show('https://auth0.com')).rejects.toMatchSnapshot();
      });

      it('should reject with error when both error and redirectURL are missing', async () => {
        NativeModules.A0Auth0.showUrl = (...args) => {
          const callback = args[args.length - 1];
          callback(null, null);
        };
        expect.assertions(1);
        try {
          await agent.show('https://auth0.com');
        } catch (e) {
          expect(e).toEqual(new Error('Unknown WebAuth error'));
        }
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
