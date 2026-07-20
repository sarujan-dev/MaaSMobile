import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorProductsScreen from '../screens/vendor/VendorProductsScreen';
import VendorRatingsScreen from '../screens/vendor/VendorRatingsScreen';
import VendorProfileScreen from '../screens/vendor/VendorProfileScreen';

const Tab = createBottomTabNavigator();

export default function VendorNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tab.Screen
        name="Dashboard"
        component={VendorDashboardScreen}
        options={{ tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Orders"
        component={VendorOrdersScreen}
        options={{ tabBarIcon: () => <Text>📦</Text> }}
      />
      <Tab.Screen
        name="Products"
        component={VendorProductsScreen}
        options={{ tabBarIcon: () => <Text>🛒</Text> }}
      />
      <Tab.Screen
        name="Ratings"
        component={VendorRatingsScreen}
        options={{ tabBarIcon: () => <Text>⭐</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={VendorProfileScreen}
        options={{ tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}