import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { Vendor } from '../../types';

const { width, height } = Dimensions.get('window');

export default function UserHomeScreen({ navigation }: any): React.JSX.Element {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const CATEGORIES = ['All', '🐟 Fish', '🥦 Vegetables', '🍞 Bakery', '🍦 Ice Cream', '🗑️ Garbage'];

  useEffect(() => {
    getUserLocation();
    loadVendors();
    const interval = setInterval(loadVendors, 3000);
    return () => clearInterval(interval);
  }, []);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const loadVendors = async () => {
    try {
      const res = await api.get('/vendors/locations');
      setVendors(res.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const filteredVendors = selectedCategory === 'All'
    ? vendors
    : vendors.filter(v => v.category?.name === selectedCategory.split(' ')[1]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading vendors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛵 MaaS</Text>
          <Text style={styles.headerSubtitle}>Find vendors near you</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === item && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(item)}>
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation?.latitude || 8.5874,
          longitude: userLocation?.longitude || 81.2152,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton>

        {/* Vendor Markers */}
        {filteredVendors.map((vendor) =>
          vendor.location ? (
            <Marker
              key={vendor.id}
              coordinate={{
                latitude: parseFloat(vendor.location.lat.toString()),
                longitude: parseFloat(vendor.location.lng.toString()),
              }}
              title={vendor.business_name}
              description={`⭐ ${vendor.average_rating} • ${vendor.category?.name}`}
              onPress={() => setSelectedVendor(vendor)}>
              <View style={styles.markerContainer}>
                <Text style={styles.markerIcon}>
                  {vendor.category?.icon || '🛵'}
                </Text>
              </View>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* Selected Vendor Card */}
      {selectedVendor && (
        <View style={styles.vendorCard}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectedVendor(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.vendorName}>{selectedVendor.business_name}</Text>
          <Text style={styles.vendorCategory}>
            {selectedVendor.category?.icon} {selectedVendor.category?.name}
          </Text>
          <View style={styles.vendorMeta}>
            <Text style={styles.vendorRating}>
              ⭐ {selectedVendor.average_rating} ({selectedVendor.total_ratings} reviews)
            </Text>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>🟢 Online</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('VendorProducts', { vendor: selectedVendor })}>
            <Text style={styles.viewBtnText}>View Products & Order →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vendors Count */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} online
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#059669',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#A7F3D0',
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  categoryBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 20,
  },
  vendorCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  vendorCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  vendorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorRating: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  onlineBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  viewBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  countBadge: {
    position: 'absolute',
    top: 130,
    right: 16,
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});