import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { jwtDecode } from 'jwt-decode';
import auth0 from '../../api/auth0';
import Button from '../../components/Button';
import Header from '../../components/Header';
import UserInfo from '../../components/UserInfo';
import { User } from 'react-native-auth0';
import type { ClassDemoStackParamList } from '../../navigation/ClassDemoNavigator';

type ProfileRouteProp = RouteProp<ClassDemoStackParamList, 'ClassProfile'>;
type NavigationProp = StackNavigationProp<
  ClassDemoStackParamList,
  'ClassProfile'
>;

type Props = {
  route: ProfileRouteProp;
};

const ClassProfileScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const { credentials } = route.params;

  const user = useMemo<User | null>(() => {
    try {
      return jwtDecode<User>(credentials.idToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }, [credentials.idToken]);

  const onLogout = async () => {
    try {
      await auth0.webAuth.clearSession();
      await auth0.credentialsManager.clearCredentials();
      navigation.goBack();
    } catch (e) {
      console.log('Logout error: ', e);
    }
  };

  const onNavigateToApiTests = () => {
    navigation.navigate('ClassApiTests', {
      accessToken: credentials.accessToken,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Class-Based Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <UserInfo user={user} />
        <Button
          onPress={onLogout}
          title="Log Out"
          style={styles.logoutButton}
        />
        <View style={styles.spacer} />
        <Button onPress={onNavigateToApiTests} title="Go to API Tests" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  spacer: {
    height: 16,
  },
  logoutButton: {
    backgroundColor: '#424242',
  },
});

export default ClassProfileScreen;
