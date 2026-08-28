import { create } from 'zustand';
import { Business, Service, StaffMember, TimeSlot, Booking } from '../types';

interface BookingFlowState {
  // Current booking flow
  business: Business | null;
  service: Service | null;
  staff: StaffMember | null;
  anyStaff: boolean;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  confirmedBooking: Booking | null;

  // Actions
  setBusiness: (b: Business) => void;
  setService: (s: Service) => void;
  setStaff: (s: StaffMember | null, any?: boolean) => void;
  setDate: (d: Date) => void;
  setSlot: (slot: TimeSlot) => void;
  setConfirmedBooking: (b: Booking) => void;
  resetFlow: () => void;
}

export const useBookingStore = create<BookingFlowState>((set) => ({
  business: null,
  service: null,
  staff: null,
  anyStaff: false,
  selectedDate: null,
  selectedSlot: null,
  confirmedBooking: null,

  setBusiness: (business) => set({ business, service: null, staff: null, selectedDate: null, selectedSlot: null }),
  setService: (service) => set({ service }),
  setStaff: (staff, any = false) => set({ staff, anyStaff: any }),
  setDate: (selectedDate) => set({ selectedDate, selectedSlot: null }),
  setSlot: (selectedSlot) => set({ selectedSlot }),
  setConfirmedBooking: (confirmedBooking) => set({ confirmedBooking }),
  resetFlow: () => set({
    business: null,
    service: null,
    staff: null,
    anyStaff: false,
    selectedDate: null,
    selectedSlot: null,
    confirmedBooking: null,
  }),
}));
