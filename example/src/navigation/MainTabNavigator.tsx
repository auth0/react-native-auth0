// example/src/navigation/MainTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/hooks/Profile';
import ApiScreen from '../screens/hooks/Api';
import MoreScreen from '../screens/hooks/More';
import CredentialsScreen from '../screens/hooks/CredentialsScreen';

export type MainTabParamList = {
  Profile: undefined;
  Api: undefined;
  More: undefined;
  Credentials: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Navigator for the authenticated part of the Hooks-based demo.
 * It provides tab-based navigation to the Profile, API, and other screens.
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Each screen will use its own custom Header component
        tabBarActiveTintColor: '#E53935',
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        // You can add icons here if desired
      />
      <Tab.Screen name="Credentials" component={CredentialsScreen} />
      <Tab.Screen name="Api" component={ApiScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
