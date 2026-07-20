import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../api/axios';
import { CartItem, Vendor } from '../../types';

export default function CheckoutScreen({ navigation, route }: any): React.JSX.Element {
  const { cart, vendor } = route.params as { cart: CartItem[]; vendor: Vendor };

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);

  const getTotalPrice = () =>
    cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const getTotalItems = () =>
    cart.reduce((sum, i) => sum + i.quantity, 0);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission required');
        setLocating(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setDeliveryLat(location.coords.latitude);
      setDeliveryLng(location.coords.longitude);

      // Reverse geocode
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        setAddress(`${g.street || ''} ${g.city || ''} ${g.region || ''}`.trim());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
    setLocating(false);
  };

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      Alert.alert('Error', 'Please fill in address and phone number');
      return;
    }
    setLoading(true);
    try {
      const orderItems = cart.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      }));

      await api.post('/orders', {
        vendor_id: vendor.id,
        delivery_address: address,
        contact_number: phone,
        notes,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        total_amount: getTotalPrice(),
        items: orderItems,
      });

      Alert.alert(
        '✅ Order Placed!',
        'Your order has been placed successfully. Wait for vendor to accept.',
        [{ text: 'OK', onPress: () => navigation.navigate('HomeTabs') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Order Summary</Text>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemUnit}>
                  {item.quantity} x {item.product.unit}
                </Text>
              </View>
              <Text style={styles.orderItemPrice}>
                Rs. {(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total ({getTotalItems()} items)
            </Text>
            <Text style={styles.totalPrice}>
              Rs. {getTotalPrice().toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛵 Vendor</Text>
          <Text style={styles.vendorName}>{vendor.business_name}</Text>
          <Text style={styles.vendorCategory}>
            {vendor.category?.icon} {vendor.category?.name}
          </Text>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Details</Text>

          <Text style={styles.label}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Enter delivery address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={detectLocation}
              disabled={locating}>
              {locating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.locationBtnText}>📍</Text>
              )}
            </TouchableOpacity>
          </View>

          {deliveryLat && (
            <Text style={styles.locationDetected}>
              ✅ Location detected: {deliveryLat.toFixed(4)}, {deliveryLng?.toFixed(4)}
            </Text>
          )}

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Any special instructions..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderBtnText}>
              Place Order — Rs. {getTotalPrice().toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  orderItemUnit: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vendorCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressInput: {
    flex: 1,
  },
  locationBtn: {
    backgroundColor: '#059669',
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBtnText: {
    fontSize: 20,
  },
  locationDetected: {
    fontSize: 12,
    color: '#059669',
    marginTop: 6,
  },
  orderBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});