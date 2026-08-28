// ============================================================
// BookLocal — App Constants
// To rename the app, change APP_NAME here only.
// ============================================================

export const APP_NAME = 'BookLocal';
export const APP_TAGLINE = 'Discover & Book Local Services';
export const APP_SLUG = 'booklocal';

// Supabase — replace with your project values
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

// Stripe — replace with your publishable key
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY ?? 'pk_test_your_stripe_key';

// Google Maps
export const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_MAPS_KEY ?? 'your-google-maps-key';

// Monetisation
export const PLATFORM_FEE_PERCENT = 0.10; // 10% of deposit goes to platform
export const SUBSCRIPTION_FREE_BOOKING_LIMIT = 20;
export const SUBSCRIPTION_PRO_PRICE = 19.99;
export const SUBSCRIPTION_PREMIUM_PRICE = 49.99;

// Search
export const DEFAULT_SEARCH_RADIUS_KM = 10;
export const MAX_SEARCH_RADIUS_KM = 50;

// Booking
export const MIN_CANCELLATION_HOURS = 24;
export const REMINDER_HOURS_BEFORE = [24, 2];

// Design
export const COLORS = {
  black: '#0A0A0A',
  surface: '#1A1A1A',
  surface2: '#252525',
  surface3: '#2F2F2F',
  gold: '#C9A84C',
  goldLight: '#E2C47A',
  goldDark: '#A8872B',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  grey: '#888888',
  greyLight: '#AAAAAA',
  greyDark: '#555555',
  error: '#FF4444',
  success: '#44BB44',
  warning: '#FF8800',
  info: '#4488FF',
} as const;

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const CATEGORIES = [
  { id: '1', name: 'All', slug: 'all', emoji: '🏠' },
  { id: '2', name: 'Barbers', slug: 'barbers', emoji: '✂️' },
  { id: '3', name: 'Hair Salons', slug: 'hair', emoji: '💇' },
  { id: '4', name: 'Nail Shops', slug: 'nails', emoji: '💅' },
  { id: '5', name: 'Beauty', slug: 'beauty', emoji: '✨' },
  { id: '6', name: 'Lash Tech', slug: 'lash', emoji: '👁️' },
  { id: '7', name: 'Personal Training', slug: 'pt', emoji: '💪' },
  { id: '8', name: 'Tutors', slug: 'tutors', emoji: '📚' },
  { id: '9', name: 'Massage', slug: 'massage', emoji: '🧖' },
  { id: '10', name: 'Car Wash', slug: 'carwash', emoji: '🚗' },
  { id: '11', name: 'Cleaning', slug: 'cleaning', emoji: '🧹' },
  { id: '12', name: 'Mechanics', slug: 'mechanics', emoji: '🔧' },
] as const;
