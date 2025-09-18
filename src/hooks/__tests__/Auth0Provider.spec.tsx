import React from 'react';
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Auth0Provider, useAuth0 } from '..';
import Auth0 from '../../index';
import { Auth0User } from '../../core/models';

// Mock TurboModuleRegistry first
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({
    hasValidInstance: jest.fn().mockResolvedValue(true),
    initialize: jest.fn().mockResolvedValue(undefined),
    authorize: jest.fn(),
    clearSession: jest.fn(),
    getCredentials: jest.fn(),
    saveCredentials: jest.fn(),
    hasValidCredentials: jest.fn(),
    clearCredentials: jest.fn(),
    getBundleIdentifier: jest.fn().mockResolvedValue('com.test.app'),
    cancelWebAuth: jest.fn(),
    resumeWebAuth: jest.fn(),
  })),
}));

// Mock React Native components for testing
jest.mock('react-native', () => ({
  Text: ({ children, testID }: any) => (
    <span data-testid={testID}>{children}</span>
  ),
  View: ({ children, testID }: any) => (
    <div data-testid={testID}>{children}</div>
  ),
  Button: ({ title, onPress, testID }: any) => (
    <button data-testid={testID} onClick={onPress}>
      {title}
    </button>
  ),
  Platform: { OS: 'ios' },
  Linking: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  TurboModuleRegistry: {
    getEnforcing: jest.fn(() => ({
      hasValidInstance: jest.fn().mockResolvedValue(true),
      initialize: jest.fn().mockResolvedValue(undefined),
      authorize: jest.fn(),
      clearSession: jest.fn(),
      getCredentials: jest.fn(),
      saveCredentials: jest.fn(),
      hasValidCredentials: jest.fn(),
      clearCredentials: jest.fn(),
      getBundleIdentifier: jest.fn().mockResolvedValue('com.test.app'),
      cancelWebAuth: jest.fn(),
      resumeWebAuth: jest.fn(),
    })),
  },
}));

// 1. Mock the top-level Auth0 facade
jest.mock('../../index');
const MockAuth0 = Auth0 as jest.MockedClass<typeof Auth0>;

// Mock the Auth0User model's factory method
jest.mock('../../core/models/Auth0User');
const MockAuth0User = Auth0User as jest.MockedClass<typeof Auth0User>;

// 2. A more complete mock client factory
const createMockClient = () => {
  const mockCredentials = {
    idToken: 'a.b.c', // Content doesn't matter since fromIdToken is mocked
    accessToken: 'access-token-123',
    tokenType: 'Bearer',
    expiresAt: Date.now() / 1000 + 3600,
  };

  const mockNewUser = { name: 'New User', sub: 'new|123' };

  return {
    webAuth: {
      authorize: jest.fn().mockResolvedValue(mockCredentials),
      clearSession: jest.fn().mockResolvedValue(undefined),
      cancelWebAuth: jest.fn().mockResolvedValue(undefined),
      handleRedirectCallback: jest.fn().mockResolvedValue(undefined),
      checkWebSession: jest.fn().mockResolvedValue(null),
    },
    credentialsManager: {
      hasValidCredentials: jest.fn().mockResolvedValue(false),
      getCredentials: jest.fn().mockResolvedValue(null),
      clearCredentials: jest.fn().mockResolvedValue(undefined),
      saveCredentials: jest.fn().mockResolvedValue(undefined),
    },
    auth: {
      loginWithPasswordRealm: jest.fn().mockResolvedValue(mockCredentials),
      createUser: jest.fn().mockResolvedValue(mockNewUser),
      resetPassword: jest.fn().mockResolvedValue(undefined),
      // Add other auth methods as stubs
      exchange: jest.fn(),
      exchangeNativeSocial: jest.fn(),
      loginWithEmail: jest.fn(),
      loginWithOTP: jest.fn(),
      loginWithOOB: jest.fn(),
      loginWithRecoveryCode: jest.fn(),
      loginWithSMS: jest.fn(),
      multifactorChallenge: jest.fn(),
      passwordlessWithEmail: jest.fn(),
      passwordlessWithSMS: jest.fn(),
      refreshToken: jest.fn(),
      revoke: jest.fn(),
      userInfo: jest.fn(),
      passwordRealm: jest.fn(),
    },
    users: jest.fn(),
  };
};

// Import React Native components after mocking
const { Text, View, Button } = require('react-native');

// 3. A more comprehensive consumer component
const TestConsumer = () => {
  const {
    user,
    error,
    isLoading,
    authorize,
    clearSession,
    clearCredentials,
    createUser,
    resetPassword,
  } = useAuth0();

  if (isLoading) {
    return <Text testID="loading">Loading...</Text>;
  }

  if (error) {
    return <Text testID="error">Error: {error.message}</Text>;
  }

  return (
    <View testID="main">
      {user ? (
        <Text testID="user-status">Logged in as: {user.name}</Text>
      ) : (
        <Text testID="user-status">Not logged in</Text>
      )}
      <Button
        title="Log In"
        onPress={() => authorize().catch(() => {})} // Catch the error to prevent unhandled rejection
        testID="login-button"
      />
      <Button
        title="Log Out"
        onPress={() => clearSession()}
        testID="logout-button"
      />
      <Button
        title="Clear Credentials"
        onPress={() => clearCredentials()}
        testID="clear-credentials-button"
      />
      <Button
        title="Create User"
        onPress={() =>
          createUser({ email: 'a', password: 'b', connection: 'c' })
        }
        testID="create-user-button"
      />
      <Button
        title="Reset Password"
        onPress={() => resetPassword({ email: 'a', connection: 'c' })}
        testID="reset-password-button"
      />
    </View>
  );
};

describe('Auth0Provider', () => {
  let mockClientInstance: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClientInstance = createMockClient();
    MockAuth0.mockImplementation(() => mockClientInstance as any);
    // Mock the user returned by the fromIdToken static method
    const mockUser = { name: 'Test User', sub: 'auth0|12345' };
    MockAuth0User.fromIdToken.mockReturnValue(mockUser as any);
  });

  it('should render a loading state initially', async () => {
    // Make both checkWebSession and getCredentials return promises that we can control
    let resolveCheckSession: (value: any) => void;
    let resolveCredentials: (value: any) => void;
    
    const checkSessionPromise = new Promise((resolve) => {
      resolveCheckSession = resolve;
    });
    const credentialsPromise = new Promise((resolve) => {
      resolveCredentials = resolve;
    });
    
    mockClientInstance.webAuth.checkWebSession.mockReturnValue(
      checkSessionPromise
    );
    mockClientInstance.credentialsManager.getCredentials.mockReturnValue(
      credentialsPromise
    );

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    // Should show loading state initially
    expect(screen.getByTestId('loading')).toBeDefined();

    // Resolve the promises
    await act(async () => {
      resolveCheckSession!(null);
      resolveCredentials!(null);
    });

    // Now it should show the "not logged in" state
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull());
  });

  it('should initialize with no user if no valid credentials exist', async () => {
    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull());
    expect(
      mockClientInstance.credentialsManager.getCredentials
    ).toHaveBeenCalled();
    expect(screen.getByTestId('user-status')).toHaveTextContent(
      'Not logged in'
    );
  });

  it('should initialize with a user if valid credentials exist', async () => {
    mockClientInstance.credentialsManager.getCredentials.mockResolvedValueOnce({
      idToken: 'a.b.c',
      accessToken: 'valid-token',
      expiresAt: Date.now() / 1000 + 3600,
    } as any);

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Logged in as: Test User'
      );
    });
    // Ensure fromIdToken was called with the correct ID token
    expect(MockAuth0User.fromIdToken).toHaveBeenCalledWith('a.b.c');
  });

  it('should update the state correctly after a successful authorize call', async () => {
    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );

    const loginButton = screen.getByTestId('login-button');
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Logged in as: Test User'
      )
    );
    expect(mockClientInstance.webAuth.authorize).toHaveBeenCalled();
    expect(
      mockClientInstance.credentialsManager.saveCredentials
    ).toHaveBeenCalled();
  });

  it('should update the state correctly after a clearSession call', async () => {
    // Start with a logged-in state
    mockClientInstance.credentialsManager.getCredentials.mockResolvedValueOnce({
      idToken: 'a.b.c',
      accessToken: 'access-token-123',
      tokenType: 'Bearer',
      expiresAt: Date.now() / 1000 + 3600,
    } as any);

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Logged in as: Test User'
      )
    );

    const logoutButton = screen.getByTestId('logout-button');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );
    expect(mockClientInstance.webAuth.clearSession).toHaveBeenCalled();
  });

  it('should call clearSession operations in the correct order', async () => {
    // Start with a logged-in state
    mockClientInstance.credentialsManager.getCredentials.mockResolvedValueOnce({
      idToken: 'a.b.c',
      accessToken: 'access-token-123',
      tokenType: 'Bearer',
      expiresAt: Date.now() / 1000 + 3600,
    } as any);

    // Track the order of calls
    const callOrder: string[] = [];

    // Mock clearSession to track when it's called
    mockClientInstance.webAuth.clearSession.mockImplementation(async () => {
      callOrder.push('webAuth.clearSession');
    });

    // Mock clearCredentials to track when it's called
    mockClientInstance.credentialsManager.clearCredentials.mockImplementation(
      async () => {
        callOrder.push('credentialsManager.clearCredentials');
      }
    );

    let componentRef: any;
    const TestConsumerWithRef = () => {
      const auth0Context = useAuth0();
      componentRef = auth0Context;
      return <TestConsumer />;
    };

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumerWithRef />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Logged in as: Test User'
      )
    );

    // Track when the user state changes from logged-in to logged-out
    const originalUser = componentRef.user;
    expect(originalUser).toBeTruthy();

    const logoutButton = screen.getByTestId('logout-button');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Wait for the logout to complete and check the order
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      );

      // At this point, the dispatch action should have been triggered
      callOrder.push('dispatch.LOGOUT_COMPLETE');
    });

    // Verify that the operations happened in the correct order:
    // 1. webAuth.clearSession (server-side session)
    // 2. credentialsManager.clearCredentials (local credentials)
    // 3. dispatch LOGOUT_COMPLETE action (React state update)
    expect(callOrder).toEqual([
      'webAuth.clearSession',
      'credentialsManager.clearCredentials',
      'dispatch.LOGOUT_COMPLETE',
    ]);

    expect(mockClientInstance.webAuth.clearSession).toHaveBeenCalled();
    expect(
      mockClientInstance.credentialsManager.clearCredentials
    ).toHaveBeenCalled();

    // Verify the user state has been cleared
    expect(componentRef.user).toBeNull();
  });

  it('should update the state correctly after a clearCredentials call', async () => {
    // Start with a logged-in state
    mockClientInstance.credentialsManager.getCredentials.mockResolvedValueOnce({
      idToken: 'a.b.c',
      accessToken: 'access-token-123',
      tokenType: 'Bearer',
      expiresAt: Date.now() / 1000 + 3600,
    } as any);

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Logged in as: Test User'
      )
    );

    const clearCredentialsButton = screen.getByTestId(
      'clear-credentials-button'
    );
    await act(async () => {
      fireEvent.click(clearCredentialsButton);
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );
    expect(
      mockClientInstance.credentialsManager.clearCredentials
    ).toHaveBeenCalled();
  });

  it('should update the error state if authorize fails', async () => {
    // Create a mock error object that looks like an AuthError
    const loginError = {
      name: 'login_failed',
      message: 'User cancelled login.',
      code: 'login_failed',
      status: 400,
    };
    mockClientInstance.webAuth.authorize.mockRejectedValueOnce(loginError);

    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );

    const loginButton = screen.getByTestId('login-button');

    // Click the button and catch the error to prevent unhandled rejection
    await act(async () => {
      fireEvent.click(loginButton);
      // Wait a bit for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the error state to be updated in the provider
    await waitFor(
      () => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Error: User cancelled login.'
        );
      },
      { timeout: 5000 }
    );
  });

  it('should call createUser but not change the login state', async () => {
    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );

    const createButton = screen.getByTestId('create-user-button');
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(mockClientInstance.auth.createUser).toHaveBeenCalled();
    // The user should still be "Not logged in" because createUser doesn't log the user in.
    expect(screen.getByTestId('user-status')).toHaveTextContent(
      'Not logged in'
    );
  });

  it('should call resetPassword and not change the login state', async () => {
    await act(async () => {
      render(
        <Auth0Provider domain="test.com" clientId="123">
          <TestConsumer />
        </Auth0Provider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user-status')).toHaveTextContent(
        'Not logged in'
      )
    );

    const resetButton = screen.getByTestId('reset-password-button');
    await act(async () => {
      fireEvent.click(resetButton);
    });

    expect(mockClientInstance.auth.resetPassword).toHaveBeenCalled();
    expect(screen.getByTestId('user-status')).toHaveTextContent(
      'Not logged in'
    );
  });

  describe('saveCredentials', () => {
    const TestSaveCredentialsConsumer = () => {
      const { saveCredentials, error } = useAuth0();

      const handleSaveCredentials = () => {
        const credentials = {
          idToken: 'id_token_123',
          accessToken: 'access_token_456',
          tokenType: 'Bearer' as const,
          expiresAt: Date.now() / 1000 + 3600,
          scope: 'openid profile email',
          refreshToken: 'refresh_token_789',
        };
        saveCredentials(credentials).catch(() => {});
      };

      if (error) {
        return <Text testID="error">Error: {error.message}</Text>;
      }

      return (
        <View>
          <Button
            title="Save Credentials"
            onPress={handleSaveCredentials}
            testID="save-credentials-button"
          />
        </View>
      );
    };

    it('should save credentials successfully', async () => {
      mockClientInstance.credentialsManager.saveCredentials.mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        render(
          <Auth0Provider domain="test.com" clientId="123">
            <TestSaveCredentialsConsumer />
          </Auth0Provider>
        );
      });

      const saveButton = screen.getByTestId('save-credentials-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(
        mockClientInstance.credentialsManager.saveCredentials
      ).toHaveBeenCalledTimes(1);
      expect(
        mockClientInstance.credentialsManager.saveCredentials
      ).toHaveBeenCalledWith({
        idToken: 'id_token_123',
        accessToken: 'access_token_456',
        tokenType: 'Bearer',
        expiresAt: expect.any(Number),
        scope: 'openid profile email',
        refreshToken: 'refresh_token_789',
      });
    });

    it('should handle save credentials error and dispatch to state', async () => {
      const saveError = new Error('Failed to save credentials to Keychain');
      mockClientInstance.credentialsManager.saveCredentials.mockRejectedValueOnce(
        saveError
      );

      await act(async () => {
        render(
          <Auth0Provider domain="test.com" clientId="123">
            <TestSaveCredentialsConsumer />
          </Auth0Provider>
        );
      });

      const saveButton = screen.getByTestId('save-credentials-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Error: Failed to save credentials to Keychain'
        );
      });

      expect(
        mockClientInstance.credentialsManager.saveCredentials
      ).toHaveBeenCalledTimes(1);
    });

    it('should save minimal credentials', async () => {
      const TestMinimalCredentialsConsumer = () => {
        const { saveCredentials } = useAuth0();

        const handleSaveMinimalCredentials = () => {
          const minimalCredentials = {
            idToken: 'id_token_minimal',
            accessToken: 'access_token_minimal',
            tokenType: 'Bearer' as const,
            expiresAt: Date.now() / 1000 + 1800,
            scope: 'openid',
          };
          saveCredentials(minimalCredentials).catch(() => {});
        };

        return (
          <Button
            title="Save Minimal Credentials"
            onPress={handleSaveMinimalCredentials}
            testID="save-minimal-button"
          />
        );
      };

      mockClientInstance.credentialsManager.saveCredentials.mockResolvedValueOnce(
        undefined
      );

      await act(async () => {
        render(
          <Auth0Provider domain="test.com" clientId="123">
            <TestMinimalCredentialsConsumer />
          </Auth0Provider>
        );
      });

      const saveButton = screen.getByTestId('save-minimal-button');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(
        mockClientInstance.credentialsManager.saveCredentials
      ).toHaveBeenCalledWith({
        idToken: 'id_token_minimal',
        accessToken: 'access_token_minimal',
        tokenType: 'Bearer',
        expiresAt: expect.any(Number),
        scope: 'openid',
      });
    });
  });
});
