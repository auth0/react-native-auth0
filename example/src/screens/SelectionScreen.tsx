// example/src/screens/SelectionScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Button from '../components/Button';
import Header from '../components/Header';
import type { RootStackParamList } from '../navigation/RootNavigator';

// Use the specific navigation prop type from our RootNavigator's param list
// for type-safe navigation.
type SelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Selection'
>;

/**
 * The initial screen of the application. It allows the user to navigate
 * to either the Hooks-based demo or the Class-based demo.
 */
const SelectionScreen = () => {
  const navigation = useNavigation<SelectionScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="React Native Auth0" />
      <View style={styles.content}>
        <Text style={styles.description}>
          Choose a demonstration to see the Auth0 SDK in action.
        </Text>

        <Button
          onPress={() => navigation.navigate('HooksDemo')}
          title="Hooks Demo (Recommended)"
        />

        <View style={styles.spacer} />

        <Button
          onPress={() => navigation.navigate('ClassDemo')}
          title="Class-Based Demo"
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />

        <View style={styles.spacer} />

        <Button
          onPress={() => navigation.navigate('PerformanceComparison')}
          title="Performance Comparison"
          style={styles.performanceButton}
          textStyle={styles.performanceButtonText}
        />

        <Text style={styles.footer}>
          The Hooks demo shows the recommended integration for modern React
          Native apps. The Class-based demo is for testing direct API calls.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#424242',
    marginBottom: 40,
  },
  spacer: {
    height: 20,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  secondaryButtonText: {
    color: '#E53935',
  },
  performanceButton: {
    backgroundColor: '#1976D2',
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  performanceButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    textAlign: 'center',
    color: '#757575',
    paddingHorizontal: 20,
  },
});

export default SelectionScreen;
