import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Service } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants/AppConstants';

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onPress?: (service: Service) => void;
}

function durationDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ServiceCard({ service, selected = false, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={() => onPress?.(service)}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{service.name}</Text>
        {service.description ? (
          <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>🕐 {durationDisplay(service.duration_minutes)}</Text>
          {service.category_tag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{service.category_tag}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>£{service.price.toFixed(2)}</Text>
        <Text style={styles.deposit}>
          Deposit: £{service.deposit_amount.toFixed(2)}
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
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold + '11',
  },
  left: { flex: 1, marginRight: SPACING.md },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  desc: { fontSize: 12, color: COLORS.grey, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  meta: { fontSize: 12, color: COLORS.greyLight },
  tag: {
    backgroundColor: COLORS.surface3,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: COLORS.grey },
  right: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  deposit: { fontSize: 11, color: COLORS.gold, marginTop: 2 },
});
