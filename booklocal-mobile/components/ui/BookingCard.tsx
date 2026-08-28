import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants/AppConstants';
import { format, parseISO } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: '#C9A84C',
  confirmed: '#44BB44',
  completed: '#888888',
  cancelled: '#FF4444',
  no_show: '#FF6600',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

interface BookingCardProps {
  booking: Booking;
  onPress?: (booking: Booking) => void;
  showBusiness?: boolean;
}

export function BookingCard({ booking, onPress, showBusiness = true }: BookingCardProps) {
  const statusColor = STATUS_COLORS[booking.status] ?? COLORS.grey;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(booking)}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {/* Left: date block */}
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{format(parseISO(booking.start_time), 'd')}</Text>
        <Text style={styles.dateMon}>{format(parseISO(booking.start_time), 'MMM')}</Text>
        <Text style={styles.dateTime}>{format(parseISO(booking.start_time), 'HH:mm')}</Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: statusColor }]} />

      {/* Middle: info */}
      <View style={styles.info}>
        {showBusiness && (
          <Text style={styles.businessName} numberOfLines={1}>
            {booking.business?.name ?? 'Business'}
          </Text>
        )}
        <Text style={styles.serviceName} numberOfLines={1}>
          {booking.service?.name ?? 'Service'}
        </Text>
        {booking.staff && (
          <Text style={styles.staffName}>with {booking.staff.name}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>£{booking.total_price.toFixed(2)}</Text>
          {booking.deposit_paid && (
            <View style={styles.depositBadge}>
              <Text style={styles.depositText}>Deposit paid</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: status */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {STATUS_LABELS[booking.status]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateBlock: {
    alignItems: 'center',
    minWidth: 40,
  },
  dateDay: { fontSize: 22, fontWeight: '800', color: COLORS.gold, lineHeight: 24 },
  dateMon: { fontSize: 11, color: COLORS.grey, textTransform: 'uppercase' },
  dateTime: { fontSize: 11, color: COLORS.greyLight, marginTop: 2 },
  divider: { width: 2, height: 48, borderRadius: 1 },
  info: { flex: 1 },
  businessName: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  serviceName: { fontSize: 13, color: COLORS.greyLight, marginTop: 2 },
  staffName: { fontSize: 12, color: COLORS.grey, marginTop: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  depositBadge: {
    backgroundColor: COLORS.success + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  depositText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  statusBadge: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '700' },
});
