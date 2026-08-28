import React from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { useBookingStore } from '../../store/useBookingStore';
import { GoldButton } from '../../components/ui/GoldButton';
import { COLORS, SPACING, RADIUS, APP_NAME } from '../../constants/AppConstants';

export default function ConfirmationScreen() {
  const { confirmedBooking, resetFlow } = useBookingStore();

  const handleShare = async () => {
    if (!confirmedBooking) return;
    await Share.share({
      message: `I just booked ${confirmedBooking.service?.name} at ${confirmedBooking.business?.name} via ${APP_NAME}! 🎉`,
    });
  };

  const handleGoHome = () => {
    resetFlow();
    router.replace('/(customer)/home');
  };

  if (!confirmedBooking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No booking found.</Text>
          <GoldButton title="Go Home" onPress={handleGoHome} />
        </View>
      </SafeAreaView>
    );
  }

  const startTime = parseISO(confirmedBooking.start_time);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Gold checkmark */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.heading}>Booking Confirmed!</Text>
        <Text style={styles.sub}>You'll receive a confirmation shortly.</Text>

        {/* Details card */}
        <View style={styles.card}>
          <DetailRow emoji="🏢" label="Business" value={confirmedBooking.business?.name ?? ''} />
          <DetailRow emoji="✂️" label="Service" value={confirmedBooking.service?.name ?? ''} />
          {confirmedBooking.staff && (
            <DetailRow emoji="👤" label="Team member" value={confirmedBooking.staff.name} />
          )}
          <DetailRow emoji="📅" label="Date" value={format(startTime, 'EEEE d MMMM yyyy')} />
          <DetailRow emoji="🕐" label="Time" value={format(startTime, 'HH:mm')} />
          <View style={styles.divider} />
          <DetailRow emoji="💳" label="Deposit paid" value={`£${confirmedBooking.deposit_amount.toFixed(2)}`} gold />
          <DetailRow emoji="💵" label="Pay in person" value={`£${confirmedBooking.remaining_balance.toFixed(2)}`} />
        </View>

        {/* Rebook hint */}
        <View style={styles.rebookHint}>
          <Text style={styles.rebookText}>
            💡 We'll remind you when it's time to rebook!
          </Text>
        </View>

        <GoldButton title="Back to Home" onPress={handleGoHome} style={styles.homeBtn} />

        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>🔗 Share this booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ emoji, label, value, gold = false }: { emoji: string; label: string; value: string; gold?: boolean }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.emoji}>{emoji}</Text>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, gold && detailStyles.gold]}>{value}</Text>
    </View>
  );
}
const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  emoji: { fontSize: 18, width: 26 },
  label: { fontSize: 14, color: COLORS.grey, flex: 1 },
  value: { fontSize: 14, fontWeight: '700', color: COLORS.white, textAlign: 'right', flex: 1 },
  gold: { color: COLORS.gold },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  container: { flex: 1, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  errorText: { color: COLORS.grey, fontSize: 16, marginBottom: SPACING.lg },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmark: { fontSize: 48, color: COLORS.black, fontWeight: '900', lineHeight: 56 },
  heading: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.xs, textAlign: 'center' },
  sub: { fontSize: 15, color: COLORS.grey, marginBottom: SPACING.xl, textAlign: 'center' },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  divider: { height: 1, backgroundColor: COLORS.surface3, marginVertical: SPACING.sm },
  rebookHint: {
    width: '100%',
    backgroundColor: COLORS.gold + '11',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '33',
    marginBottom: SPACING.xl,
  },
  rebookText: { fontSize: 13, color: COLORS.gold, textAlign: 'center' },
  homeBtn: { width: '100%', marginBottom: SPACING.md },
  shareBtn: { padding: SPACING.md },
  shareText: { color: COLORS.grey, fontSize: 14 },
});
