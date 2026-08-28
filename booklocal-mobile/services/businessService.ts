import { supabase } from './supabase';
import { Business, Service, StaffMember, Review } from '../types';
import { DEFAULT_SEARCH_RADIUS_KM } from '../constants/AppConstants';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const businessService = {
  async getNearbyBusinesses(
    lat: number,
    lng: number,
    radiusKm = DEFAULT_SEARCH_RADIUS_KM,
    categorySlug?: string
  ): Promise<Business[]> {
    let query = supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .eq('is_approved', true);

    if (categorySlug && categorySlug !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as Business[])
      .map((b) => ({
        ...b,
        distance_km: haversineKm(lat, lng, b.latitude, b.longitude),
      }))
      .filter((b) => b.distance_km! <= radiusKm)
      .sort((a, b) => a.distance_km! - b.distance_km!);
  },

  async searchBusinesses(
    query: string,
    categorySlug?: string,
    lat?: number,
    lng?: number
  ): Promise<Business[]> {
    let dbQuery = supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .eq('is_approved', true)
      .ilike('name', `%${query}%`);

    if (categorySlug && categorySlug !== 'all') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) dbQuery = dbQuery.eq('category_id', cat.id);
    }

    const { data, error } = await dbQuery.limit(30);
    if (error || !data) return [];

    const results = data as Business[];
    if (lat != null && lng != null) {
      return results
        .map((b) => ({ ...b, distance_km: haversineKm(lat, lng, b.latitude, b.longitude) }))
        .sort((a, b) => a.distance_km! - b.distance_km!);
    }
    return results;
  },

  async getBusinessBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, category:categories(*), services(*), staff(*), reviews(*, customer:users(*))')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Business;
  },

  async getBusinessById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, category:categories(*), services(*), staff(*), reviews(*, customer:users(*))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Business;
  },

  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    if (error) return null;
    return data as Business;
  },

  async createBusiness(business: Partial<Business>): Promise<{ data: Business | null; error: string | null }> {
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select()
      .single();
    return { data: data as Business | null, error: error?.message ?? null };
  },

  async updateBusiness(id: string, updates: Partial<Business>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('businesses').update(updates).eq('id', id);
    return { error: error?.message ?? null };
  },

  async getFeaturedBusinesses(): Promise<Business[]> {
    const { data } = await supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(10);
    return (data as Business[]) ?? [];
  },

  async getServices(businessId: string): Promise<Service[]> {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    return (data as Service[]) ?? [];
  },

  async createService(service: Partial<Service>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('services').insert(service);
    return { error: error?.message ?? null };
  },

  async updateService(id: string, updates: Partial<Service>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('services').update(updates).eq('id', id);
    return { error: error?.message ?? null };
  },

  async deleteService(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return { error: error?.message ?? null };
  },

  async getStaff(businessId: string): Promise<StaffMember[]> {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    return (data as StaffMember[]) ?? [];
  },

  async createStaff(member: Partial<StaffMember>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('staff').insert(member);
    return { error: error?.message ?? null };
  },

  async updateStaff(id: string, updates: Partial<StaffMember>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('staff').update(updates).eq('id', id);
    return { error: error?.message ?? null };
  },

  async getReviews(businessId: string): Promise<Review[]> {
    const { data } = await supabase
      .from('reviews')
      .select('*, customer:users(full_name, avatar_url)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    return (data as Review[]) ?? [];
  },

  async createReview(review: Partial<Review>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('reviews').insert(review);
    return { error: error?.message ?? null };
  },

  async toggleFavourite(customerId: string, businessId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('favourites')
      .select('id')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .single();

    if (existing) {
      await supabase.from('favourites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('favourites').insert({ customer_id: customerId, business_id: businessId });
      return true;
    }
  },

  async getFavourites(customerId: string): Promise<Business[]> {
    const { data } = await supabase
      .from('favourites')
      .select('business:businesses(*, category:categories(*))')
      .eq('customer_id', customerId);
    return (data?.map((f: any) => f.business) ?? []) as Business[];
  },

  async isFavourite(customerId: string, businessId: string): Promise<boolean> {
    const { data } = await supabase
      .from('favourites')
      .select('id')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .single();
    return !!data;
  },

  async getLoyaltyCard(customerId: string, businessId: string) {
    const { data } = await supabase
      .from('loyalty_cards')
      .select('*, business:businesses(name, logo_url)')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .single();
    return data;
  },

  async getCustomerLoyaltyCards(customerId: string) {
    const { data } = await supabase
      .from('loyalty_cards')
      .select('*, business:businesses(name, logo_url, brand_color)')
      .eq('customer_id', customerId);
    return data ?? [];
  },

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
};
