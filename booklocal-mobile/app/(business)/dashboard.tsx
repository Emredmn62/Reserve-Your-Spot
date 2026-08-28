import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { bookingService } from '../../services/bookingService';
import { Business, Booking } from '../../types';
import { BookingCard } from '../../components/ui/BookingCard';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [business, setBusiness] = useState<Business | null>(null);
  const [todaysBookings, setTodaysBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, outstanding: 0 });

  const loadData = async () => {
    if (!user) return;
    const biz = await businessService.getBusinessByOwnerId(user.id);
    setBusiness(biz);
    if (biz) {
      const bookings = await bookingService.getBusinessBookings(biz.id, new Date());
      setTodaysBookings(bookings);
      const rev = bookings
        .filter((b) => b.status === 'completed' || b.deposit_paid)
        .reduce((sum, b) => sum + b.deposit_amount, 0);
      const outstanding = bookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.remaining_balance, 0);
      setStats({ revenue: rev, outstanding });
    }
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const today = format(new Date(), 'EEEE d MMMM');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.gold} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessName}>{business?.name ?? 'Your Business'}</Text>
            <Text style={styles.todayLabel}>{today}</Text>
          </View>
          {!business?.is_approved && (
            <View style={styles.pendingChip}>
              <Text style={styles.pendingText}>⏳ Pending</Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard emoji="📅" label="Today's bookings" value={`${todaysBookings.length}`} />
          <StatCard emoji="💰" label="Deposits collected" value={`£${stats.revenue.toFixed(0)}`} />
          <StatCard emoji="⏳" label="Outstanding" value={`£${stats.outstanding.toFixed(0)}`} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <QuickAction emoji="➕" label="New Booking" onPress={() => {}} />
          <QuickAction emoji="🚫" label="Block Time" onPress={() => {}} />
          <QuickAction emoji="📋" label="View Services" onPress={() => {}} />
          <QuickAction emoji="📣" label="Last Minute" onPress={() => {}} />
        </View>

        {/* Today's schedule */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todaysBookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>No bookings today. Enjoy the quiet!</Text>
          </View>
        ) : (
          todaysBookings.map((b) => <BookingCard key={b.id} booking={b} showBusiness={false} />)
        )}

        {/* Pending approval notice */}
        {!business?.is_approved && (
          <View style={styles.approvalNotice}>
            <Text style={styles.approvalTitle}>🔍 Awaiting Approval</Text>
            <Text style={styles.approvalText}>
              Your business is under review. You'll be notified within 24 hours once approved and visible to customers.
            </Text>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 22 },
  value: { fontSize: 20, fontWeight: '900', color: COLORS.gold },
  label: { fontSize: 10, color: COLORS.grey, textAlign: 'center' },
});

function QuickAction({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={qaStyles.btn} onPress={onPress} activeOpacity={0.8}>
      <Text style={qaStyles.emoji}>{emoji}</Text>
      <Text style={qaStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const qaStyles = StyleSheet.create({
  btn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.surface3 },
  emoji: { fontSize: 26 },
  label: { fontSize: 11, color: COLORS.greyLight, textAlign: 'center', fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  businessName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  todayLabel: { fontSize: 13, color: COLORS.grey, marginTop: 2 },
  pendingChip: { backgroundColor: COLORS.warning + '22', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.warning },
  pendingText: { fontSize: 12, color: COLORS.warning, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  actions: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, color: COLORS.grey },
  approvalNotice: {
    margin: SPACING.lg,
    backgroundColor: COLORS.warning + '11',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
  },
  approvalTitle: { fontSize: 15, fontWeight: '800', color: COLORS.warning, marginBottom: SPACING.sm },
  approvalText: { fontSize: 13, color: COLORS.greyLight, lineHeight: 20 },
});
