import { supabase } from './supabase';
import { Booking, TimeSlot, StaffMember, Business, Service } from '../types';
import { addMinutes, format, parseISO, isBefore, isAfter, setHours, setMinutes } from 'date-fns';

export const bookingService = {
  async getAvailableSlots(
    business: Business,
    service: Service,
    staff: StaffMember | null,
    date: Date
  ): Promise<TimeSlot[]> {
    const dayName = format(date, 'EEE'); // Mon, Tue, etc.
    const slots: TimeSlot[] = [];
    const staffList = staff ? [staff] : (business.staff ?? []);

    for (const s of staffList) {
      const dayHours = s.working_hours?.[dayName];
      if (!dayHours?.is_working) continue;

      const isDayOff = s.days_off?.some(
        (d) => format(parseISO(d), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      if (isDayOff) continue;

      const [startH, startM] = dayHours.start.split(':').map(Number);
      const [endH, endM] = dayHours.end.split(':').map(Number);

      let current = setMinutes(setHours(new Date(date), startH), startM);
      const endTime = setMinutes(setHours(new Date(date), endH), endM);
      const slotEnd = addMinutes(current, service.duration_minutes);

      // Fetch existing bookings for this staff on this day
      const startOfDay = format(date, "yyyy-MM-dd'T'00:00:00");
      const endOfDay = format(date, "yyyy-MM-dd'T'23:59:59");
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('staff_id', s.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .not('status', 'in', '("cancelled","no_show")');

      while (isAfter(endTime, addMinutes(current, service.duration_minutes - 1))) {
        const slotStart = new Date(current);
        const slotEndTime = addMinutes(slotStart, service.duration_minutes);

        const isBooked = (existingBookings ?? []).some((b) => {
          const bStart = parseISO(b.start_time);
          const bEnd = parseISO(b.end_time);
          return slotStart < bEnd && slotEndTime > bStart;
        });

        const isPast = isBefore(slotStart, new Date());

        if (!isPast) {
          slots.push({
            datetime: slotStart.toISOString(),
            is_available: !isBooked,
            staff_id: s.id,
            is_last_minute: false,
          });
        }

        current = addMinutes(current, 30);
      }
    }

    // Deduplicate by time (if "any available" mode picks first free staff)
    const seen = new Set<string>();
    return slots.filter((slot) => {
      const key = slot.datetime;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<{ data: Booking | null; error: string | null }> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    return { data: data as Booking | null, error: error?.message ?? null };
  },

  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        business:businesses(id, name, logo_url, address),
        service:services(name, duration_minutes, price),
        staff:staff(name, photo_url)
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });
    return (data as Booking[]) ?? [];
  },

  async getBusinessBookings(businessId: string, date?: Date): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:users(full_name, phone_number, avatar_url),
        service:services(name, duration_minutes, price),
        staff:staff(name, photo_url)
      `)
      .eq('business_id', businessId)
      .order('start_time');

    if (date) {
      const start = format(date, "yyyy-MM-dd'T'00:00:00");
      const end = format(date, "yyyy-MM-dd'T'23:59:59");
      query = query.gte('start_time', start).lte('start_time', end);
    }

    const { data } = await query;
    return (data as Booking[]) ?? [];
  },

  async cancelBooking(bookingId: string, reason: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', bookingId);
    return { error: error?.message ?? null };
  },

  async rescheduleBooking(
    bookingId: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('bookings')
      .update({ start_time: newStartTime, end_time: newEndTime, status: 'confirmed' })
      .eq('id', bookingId);
    return { error: error?.message ?? null };
  },

  async confirmBooking(bookingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);
    return { error: error?.message ?? null };
  },

  async completeBooking(bookingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);
    return { error: error?.message ?? null };
  },

  async markNoShow(bookingId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'no_show' })
      .eq('id', bookingId);
    return { error: error?.message ?? null };
  },

  async createManualBooking(booking: Partial<Booking>): Promise<{ data: Booking | null; error: string | null }> {
    const payload = { ...booking, is_manual: true, status: 'confirmed', deposit_paid: false };
    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    return { data: data as Booking | null, error: error?.message ?? null };
  },

  async getBusinessAnalytics(businessId: string, startDate: Date, endDate: Date): Promise<{
    total_bookings: number;
    total_revenue: number;
    new_customers: number;
    no_shows: number;
    cancellations: number;
    deposit_collected: number;
  }> {
    const { data } = await supabase
      .from('bookings')
      .select('status, total_price, deposit_amount, deposit_paid, customer_id')
      .eq('business_id', businessId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    const bookings = data ?? [];
    const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_id)).size;

    return {
      total_bookings: bookings.length,
      total_revenue: bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.total_price ?? 0), 0),
      new_customers: uniqueCustomers,
      no_shows: bookings.filter((b: any) => b.status === 'no_show').length,
      cancellations: bookings.filter((b: any) => b.status === 'cancelled').length,
      deposit_collected: bookings
        .filter((b: any) => b.deposit_paid)
        .reduce((sum: number, b: any) => sum + (b.deposit_amount ?? 0), 0),
    };
  },
};
