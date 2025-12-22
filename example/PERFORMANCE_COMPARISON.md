# Performance Comparison Tool

## Overview

The Performance Comparison screen allows you to benchmark and compare the execution times of React Native API calls versus Native API calls for authentication operations on both iOS and Android platforms.

## Features

- **Real-time Performance Measurement**: Measures execution time in milliseconds for each API call
- **Side-by-Side Comparison**: Compare React Native bridge calls vs direct Native SDK calls
- **Multiple Test Types**: Tests 4 different authentication operations:
  1. Password Realm Authentication
  2. Refresh Token
  3. User Info Retrieval
  4. User Creation
- **Platform Support**: Works on both iOS and Android with platform-specific native implementations
- **Statistical Analysis**: Calculates average execution times and performance differences
- **Detailed Results**: Shows individual test results with timestamps and error handling

## Tested APIs

### 1. Password Realm Authentication

- **React Native**: `auth0.auth.passwordRealm()`
- **Native iOS**: Direct Auth0.swift `login()` call
- **Native Android**: Direct Auth0.Android `login()` call
- **Purpose**: Tests username/password authentication performance

### 2. Refresh Token

- **React Native**: `auth0.auth.refreshToken()`
- **Native iOS**: Direct Auth0.swift `renewAuth()` call
- **Native Android**: Direct Auth0.Android `renewAuth()` call
- **Purpose**: Tests token refresh operation performance

### 3. User Info

- **React Native**: `auth0.auth.userInfo()`
- **Native iOS**: Direct Auth0.swift `userInfo()` call
- **Native Android**: Direct Auth0.Android `userInfo()` call
- **Purpose**: Tests user profile retrieval performance

### 4. Create User

- **React Native**: `auth0.auth.createUser()`
- **Native iOS**: Direct Auth0.swift `signup()` call
- **Native Android**: Direct Auth0.Android `createUser()` call
- **Purpose**: Tests user registration performance

## How to Use

### 1. Configure Test Credentials

Enter your test credentials in the configuration section:

- **Username/Email**: Your Auth0 test user email
- **Password**: Your Auth0 test user password
- **Realm/Connection**: Database connection name (e.g., `Username-Password-Authentication`)

### 2. Run Individual Tests

Click on any of the individual test buttons to run a specific API comparison:

- "Test Password Realm" - Authenticates and stores tokens for subsequent tests
- "Test Refresh Token" - Requires valid refresh token from password realm
- "Test User Info" - Requires valid access token from password realm
- "Test Create User" - Creates a new user (uses unique email each time)

### 3. Run All Tests

Click "Run All Tests" to execute all tests sequentially. This will:

1. Authenticate with password realm
2. Use obtained refresh token to test token refresh
3. Use obtained access token to test user info retrieval
4. Create a new test user

### 4. Review Results

Each test result shows:

- **Method name**: API being tested
- **React Native time**: Execution time through RN bridge (ms)
- **Native time**: Direct native SDK execution time (ms)
- **Difference**: Time difference and which approach is faster
- **Timestamp**: When the test was executed

### 5. View Statistics

The statistics section displays:

- **Tests Completed**: Number of successful test runs
- **RN Avg Time**: Average execution time for React Native calls
- **Native Avg Time**: Average execution time for Native calls
- **Difference**: Overall performance comparison

## Implementation Details

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              PerformanceComparisonScreen                     │
│                  (React Native UI)                           │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
        ┌─────────▼────────┐    ┌────────▼─────────┐
        │  React Native    │    │  Native Bridge   │
        │  API Calls       │    │  Direct Calls    │
        │  (Auth0 Class)   │    │  (TurboModule)   │
        └─────────┬────────┘    └────────┬─────────┘
                  │                       │
        ┌─────────▼────────────────────────▼─────────┐
        │           Platform Native SDKs              │
        │   (Auth0.swift / Auth0.Android)            │
        └─────────────────────────────────────────────┘
```

### Performance Measurement

#### React Native Path

1. JavaScript calls `auth0.auth.method()`
2. Bridge to native TurboModule
3. Native SDK execution
4. Result marshaled back through bridge
5. JavaScript receives result

**Measurement**: `performance.now()` before and after the complete call chain

#### Native Path

1. JavaScript calls `NativeModules.A0Auth0.measureMethod()`
2. Direct TurboModule call
3. Native timing starts (`CACurrentMediaTime()` on iOS, `System.nanoTime()` on Android)
4. Native SDK execution
5. Native timing ends
6. Result with timing returned to JavaScript

**Measurement**: Native high-precision timers within the native module

### File Structure

```
example/src/screens/
└── PerformanceComparisonScreen.tsx   # Main UI component

src/specs/
└── NativeA0Auth0.ts                  # TurboModule spec with measure methods

ios/
├── NativeBridge.swift                # iOS performance implementations
└── A0Auth0.mm                        # iOS Objective-C++ bridge exports

android/src/main/java/com/auth0/react/
├── A0Auth0Module.kt                  # Android performance implementations
├── oldarch/A0Auth0Spec.kt            # Old architecture spec
└── newarch/A0Auth0Spec.kt            # New architecture spec
```

## Expected Performance Characteristics

### React Native API Calls

- **Overhead**: Bridge serialization/deserialization
- **Advantage**: Type safety, error handling, cross-platform consistency
- **Typical overhead**: 1-5ms additional latency

### Native API Calls

- **Overhead**: Minimal - direct native execution
- **Advantage**: Lowest possible latency
- **Use case**: Performance-critical operations

### Network-bound Operations

For operations that involve network calls (authentication, token refresh, user info):

- Bridge overhead is typically negligible (< 1% of total time)
- Network latency dominates (100-500ms typical)
- Difference between RN and Native approaches is minimal

### Local Operations

For operations that are primarily local (credential storage, validation):

- Bridge overhead is more noticeable (5-20% of total time)
- Native approach may show measurable advantages

## Best Practices

1. **Run Multiple Tests**: Single test results can vary due to network conditions
2. **Clear Results Between Sessions**: Use "Clear Results" to start fresh
3. **Test on Real Devices**: Simulator/emulator performance differs from real devices
4. **Consider Network Conditions**: Run tests under similar network conditions for comparison
5. **Monitor Platform Differences**: iOS and Android may show different performance profiles

## Troubleshooting

### "Please run Password Realm test first"

Some tests require tokens from the password realm test. Run that test first to obtain the necessary credentials.

### Authentication Errors

- Verify your test credentials are correct
- Check that the connection name matches your Auth0 configuration
- Ensure the Auth0 domain and client ID are configured correctly

### Native Module Errors

- Rebuild the native apps after adding performance measurement methods
- Run `cd ios && pod install` for iOS
- Rebuild Android with `cd android && ./gradlew clean`

## Platform-Specific Notes

### iOS

- Uses `CACurrentMediaTime()` for high-precision timing
- Measurements in seconds, converted to milliseconds
- Auth0.swift SDK must be >= v2.14

### Android

- Uses `System.nanoTime()` for high-precision timing
- Measurements in nanoseconds, converted to milliseconds
- Auth0.Android SDK must be >= v3.x

## Performance Tips

1. **Bridge Overhead**: For performance-critical code with frequent calls, consider batching operations
2. **Network Optimization**: Use appropriate timeouts and retry logic
3. **Token Caching**: Leverage credential manager to avoid unnecessary refresh calls
4. **Connection Pooling**: Native SDKs handle this automatically

## Future Enhancements

- [ ] Add more API operations (MFA, passwordless, etc.)
- [ ] Export results to CSV/JSON
- [ ] Graph visualization of performance trends
- [ ] Stress testing with multiple concurrent calls
- [ ] Memory usage comparison
- [ ] Battery impact measurement

## Contributing

To add new performance tests:

1. Add method signature to `src/specs/NativeA0Auth0.ts`
2. Implement in `ios/NativeBridge.swift` with timing
3. Export in `ios/A0Auth0.mm`
4. Implement in `android/src/main/java/com/auth0/react/A0Auth0Module.kt`
5. Add to both oldarch and newarch specs
6. Update UI in `PerformanceComparisonScreen.tsx`

## License

This performance comparison tool is part of the react-native-auth0 SDK and follows the same MIT license.
