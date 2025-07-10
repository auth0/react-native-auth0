import { Auth0ClientFactory } from '../Auth0ClientFactory';
import { PlatformDetector } from '../PlatformDetector';
import { validateAuth0Options } from '../../core/utils';
import { NativeAuth0Client, WebAuth0Client } from '../../platforms';

// Mock all other dependencies of the factory.
jest.mock('../PlatformDetector');
jest.mock('../../core/utils/validation');
jest.mock('../../platforms/native/adapters/NativeAuth0Client');
jest.mock('../../platforms/web/adapters/WebAuth0Client');

// Create typed mocks for easier use in tests.
const MockPlatformDetector = PlatformDetector as jest.Mocked<
  typeof PlatformDetector
>;
const mockValidateAuth0Options = validateAuth0Options as jest.Mock;
const MockNativeAuth0Client = NativeAuth0Client as jest.MockedClass<
  typeof NativeAuth0Client
>;
const MockWebAuth0Client = WebAuth0Client as jest.MockedClass<
  typeof WebAuth0Client
>;

describe('Auth0ClientFactory', () => {
  const options = {
    domain: 'my-tenant.auth0.com',
    clientId: 'MyClientId123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call validateAuth0Options with the provided options', () => {
    MockPlatformDetector.detect.mockReturnValue('native');

    Auth0ClientFactory.createClient(options);

    expect(mockValidateAuth0Options).toHaveBeenCalledTimes(1);
    expect(mockValidateAuth0Options).toHaveBeenCalledWith(options);
  });

  it('should create a NativeAuth0Client when platform is "native"', () => {
    MockPlatformDetector.detect.mockReturnValue('native');

    const client = Auth0ClientFactory.createClient(options);

    expect(MockPlatformDetector.detect).toHaveBeenCalledTimes(1);
    expect(MockNativeAuth0Client).toHaveBeenCalledTimes(1);
    expect(MockNativeAuth0Client).toHaveBeenCalledWith(options);
    expect(MockWebAuth0Client).not.toHaveBeenCalled();
    expect(client).toBeInstanceOf(MockNativeAuth0Client);
  });

  it('should create a WebAuth0Client when platform is "web"', () => {
    MockPlatformDetector.detect.mockReturnValue('web');

    const client = Auth0ClientFactory.createClient(options);

    expect(MockPlatformDetector.detect).toHaveBeenCalledTimes(1);
    expect(MockWebAuth0Client).toHaveBeenCalledTimes(1);
    expect(MockWebAuth0Client).toHaveBeenCalledWith(options);
    expect(MockNativeAuth0Client).not.toHaveBeenCalled();
    expect(client).toBeInstanceOf(MockWebAuth0Client);
  });

  it('should throw an error if the platform is not supported', () => {
    MockPlatformDetector.detect.mockReturnValue('unsupported_platform' as any);

    expect(() => Auth0ClientFactory.createClient(options)).toThrow(
      'The platform "unsupported_platform" is not supported by the Auth0ClientFactory.'
    );
  });

  it('should re-throw any error from validateAuth0Options', () => {
    const validationError = new Error('Invalid Client ID');
    mockValidateAuth0Options.mockImplementation(() => {
      throw validationError;
    });

    expect(() => Auth0ClientFactory.createClient(options)).toThrow(
      validationError
    );
  });
});
