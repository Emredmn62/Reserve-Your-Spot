import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingService } from '../../services/bookingService';
import { GoldButton } from '../../components/ui/GoldButton';
import { TimeSlot } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DateTimeScreen() {
  const { business, service, staff, selectedDate, selectedSlot, setDate, setSlot } = useBookingStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading empty cells for grid alignment (Mon = 0)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7;

  useEffect(() => {
    if (!selectedDate || !business || !service) return;
    setLoadingSlots(true);
    const staffToUse = staff ?? (business.staff?.[0] ?? null);
    bookingService
      .getAvailableSlots(business, service, staffToUse, selectedDate)
      .then((data) => { setSlots(data); setLoadingSlots(false); });
  }, [selectedDate]);

  const handleDayPress = (date: Date) => {
    if (isBefore(date, today)) return;
    setDate(date);
    setSlots([]);
  };

  const handleContinue = () => {
    if (!selectedSlot) return;
    router.push('/booking/payment');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Pick Date & Time</Text>
            <Text style={styles.sub}>{service?.name} · {service ? `${Math.floor(service.duration_minutes / 60) > 0 ? Math.floor(service.duration_minutes / 60) + 'h ' : ''}${service.duration_minutes % 60 > 0 ? service.duration_minutes % 60 + 'm' : ''}` : ''}</Text>
          </View>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.calGrid}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
          {/* Empty leading cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {/* Day cells */}
          {days.map((day) => {
            const isPast = isBefore(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[styles.dayCell, isSelected && styles.dayCellSelected, isPast && styles.dayCellPast]}
                onPress={() => handleDayPress(day)}
                disabled={isPast}
              >
                <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isPast && styles.dayNumPast]}>
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time slots */}
        {selectedDate && (
          <View style={styles.slotsSection}>
            <Text style={styles.slotsTitle}>
              Available Times — {format(selectedDate, 'EEE d MMM')}
            </Text>
            {loadingSlots ? (
              <ActivityIndicator color={COLORS.gold} style={{ marginTop: SPACING.lg }} />
            ) : slots.length === 0 ? (
              <Text style={styles.noSlots}>No availability for this day. Try another date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => (
                  <TouchableOpacity
                    key={slot.datetime}
                    style={[
                      styles.slotChip,
                      slot.is_available ? styles.slotAvail : styles.slotTaken,
                      selectedSlot?.datetime === slot.datetime && styles.slotSelected,
                    ]}
                    onPress={() => slot.is_available && setSlot(slot)}
                    disabled={!slot.is_available}
                  >
                    <Text style={[styles.slotText, !slot.is_available && styles.slotTextTaken]}>
                      {format(new Date(slot.datetime), 'HH:mm')}
                      {slot.is_last_minute ? ' ⚡' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <GoldButton title="Continue →" onPress={handleContinue} disabled={!selectedSlot} />
      </View>
    </SafeAreaView>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  back: { fontSize: 22, color: COLORS.gold },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 13, color: COLORS.grey },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  navBtn: { padding: SPACING.sm },
  navArrow: { fontSize: 28, color: COLORS.gold },
  monthLabel: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: 4 },
  dayLabel: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, color: COLORS.grey, marginBottom: 4, fontWeight: '600' },
  dayCell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full },
  dayCellSelected: { backgroundColor: COLORS.gold },
  dayCellPast: { opacity: 0.3 },
  dayNum: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  dayNumSelected: { color: COLORS.black, fontWeight: '800' },
  dayNumPast: { color: COLORS.greyDark },
  slotsSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  slotsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md },
  noSlots: { color: COLORS.grey, fontSize: 14, textAlign: 'center', marginTop: SPACING.lg },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  slotChip: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.md, minWidth: 72, alignItems: 'center' },
  slotAvail: { backgroundColor: COLORS.gold },
  slotTaken: { backgroundColor: COLORS.surface3 },
  slotSelected: { backgroundColor: COLORS.goldDark, borderWidth: 2, borderColor: COLORS.gold },
  slotText: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  slotTextTaken: { color: COLORS.greyDark },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.surface3, backgroundColor: COLORS.black },
});
