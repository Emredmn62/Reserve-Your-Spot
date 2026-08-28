import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { bookingService } from '../../services/bookingService';
import { BookingCard } from '../../components/ui/BookingCard';
import { Booking, BookingStatus } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

type Tab = 'upcoming' | 'past' | 'cancelled';

export default function MyBookingsScreen() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    if (!user) return;
    const data = await bookingService.getCustomerBookings(user.id);
    setBookings(data);
    setRefreshing(false);
  };

  useEffect(() => { loadBookings(); }, [user]);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const start = new Date(b.start_time);
    if (activeTab === 'upcoming') return start >= now && b.status !== 'cancelled';
    if (activeTab === 'past') return start < now && b.status !== 'cancelled';
    return b.status === 'cancelled';
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const EMPTY: Record<Tab, { emoji: string; text: string }> = {
    upcoming: { emoji: '📅', text: 'No upcoming bookings.\nFind a business and book now!' },
    past: { emoji: '🕐', text: 'No past bookings yet.' },
    cancelled: { emoji: '❌', text: 'No cancelled bookings.' },
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>My Bookings</Text>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} tintColor={COLORS.gold} />}
        renderItem={({ item }) => <BookingCard booking={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{EMPTY[activeTab].emoji}</Text>
            <Text style={styles.emptyText}>{EMPTY[activeTab].text}</Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity onPress={() => router.push('/(customer)/home')} style={styles.findBtn}>
                <Text style={styles.findBtnText}>Find a Business →</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  tabs: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.sm, backgroundColor: COLORS.surface },
  tabActive: { backgroundColor: COLORS.gold },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.grey },
  tabTextActive: { color: COLORS.black },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: COLORS.grey, textAlign: 'center', lineHeight: 24 },
  findBtn: { marginTop: SPACING.md, backgroundColor: COLORS.gold, borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  findBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.black },
});
