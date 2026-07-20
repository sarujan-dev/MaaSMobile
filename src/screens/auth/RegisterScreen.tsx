import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../../api/axios';

const CATEGORIES = [
  { id: 1, name: '🐟 Fish' },
  { id: 2, name: '🥦 Vegetables' },
  { id: 3, name: '🍞 Bakery' },
  { id: 4, name: '🍦 Ice Cream' },
  { id: 5, name: '🗑️ Garbage' },
];

export default function RegisterScreen({ navigation }: any): React.JSX.Element {
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Vendor fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (role === 'vendor' && (!businessName || !phone || !vehicleNumber || !categoryId)) {
      Alert.alert('Error', 'Please fill in all vendor fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        role,
        ...(role === 'vendor' && {
          business_name: businessName,
          phone,
          vehicle_number: vehicleNumber,
          category_id: categoryId,
          description,
        }),
      });
      navigation.navigate('Otp', { email });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛵 MaaS</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the MaaS platform</Text>
        </View>

        <View style={styles.form}>

          {/* Role Selector */}
          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'user' && styles.roleActive]}
              onPress={() => setRole('user')}>
              <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>
                👤 Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'vendor' && styles.roleActive]}
              onPress={() => setRole('vendor')}>
              <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>
                🛵 Vendor
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Common Fields ── */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />

          {/* ── Vendor Fields ── */}
          {role === 'vendor' && (
            <>
              <Text style={styles.sectionTitle}>Business Information</Text>

              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Vehicle Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your vehicle number"
                value={vehicleNumber}
                onChangeText={setVehicleNumber}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      categoryId === cat.id && styles.categoryActive,
                    ]}
                    onPress={() => setCategoryId(cat.id)}>
                    <Text style={[
                      styles.categoryText,
                      categoryId === cat.id && styles.categoryTextActive,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Describe your business..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {role === 'vendor' ? 'Register as Vendor' : 'Register as Customer'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#064E3B',
    marginTop: 24,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleTextActive: {
    color: '#059669',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  categoryActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#059669',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginBold: {
    color: '#059669',
    fontWeight: 'bold',
  },
});