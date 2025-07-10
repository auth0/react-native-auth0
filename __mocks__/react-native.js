/**
 * This file provides a project-wide, self-contained mock for the 'react-native' package.
 */

const React = require('react');

// A fake native module to be returned by TurboModuleRegistry.getEnforcing.
const mockNativeModule = {
  // ... (all the mock native methods from before)
  initializeAuth0WithConfiguration: jest.fn(() => Promise.resolve()),
  webAuth: jest.fn(() => Promise.resolve({})),
  webAuthLogout: jest.fn(() => Promise.resolve()),
  cancelWebAuth: jest.fn(() => Promise.resolve()),
  getBundleIdentifier: jest.fn(() => Promise.resolve('com.my.app')),
  resumeWebAuth: jest.fn(() => Promise.resolve(true)),
  saveCredentials: jest.fn(() => Promise.resolve()),
  getCredentials: jest.fn(() => Promise.resolve({})),
  hasValidCredentials: jest.fn(() => Promise.resolve(true)),
  clearCredentials: jest.fn(() => Promise.resolve()),
  hasValidInstance: jest.fn(() => Promise.resolve(true)),
};

// Export the mocked module.
module.exports = {
  // Mock the Platform module
  Platform: {
    OS: 'ios',
  },
  // Mock the TurboModuleRegistry
  TurboModuleRegistry: {
    getEnforcing: () => mockNativeModule,
  },
  // Mock the Linking module
  Linking: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },

  // FIX: Add mocks for core UI components used in tests.
  // We can use a simple functional component that just renders its children
  // and passes along any props.
  View: (props) => React.createElement('View', props, props.children),
  Text: (props) => React.createElement('Text', props, props.children),
  Button: (props) => React.createElement('Button', props, props.children),
  // Add any other components your tests might use, e.g., StyleSheet
  StyleSheet: {
    create: (styles) => styles,
  },
};
