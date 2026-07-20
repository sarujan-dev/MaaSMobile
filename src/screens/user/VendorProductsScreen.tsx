import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { Product, CartItem, Vendor } from '../../types';

export default function VendorProductsScreen({ navigation, route }: any): React.JSX.Element {
  const { vendor } = route.params as { vendor: Vendor };
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get(`/vendors/${vendor.id}/products`);
      setProducts(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      setCart(cart.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (product: Product) => {
    const existing = cart.find(i => i.product.id === product.id);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      setCart(cart.filter(i => i.product.id !== product.id));
    }
  };

  const getQuantity = (productId: number) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Please add items to cart first');
      return;
    }
    navigation.navigate('Checkout', { cart, vendor });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{vendor.business_name}</Text>
          <Text style={styles.headerSubtitle}>
            {vendor.category?.icon} {vendor.category?.name} •
            ⭐ {vendor.average_rating}
          </Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products.filter(p => p.is_available)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.note ? (
                <Text style={styles.productNote}>📝 {item.note}</Text>
              ) : null}
              <Text style={styles.productStock}>
                Stock: {item.stock_quantity} {item.unit}
              </Text>
              <Text style={styles.productPrice}>
                Rs. {item.price} / {item.unit}
              </Text>
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantityContainer}>
              {getQuantity(item.id) === 0 ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addToCart(item)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(item)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{getQuantity(item.id)}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(item)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartItems}>
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartTotal}>
              Rs. {getTotalPrice().toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>
              Checkout →
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#A7F3D0',
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  productNote: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  quantityContainer: {
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    backgroundColor: '#059669',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#064E3B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItems: {
    color: '#A7F3D0',
    fontSize: 13,
  },
  cartTotal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});