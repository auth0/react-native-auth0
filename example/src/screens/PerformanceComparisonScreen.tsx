import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  NativeModules,
} from 'react-native';
import Auth0, { Credentials } from 'react-native-auth0';
import Button from '../components/Button';
import Header from '../components/Header';
import LabeledInput from '../components/LabeledInput';
import config from '../auth0-configuration';

interface PerformanceResult {
  method: string;
  rnTime: number | null;
  nativeTime: number | null;
  error?: string;
  timestamp: Date;
}

interface TestCredentials {
  username: string;
  password: string;
  realm: string;
}

const PerformanceComparisonScreen = () => {
  const [auth0] = useState(
    () =>
      new Auth0({
        domain: config.domain,
        clientId: config.clientId,
      })
  );

  // Test credentials
  const [username, setUsername] = useState('test@example.com');
  const [password, setPassword] = useState('Test@1234');
  const [realm, setRealm] = useState('Username-Password-Authentication');
  const [refreshToken, setRefreshToken] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Results state
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Helper function to measure React Native API call performance
  const measureRNPerformance = async <T,>(
    methodName: string,
    apiCall: () => Promise<T>
  ): Promise<{ time: number; result: T }> => {
    const start = performance.now();
    const result = await apiCall();
    const end = performance.now();
    return { time: end - start, result };
  };

  // Helper function to measure Native API call performance
  const measureNativePerformance = async (
    methodName: string,
    params: any
  ): Promise<{ time: number; result: any }> => {
    // This will call native methods directly with built-in timing
    const { A0Auth0 } = NativeModules;

    const start = performance.now();
    let result;
    switch (methodName) {
      case 'passwordRealm':
        result = await A0Auth0.measurePasswordRealm(
          params.username,
          params.password,
          params.realm,
          params.audience || '',
          params.scope || 'openid profile email offline_access'
        );
        break;
      case 'refreshToken':
        result = await A0Auth0.measureRefreshToken(
          params.refreshToken,
          params.scope || 'openid profile email offline_access'
        );
        break;
      case 'userInfo':
        result = await A0Auth0.measureUserInfo(params.token);
        break;
      case 'createUser':
        result = await A0Auth0.measureCreateUser(
          params.email,
          params.password,
          params.connection
        );
        break;
      default:
        throw new Error(`Unknown method: ${methodName}`);
    }
    const end = performance.now();
    return { time: end - start, result };
  };

  // Add result to the list
  const addResult = (
    method: string,
    rnTime: number | null,
    nativeTime: number | null,
    error?: string
  ) => {
    const newResult: PerformanceResult = {
      method,
      rnTime,
      nativeTime,
      error,
      timestamp: new Date(),
    };
    setResults((prev) => [newResult, ...prev]);
  };

  // Test 1: Password Realm Authentication
  const testPasswordRealm = async () => {
    setIsLoading(true);
    setCurrentTest('Testing Password Realm Authentication...');

    try {
      const params = {
        username,
        password,
        realm,
        scope: 'openid profile email offline_access',
      };

      // Measure React Native call
      const rnResult = await measureRNPerformance('passwordRealm', () =>
        auth0.auth.passwordRealm(params)
      );

      // Store tokens for other tests
      const credentials = rnResult.result as Credentials;
      if (credentials.refreshToken) {
        setRefreshToken(credentials.refreshToken);
      }
      if (credentials.accessToken) {
        setAccessToken(credentials.accessToken);
      }

      // Measure Native call
      const nativeResult = await measureNativePerformance(
        'passwordRealm',
        params
      );

      addResult('passwordRealm', rnResult.time, nativeResult.time);
    } catch (error: any) {
      addResult('passwordRealm', null, null, error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  // Test 2: Refresh Token
  const testRefreshToken = async () => {
    if (!refreshToken) {
      alert('Please run Password Realm test first to get a refresh token');
      return;
    }

    setIsLoading(true);
    setCurrentTest('Testing Refresh Token...');

    try {
      const params = {
        refreshToken,
        scope: 'openid profile email offline_access',
      };

      // Measure React Native call
      const rnResult = await measureRNPerformance('refreshToken', () =>
        auth0.auth.refreshToken(params)
      );

      // Measure Native call
      const nativeResult = await measureNativePerformance(
        'refreshToken',
        params
      );

      addResult('refreshToken', rnResult.time, nativeResult.time);
    } catch (error: any) {
      addResult('refreshToken', null, null, error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  // Test 3: User Info
  const testUserInfo = async () => {
    if (!accessToken) {
      alert('Please run Password Realm test first to get an access token');
      return;
    }

    setIsLoading(true);
    setCurrentTest('Testing User Info...');

    try {
      const params = { token: accessToken };

      // Measure React Native call
      const rnResult = await measureRNPerformance('userInfo', () =>
        auth0.auth.userInfo(params)
      );

      // Measure Native call
      const nativeResult = await measureNativePerformance('userInfo', params);

      addResult('userInfo', rnResult.time, nativeResult.time);
    } catch (error: any) {
      addResult('userInfo', null, null, error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  // Test 4: Create User
  const testCreateUser = async () => {
    setIsLoading(true);
    setCurrentTest('Testing Create User...');

    try {
      const timestamp = Date.now();
      const params = {
        email: `testuser${timestamp}@example.com`,
        password: 'Test@1234567',
        connection: 'Username-Password-Authentication',
      };

      // Measure React Native call
      const rnResult = await measureRNPerformance('createUser', () =>
        auth0.auth.createUser(params)
      );

      // Measure Native call (with different email to avoid duplicate)
      const nativeParams = {
        ...params,
        email: `testuser${timestamp + 1}@example.com`,
      };
      const nativeResult = await measureNativePerformance(
        'createUser',
        nativeParams
      );

      addResult('createUser', rnResult.time, nativeResult.time);
    } catch (error: any) {
      addResult('createUser', null, null, error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  // Run all tests sequentially
  const runAllTests = async () => {
    await testPasswordRealm();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait between tests

    if (refreshToken) {
      await testRefreshToken();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (accessToken) {
      await testUserInfo();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await testCreateUser();
  };

  // Clear results
  const clearResults = () => {
    setResults([]);
    setRefreshToken('');
    setAccessToken('');
  };

  // Calculate statistics
  const calculateStats = () => {
    const validResults = results.filter((r) => r.rnTime && r.nativeTime);
    if (validResults.length === 0) return null;

    const rnTotal = validResults.reduce((sum, r) => sum + (r.rnTime || 0), 0);
    const nativeTotal = validResults.reduce(
      (sum, r) => sum + (r.nativeTime || 0),
      0
    );

    return {
      rnAvg: rnTotal / validResults.length,
      nativeAvg: nativeTotal / validResults.length,
      count: validResults.length,
    };
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Performance Comparison" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Configuration</Text>
          <LabeledInput
            label="Username/Email"
            value={username}
            onChangeText={setUsername}
            placeholder="test@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <LabeledInput
            label="Realm/Connection"
            value={realm}
            onChangeText={setRealm}
            placeholder="Username-Password-Authentication"
          />
          <Text style={styles.platformInfo}>
            Platform: {Platform.OS} | {Platform.Version}
          </Text>
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>
          <Button
            onPress={testPasswordRealm}
            title="Test Password Realm"
            disabled={isLoading}
          />
          <View style={styles.buttonSpacer} />
          <Button
            onPress={testRefreshToken}
            title="Test Refresh Token"
            disabled={isLoading || !refreshToken}
          />
          <View style={styles.buttonSpacer} />
          <Button
            onPress={testUserInfo}
            title="Test User Info"
            disabled={isLoading || !accessToken}
          />
          <View style={styles.buttonSpacer} />
          <Button
            onPress={testCreateUser}
            title="Test Create User"
            disabled={isLoading}
          />
        </View>

        {/* Batch Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Actions</Text>
          <Button
            onPress={runAllTests}
            title="Run All Tests"
            disabled={isLoading}
          />
          <View style={styles.buttonSpacer} />
          <Button
            onPress={clearResults}
            title="Clear Results"
            disabled={isLoading}
            style={styles.clearButton}
            textStyle={styles.clearButtonText}
          />
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>{currentTest}</Text>
          </View>
        )}

        {/* Statistics */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Performance Statistics</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Tests Completed:</Text>
              <Text style={styles.statsValue}>{stats.count}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>RN Avg Time:</Text>
              <Text style={styles.statsValue}>{stats.rnAvg.toFixed(2)} ms</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Native Avg Time:</Text>
              <Text style={styles.statsValue}>
                {stats.nativeAvg.toFixed(2)} ms
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Difference:</Text>
              <Text
                style={[
                  styles.statsValue,
                  stats.rnAvg < stats.nativeAvg ? styles.faster : styles.slower,
                ]}
              >
                {Math.abs(stats.rnAvg - stats.nativeAvg).toFixed(2)} ms (
                {stats.rnAvg < stats.nativeAvg ? 'RN Faster' : 'Native Faster'})
              </Text>
            </View>
          </View>
        )}

        {/* Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Test Results ({results.length})
          </Text>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>
              No results yet. Run a test to see performance comparison.
            </Text>
          ) : (
            results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultMethod}>{result.method}</Text>
                  <Text style={styles.resultTime}>
                    {result.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                {result.error ? (
                  <Text style={styles.errorText}>Error: {result.error}</Text>
                ) : (
                  <>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>React Native:</Text>
                      <Text style={styles.resultValue}>
                        {result.rnTime?.toFixed(2) ?? 'N/A'} ms
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Native:</Text>
                      <Text style={styles.resultValue}>
                        {result.nativeTime?.toFixed(2) ?? 'N/A'} ms
                      </Text>
                    </View>
                    {result.rnTime && result.nativeTime && (
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Difference:</Text>
                        <Text
                          style={[
                            styles.resultValue,
                            result.rnTime < result.nativeTime
                              ? styles.faster
                              : styles.slower,
                          ]}
                        >
                          {Math.abs(result.rnTime - result.nativeTime).toFixed(
                            2
                          )}{' '}
                          ms
                          {result.rnTime < result.nativeTime
                            ? ' (RN faster)'
                            : ' (Native faster)'}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  platformInfo: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  buttonSpacer: {
    height: 12,
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  clearButtonText: {
    color: '#E53935',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#424242',
  },
  statsContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  statsLabel: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 24,
  },
  resultCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  resultMethod: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53935',
  },
  resultTime: {
    fontSize: 14,
    color: '#757575',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resultLabel: {
    fontSize: 16,
    color: '#424242',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  faster: {
    color: '#2E7D32',
  },
  slower: {
    color: '#C62828',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    fontStyle: 'italic',
  },
});

export default PerformanceComparisonScreen;
