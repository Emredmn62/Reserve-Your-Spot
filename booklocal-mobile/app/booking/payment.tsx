import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO, addMinutes } from 'date-fns';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { GoldButton } from '../../components/ui/GoldButton';
import { COLORS, SPACING, RADIUS, PLATFORM_FEE_PERCENT } from '../../constants/AppConstants';

export default function PaymentScreen() {
  const { business, service, staff, selectedSlot, setConfirmedBooking } = useBookingStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!business || !service || !selectedSlot || !user) {
    return (
      <View style={styles.safe}>
        <Text style={{ color: COLORS.grey, textAlign: 'center', marginTop: 100 }}>
          Something went wrong. Please start again.
        </Text>
      </View>
    );
  }

  const deposit = service.deposit_amount;
  const remaining = service.price - deposit;
  const platformFee = deposit * PLATFORM_FEE_PERCENT;
  const startTime = new Date(selectedSlot.datetime);
  const endTime = addMinutes(startTime, service.duration_minutes);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Create booking record
      const { data: booking, error: bookingErr } = await bookingService.createBooking({
        customer_id: user.id,
        business_id: business.id,
        service_id: service.id,
        staff_id: staff?.id ?? undefined,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        total_price: service.price,
        deposit_amount: deposit,
        deposit_paid: false,
        remaining_balance: remaining,
        notes: notes.trim() || undefined,
        is_manual: false,
      });

      if (bookingErr || !booking) {
        Alert.alert('Booking failed', bookingErr ?? 'Please try again.');
        setLoading(false);
        return;
      }

      // 2. Create payment intent via Supabase Edge Function
      const { clientSecret, error: payErr } = await paymentService.createPaymentIntent(
        booking.id,
        deposit
      );

      if (payErr || !clientSecret) {
        Alert.alert('Payment setup failed', payErr ?? 'Please try again.');
        setLoading(false);
        return;
      }

      // 3. Record payment
      await paymentService.recordPayment({
        booking_id: booking.id,
        customer_id: user.id,
        business_id: business.id,
        amount: deposit,
        currency: 'gbp',
        status: 'pending',
        type: 'deposit',
      });

      // 4. In a real integration, present Stripe payment sheet here:
      // const { error: stripeErr } = await initPaymentSheet({ paymentIntentClientSecret: clientSecret });
      // if (!stripeErr) { await presentPaymentSheet(); }

      // For now: simulate successful payment
      await paymentService.confirmDepositPaid(booking.id, 'sim_' + booking.id);

      const fullBooking = {
        ...booking,
        business,
        service,
        staff: staff ?? undefined,
        deposit_paid: true,
        status: 'confirmed' as const,
      };
      setConfirmedBooking(fullBooking);
      router.replace('/booking/confirmation');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Confirm & Pay</Text>
        </View>

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          <SummaryRow label="Business" value={business.name} />
          <SummaryRow label="Service" value={service.name} />
          <SummaryRow label="Team member" value={staff?.name ?? 'Any Available'} />
          <SummaryRow label="Date" value={format(startTime, 'EEEE d MMMM yyyy')} />
          <SummaryRow label="Time" value={`${format(startTime, 'HH:mm')} – ${format(endTime, 'HH:mm')}`} />

          <View style={styles.divider} />

          <SummaryRow label="Full service price" value={`£${service.price.toFixed(2)}`} />
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Deposit due now</Text>
            <Text style={styles.depositValue}>£{deposit.toFixed(2)}</Text>
          </View>
          <SummaryRow label="Pay in person after" value={`£${remaining.toFixed(2)}`} muted />
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>Notes for the business (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="e.g. Any specific requests..."
          placeholderTextColor={COLORS.greyDark}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Payment section placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.stripeNote}>
            <Text style={styles.stripeText}>🔒 Secure payment via Stripe</Text>
            <Text style={styles.stripeSubText}>
              Your deposit of £{deposit.toFixed(2)} will be charged now.
              The remaining £{remaining.toFixed(2)} is paid directly to the business.
            </Text>
          </View>
          {/* Stripe PaymentSheet integration point */}
          {/* In production: render the Stripe payment form here */}
          <View style={styles.cardInputPlaceholder}>
            <Text style={styles.cardInputText}>Card details entered securely via Stripe</Text>
          </View>
        </View>

        {/* Cancellation notice */}
        {business.cancellation_policy && (
          <View style={styles.cancelNotice}>
            <Text style={styles.cancelTitle}>Cancellation Policy</Text>
            <Text style={styles.cancelText}>{business.cancellation_policy}</Text>
          </View>
        )}

        <GoldButton
          title={`Pay Deposit £${deposit.toFixed(2)}`}
          onPress={handlePay}
          loading={loading}
          style={styles.payBtn}
        />

        <Text style={styles.termsText}>
          By paying, you agree to the cancellation policy above. Deposits are non-refundable for no-shows.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <View style={sumStyles.row}>
      <Text style={sumStyles.label}>{label}</Text>
      <Text style={[sumStyles.value, muted && sumStyles.muted]}>{value}</Text>
    </View>
  );
}
const sumStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  label: { fontSize: 14, color: COLORS.grey },
  value: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  muted: { color: COLORS.greyDark },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.lg },
  back: { fontSize: 22, color: COLORS.gold },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.surface3, marginVertical: SPACING.md },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.gold + '11',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  depositLabel: { fontSize: 15, color: COLORS.gold, fontWeight: '700' },
  depositValue: { fontSize: 22, color: COLORS.gold, fontWeight: '900' },
  sectionLabel: { fontSize: 13, color: COLORS.greyLight, fontWeight: '600', marginBottom: SPACING.sm },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.surface3,
    marginBottom: SPACING.lg,
    height: 90,
  },
  stripeNote: { marginBottom: SPACING.md },
  stripeText: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  stripeSubText: { fontSize: 13, color: COLORS.grey, lineHeight: 20 },
  cardInputPlaceholder: {
    backgroundColor: COLORS.surface3,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  cardInputText: { color: COLORS.grey, fontSize: 13 },
  cancelNotice: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  cancelTitle: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  cancelText: { fontSize: 13, color: COLORS.grey, lineHeight: 20 },
  payBtn: { marginBottom: SPACING.md },
  termsText: { fontSize: 12, color: COLORS.greyDark, textAlign: 'center', lineHeight: 18 },
});
