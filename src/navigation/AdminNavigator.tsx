import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import VendorApprovalScreen from '../screens/admin/VendorApprovalScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Approvals"
        component={VendorApprovalScreen}
        options={{ tabBarIcon: () => <Text>✅</Text> }}
      />
      <Tab.Screen
        name="Users"
        component={UserManagementScreen}
        options={{ tabBarIcon: () => <Text>👥</Text> }}
      />
    </Tab.Navigator>
  );
}