import { Auth0ClientFactory } from '../Auth0ClientFactory';
import { validateAuth0Options } from '../../core/utils';
import { NativeAuth0Client } from '../../platforms';

// Now we only need to mock the dependencies of the NATIVE factory
jest.mock('../../core/utils/validation');
jest.mock('../../platforms/native/adapters/NativeAuth0Client');

const mockValidateAuth0Options = validateAuth0Options as jest.Mock;
const MockNativeAuth0Client = NativeAuth0Client as jest.MockedClass<
  typeof NativeAuth0Client
>;

describe('Auth0ClientFactory (Native)', () => {
  const options = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Auth0ClientFactory.resetClientCache();
  });

  it('should call validateAuth0Options with the provided options', () => {
    Auth0ClientFactory.createClient(options);
    expect(mockValidateAuth0Options).toHaveBeenCalledWith(options);
  });

  // This test is now specific to the native factory
  it('should always create a NativeAuth0Client', () => {
    const client = Auth0ClientFactory.createClient(options);
    expect(MockNativeAuth0Client).toHaveBeenCalledTimes(1);
    expect(MockNativeAuth0Client).toHaveBeenCalledWith(options);
    expect(client).toBeInstanceOf(MockNativeAuth0Client);
  });

  it('should return the same cached client for the same domain+clientId', () => {
    const client1 = Auth0ClientFactory.createClient(options);
    const client2 = Auth0ClientFactory.createClient(options);

    expect(client1).toBe(client2);
    expect(MockNativeAuth0Client).toHaveBeenCalledTimes(1);
  });

  it('should create separate clients for different domain+clientId', () => {
    const client1 = Auth0ClientFactory.createClient(options);
    const client2 = Auth0ClientFactory.createClient({
      domain: 'other-tenant.auth0.com',
      clientId: 'OtherClientId',
    });

    expect(client1).not.toBe(client2);
    expect(MockNativeAuth0Client).toHaveBeenCalledTimes(2);
  });

  it('should create a new client after cache is reset', () => {
    const client1 = Auth0ClientFactory.createClient(options);
    Auth0ClientFactory.resetClientCache();
    const client2 = Auth0ClientFactory.createClient(options);

    expect(client1).not.toBe(client2);
    expect(MockNativeAuth0Client).toHaveBeenCalledTimes(2);
  });
});
