import React, { Component } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import auth0 from '../../api/auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import UserInfo from '../../components/UserInfo';
import { User, Credentials, ApiCredentials } from 'react-native-auth0';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';
import LabeledInput from '../../components/LabeledInput';
import config from '../../auth0-configuration';
import Result from '../../components/Result';

type ProfileRouteProp = RouteProp<ClassDemoStackParamList, 'ClassProfile'>;

type Props = {
  route: ProfileRouteProp;
  navigation: NavigationProp<ClassDemoStackParamList, 'ClassProfile'>;
};

interface State {
  user: User | null;
  result: Credentials | ApiCredentials | object | boolean | null;
  error: Error | null;
  audience: string;
}

class ClassProfileScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const user = this.decodeIdToken(props.route.params.credentials.idToken);
    this.state = {
      user,
      result: null,
      error: null,
      audience: config.audience,
    };
  }

  decodeIdToken = (idToken: string): User | null => {
    try {
      return jwtDecode<User>(idToken);
    } catch {
      return null;
    }
  };

  runTest = async (testFn: () => Promise<any>, title: string) => {
    this.setState({ error: null, result: null });
    try {
      const res = await testFn();
      this.setState({ result: res ?? { success: `${title} completed` } });
    } catch (e) {
      this.setState({ error: e as Error });
    }
  };

  onLogout = async () => {
    try {
      await auth0.webAuth.clearSession();
      await auth0.credentialsManager.clearCredentials();
      this.props.navigation.goBack();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  render() {
    const { user, result, error, audience } = this.state;
    const { accessToken } = this.props.route.params.credentials;

    return (
      <SafeAreaView style={styles.container}>
        <Header title="Class-Based Profile & Credentials" />
        <ScrollView contentContainerStyle={styles.content}>
          <UserInfo user={user} />
          <Result title="Last Action Result" result={result} error={error} />

          <Section title="Primary Credentials">
            <Button
              onPress={() =>
                this.runTest(
                  () => auth0.credentialsManager.getCredentials(),
                  'Get Credentials'
                )
              }
              title="credentialsManager.getCredentials()"
            />
            <Button
              onPress={() =>
                this.runTest(
                  () => auth0.credentialsManager.hasValidCredentials(),
                  'Check Valid Credentials'
                )
              }
              title="credentialsManager.hasValidCredentials()"
            />
            <Button
              onPress={() =>
                this.runTest(
                  () => auth0.credentialsManager.clearCredentials(),
                  'Clear Credentials'
                )
              }
              title="credentialsManager.clearCredentials()"
              style={styles.destructiveButton}
            />
          </Section>

          <Section title="API Credentials (MRRT)">
            <LabeledInput
              label="API Audience"
              value={audience}
              onChangeText={(text) => this.setState({ audience: text })}
              autoCapitalize="none"
            />
            <Button
              onPress={() =>
                this.runTest(
                  () => auth0.credentialsManager.getApiCredentials(audience),
                  'Get API Credentials'
                )
              }
              title="credentialsManager.getApiCredentials()"
            />
            <Button
              onPress={() =>
                this.runTest(
                  () => auth0.credentialsManager.clearApiCredentials(audience),
                  'Clear API Credentials'
                )
              }
              title="credentialsManager.clearApiCredentials()"
              style={styles.secondaryButton}
            />
          </Section>

          <Section title="Navigation & Logout">
            <Button
              onPress={() =>
                this.props.navigation.navigate('ClassApiTests', { accessToken })
              }
              title="Go to API Tests"
            />
            <Button
              onPress={this.onLogout}
              title="Log Out"
              style={styles.destructiveButton}
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.buttonGroup}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 50, alignItems: 'center' },
  section: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  buttonGroup: { gap: 10 },
  destructiveButton: { backgroundColor: '#424242' },
  secondaryButton: { backgroundColor: '#FF9800' },
});

export default ClassProfileScreen;
