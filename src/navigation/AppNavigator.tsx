import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import UserNavigator from './UserNavigator';
import VendorNavigator from './VendorNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        const parsed = JSON.parse(user);
        setUserRole(parsed.role);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userRole ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        ) : userRole === 'user' ? (
          <Stack.Screen name="UserApp" component={UserNavigator} />
        ) : userRole === 'vendor' ? (
          <Stack.Screen name="VendorApp" component={VendorNavigator} />
        ) : (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}