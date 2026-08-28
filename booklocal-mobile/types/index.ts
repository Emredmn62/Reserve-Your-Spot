// ============================================================
// BookLocal — Core Types & Models
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  is_business_owner: boolean;
  fcm_token?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  sort_order: number;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery_urls: string[];
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  instagram_url?: string;
  website_url?: string;
  whatsapp_number?: string;
  opening_hours: Record<string, DayHours>;
  cancellation_policy?: string;
  deposit_percentage: number;
  brand_color?: string;
  is_approved: boolean;
  is_featured: boolean;
  boost_expires_at?: string;
  subscription_plan: 'free' | 'pro' | 'premium';
  rating: number;
  total_reviews: number;
  created_at: string;
  // Computed on client
  distance_km?: number;
  category?: Category;
  services?: Service[];
  staff?: StaffMember[];
  reviews?: Review[];
}

export interface DayHours {
  open: string;   // "09:00"
  close: string;  // "18:00"
  is_open: boolean;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  category_tag?: string;
  is_active: boolean;
  // Computed
  remaining_balance?: number;
  duration_display?: string;
}

export interface StaffMember {
  id: string;
  business_id: string;
  name: string;
  role?: string;
  photo_url?: string;
  bio?: string;
  working_hours: Record<string, StaffDayHours>;
  days_off: string[];
  is_active: boolean;
}

export interface StaffDayHours {
  start: string;
  end: string;
  is_working: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  staff_id?: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  remaining_balance: number;
  notes?: string;
  cancellation_reason?: string;
  is_manual: boolean;
  created_at: string;
  // Relations
  business?: Business;
  service?: Service;
  staff?: StaffMember;
  customer?: User;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'refunded' | 'failed';
export type PaymentType = 'deposit' | 'full' | 'subscription';

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  business_id: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id?: string;
  status: PaymentStatus;
  type: PaymentType;
  platform_fee: number;
  business_amount: number;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  business_id: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  customer?: User;
}

export interface Favourite {
  id: string;
  customer_id: string;
  business_id: string;
  created_at: string;
  business?: Business;
}

export interface LoyaltyCard {
  id: string;
  customer_id: string;
  business_id: string;
  total_stamps: number;
  required_stamps: number;
  reward_description: string;
  last_stamped_at?: string;
  business?: Business;
  // Computed
  is_complete?: boolean;
  stamps_remaining?: number;
}

export interface TimeSlot {
  datetime: string;
  is_available: boolean;
  staff_id?: string;
  is_last_minute: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'review_request' | 'rebook_suggestion';
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  period: string;
  total_bookings: number;
  total_revenue: number;
  new_customers: number;
  no_shows: number;
  average_rating: number;
  deposit_collected: number;
  cancellations: number;
}

// Booking flow state (passed between screens)
export interface BookingFlow {
  business: Business;
  service?: Service;
  staff?: StaffMember | null;
  selected_date?: string;
  selected_slot?: TimeSlot;
}

// Auth
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Admin
export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'moderator';
  created_at: string;
}
