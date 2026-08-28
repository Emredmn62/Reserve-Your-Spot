import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { bookingService } from '../../services/bookingService';
import { Booking, Business } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const [business, setBiz] = useState<Business | null>(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [bookings, setBookings] = useState<Booking[]>([]);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!user) return;
    businessService.getBusinessByOwnerId(user.id).then(async (biz) => {
      setBiz(biz);
      if (biz) {
        const allBookings: Booking[] = [];
        for (const day of days) {
          const dayBookings = await bookingService.getBusinessBookings(biz.id, day);
          allBookings.push(...dayBookings);
        }
        setBookings(allBookings);
      }
    });
  }, [user, weekStart]);

  const bookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.start_time), day));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Week navigation */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setWeekStart(subWeeks(weekStart, 1))} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}
        </Text>
        <TouchableOpacity onPress={() => setWeekStart(addWeeks(weekStart, 1))} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calScroll}>
        <View style={styles.calRow}>
          {days.map((day) => {
            const dayBookings = bookingsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <View key={day.toISOString()} style={[styles.dayCol, isToday && styles.todayCol]}>
                <Text style={[styles.dayName, isToday && styles.todayText]}>{format(day, 'EEE')}</Text>
                <Text style={[styles.dayNum, isToday && styles.todayNum]}>{format(day, 'd')}</Text>
                <View style={styles.bookingsList}>
                  {dayBookings.length === 0 ? (
                    <View style={styles.emptySlot} />
                  ) : (
                    dayBookings.map((b) => (
                      <View key={b.id} style={[styles.bookingBlock, { backgroundColor: STATUS_BG[b.status] ?? COLORS.gold + '33' }]}>
                        <Text style={styles.blockTime}>{format(new Date(b.start_time), 'HH:mm')}</Text>
                        <Text style={styles.blockService} numberOfLines={1}>{b.service?.name}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUS_BG: Record<string, string> = {
  pending: '#C9A84C33',
  confirmed: '#44BB4433',
  completed: '#88888833',
  cancelled: '#FF444433',
  no_show: '#FF660033',
};

const COL_W = 120;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  navBtn: { padding: SPACING.sm },
  navArrow: { fontSize: 28, color: COLORS.gold },
  weekLabel: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  calScroll: { flex: 1 },
  calRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm },
  dayCol: { width: COL_W, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm },
  todayCol: { borderWidth: 1.5, borderColor: COLORS.gold },
  dayName: { fontSize: 12, color: COLORS.grey, textAlign: 'center', fontWeight: '700' },
  dayNum: { fontSize: 18, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  todayText: { color: COLORS.gold },
  todayNum: { color: COLORS.gold },
  bookingsList: { gap: SPACING.xs },
  emptySlot: { height: 60, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.surface3, borderStyle: 'dashed' },
  bookingBlock: { borderRadius: RADIUS.sm, padding: SPACING.xs },
  blockTime: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },
  blockService: { fontSize: 11, color: COLORS.white },
});
