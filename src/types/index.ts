export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'user';
  avatar?: string;
  phone?: string;
  city?: string;
}

export interface Vendor {
  id: number;
  user_id: number;
  business_name: string;
  category_id: number;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  is_online: boolean;
  average_rating: number;
  total_ratings: number;
  user?: User;
  category?: Category;
  location?: VendorLocation;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface VendorLocation {
  lat: number;
  lng: number;
}

export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  price: number;
  unit: string;
  stock_quantity: number;
  is_available: boolean;
  note?: string;
  product_image?: string;
}

export interface Order {
  id: number;
  user_id: number;
  vendor_id: number;
  order_number: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  contact_number: string;
  notes?: string;
  created_at: string;
  vendor?: Vendor;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Message {
  id: number;
  order_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}