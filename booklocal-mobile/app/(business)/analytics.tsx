import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { bookingService } from '../../services/bookingService';
import { Business } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

type Period = 'week' | 'month' | 'all';

const { width: W } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const [business, setBiz] = useState<Business | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_revenue: 0,
    new_customers: 0,
    no_shows: 0,
    cancellations: 0,
    deposit_collected: 0,
    average_rating: 0,
  });

  useEffect(() => {
    if (!user) return;
    businessService.getBusinessByOwnerId(user.id).then(async (biz) => {
      setBiz(biz);
      if (!biz) return;

      const now = new Date();
      let start: Date, end: Date;
      if (period === 'week') { start = startOfWeek(now, { weekStartsOn: 1 }); end = endOfWeek(now, { weekStartsOn: 1 }); }
      else if (period === 'month') { start = startOfMonth(now); end = endOfMonth(now); }
      else { start = new Date(2020, 0, 1); end = new Date(2099, 0, 1); }

      const s = await bookingService.getBusinessAnalytics(biz.id, start, end);
      setStats({ ...s, average_rating: biz.rating });
    });
  }, [user, period]);

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  const kpis = [
    { emoji: '📅', label: 'Bookings', value: stats.total_bookings, color: COLORS.gold },
    { emoji: '💰', label: 'Revenue', value: `£${stats.total_revenue.toFixed(0)}`, color: '#44BB44' },
    { emoji: '💳', label: 'Deposits', value: `£${stats.deposit_collected.toFixed(0)}`, color: '#4488FF' },
    { emoji: '👥', label: 'Customers', value: stats.new_customers, color: '#FF8800' },
    { emoji: '❌', label: 'No Shows', value: stats.no_shows, color: COLORS.error },
    { emoji: '🔄', label: 'Cancelled', value: stats.cancellations, color: COLORS.greyLight },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Analytics</Text>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodChip, period === p.key && styles.periodChipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingEmoji}>⭐</Text>
          <View>
            <Text style={styles.ratingValue}>{stats.average_rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Average Rating</Text>
          </View>
          <View style={styles.ratingStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} style={{ fontSize: 22, color: i < Math.round(stats.average_rating) ? COLORS.gold : COLORS.surface3 }}>★</Text>
            ))}
          </View>
        </View>

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((k) => (
            <View key={k.label} style={[styles.kpiCard, { borderLeftColor: k.color }]}>
              <Text style={styles.kpiEmoji}>{k.emoji}</Text>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Simple bar chart */}
        <Text style={styles.chartTitle}>Bookings Overview</Text>
        <View style={styles.chart}>
          {Array.from({ length: 7 }).map((_, i) => {
            const h = Math.random() * 80 + 10; // placeholder random heights
            return (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: h }]} />
                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.chartNote}>* Connect live data from your bookings</Text>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Grow Your Business</Text>
          <Text style={styles.tipItem}>• Enable Last Minute slots to fill empty times</Text>
          <Text style={styles.tipItem}>• Add staff photos to increase bookings</Text>
          <Text style={styles.tipItem}>• Respond to reviews to build trust</Text>
          <Text style={styles.tipItem}>• Upgrade to Pro for unlimited bookings</Text>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.lg },
  periodRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  periodChip: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.sm },
  periodChipActive: { backgroundColor: COLORS.gold },
  periodText: { fontSize: 13, fontWeight: '700', color: COLORS.grey },
  periodTextActive: { color: COLORS.black },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gold + '33',
  },
  ratingEmoji: { fontSize: 32 },
  ratingValue: { fontSize: 36, fontWeight: '900', color: COLORS.gold, lineHeight: 40 },
  ratingLabel: { fontSize: 13, color: COLORS.grey },
  ratingStars: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  kpiCard: {
    width: (W - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
  },
  kpiEmoji: { fontSize: 22, marginBottom: SPACING.xs },
  kpiValue: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  kpiLabel: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
  chartTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  bar: { width: '80%', backgroundColor: COLORS.gold, borderRadius: 4 },
  barLabel: { fontSize: 11, color: COLORS.grey },
  chartNote: { fontSize: 11, color: COLORS.greyDark, marginBottom: SPACING.xl, textAlign: 'center' },
  tipsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.surface3 },
  tipsTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  tipItem: { fontSize: 14, color: COLORS.greyLight, lineHeight: 24 },
});
