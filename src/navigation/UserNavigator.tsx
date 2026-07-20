import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator();

export default function UserNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{ tabBarIcon: () => <Text>🗺️</Text> }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{ tabBarIcon: () => <Text>📦</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{ tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}