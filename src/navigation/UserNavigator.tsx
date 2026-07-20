// @ts-nocheck
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import VendorProductsScreen from '../screens/user/VendorProductsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
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

export default function UserNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="VendorProducts" component={VendorProductsScreen} />
    </Stack.Navigator>
  );
}