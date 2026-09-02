export type UserRole = "ADMIN" | "MANAGER" | "MEMBER";
export type CountryScope = "Global" | "India" | "America";
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "CANCELLED";
export type DietaryTag = "VEG" | "NON_VEG" | "VEGAN";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  country: CountryScope;
  avatarUrl?: string | null;
}

export interface MenuItem {
  id: number | string;
  restaurantId: number | string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string | null;
  dietaryTag: DietaryTag;
  imageUrl?: string | null;
}

export interface Restaurant {
  id: number | string;
  name: string;
  cuisine: string;
  country: string;
  rating: number;
  deliveryTime: string;
  imageUrl: string | null;
  menuItems: MenuItem[];
}

export interface PaymentMethod {
  id: number | string;
  country: string;
  methodType: string;
  details: string;
}

export interface OrderItem {
  id: number | string;
  menuItemId: number | string;
  quantity: number;
  price: number;
  menuItem?: {
    id: number | string;
    name: string;
    category?: string;
  } | null;
}

export interface Order {
  id: number | string;
  userId: string;
  country: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paymentMethodId: number | string | null;
  paymentMethod?: PaymentMethod | null;
  items: OrderItem[];
  user?: User | null;
}

export interface RegionalMetric {
  country: string;
  totalOrders: number;
  totalGmv: number;
  currency: string;
  activeRestaurants: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalOrders: number;
  totalPending: number;
  totalPaid: number;
  totalCancelled: number;
  regionalMetrics: RegionalMetric[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}
