import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Business } from '../../types';
import { COLORS, RADIUS, SPACING, FONTS } from '../../constants/AppConstants';
import { StarRating } from './StarRating';

interface BusinessCardProps {
  business: Business;
  onPress: (business: Business) => void;
  compact?: boolean;
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W * 0.72;

export function BusinessCard({ business, onPress, compact = false }: BusinessCardProps) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compact}
        onPress={() => onPress(business)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: business.logo_url ?? 'https://via.placeholder.com/60' }}
          style={styles.compactLogo}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{business.name}</Text>
          <Text style={styles.compactCategory} numberOfLines={1}>
            {business.category?.emoji} {business.category?.name}
          </Text>
          <View style={styles.row}>
            <StarRating rating={business.rating} size={12} />
            {business.distance_km != null && (
              <Text style={styles.distance}>{business.distance_km.toFixed(1)} km</Text>
            )}
          </View>
        </View>
        {business.is_featured && <View style={styles.featuredDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      onPress={() => onPress(business)}
      activeOpacity={0.85}
    >
      {/* Cover */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: business.cover_image_url ?? 'https://via.placeholder.com/300x130' }}
          style={styles.cover}
          resizeMode="cover"
        />
        {business.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ FEATURED</Text>
          </View>
        )}
        {business.boost_expires_at && new Date(business.boost_expires_at) > new Date() && (
          <View style={styles.boostBadge}>
            <Text style={styles.boostText}>🚀 BOOSTED</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Image
            source={{ uri: business.logo_url ?? 'https://via.placeholder.com/40' }}
            style={styles.logo}
          />
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
            <Text style={styles.category}>
              {business.category?.emoji} {business.category?.name}
            </Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: SPACING.sm }]}>
          <StarRating rating={business.rating} size={13} />
          <Text style={styles.reviews}>({business.total_reviews})</Text>
          {business.distance_km != null && (
            <Text style={styles.distance}>• {business.distance_km.toFixed(1)} km away</Text>
          )}
        </View>

        {business.services && business.services.length > 0 && (
          <Text style={styles.priceHint}>
            From £{Math.min(...business.services.map((s) => s.price)).toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  coverContainer: { position: 'relative' },
  cover: { width: '100%', height: 130 },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featuredText: { fontSize: 10, fontWeight: '800', color: COLORS.black },
  boostBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#FF8800',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  boostText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  content: { padding: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  logo: { width: 38, height: 38, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.gold },
  nameBlock: { flex: 1, marginLeft: SPACING.sm },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  category: { fontSize: 12, color: COLORS.grey, marginTop: 1 },
  reviews: { fontSize: 12, color: COLORS.grey },
  distance: { fontSize: 12, color: COLORS.grey },
  priceHint: { fontSize: 13, color: COLORS.gold, fontWeight: '600', marginTop: SPACING.xs },
  featuredDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  // Compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  compactLogo: { width: 52, height: 52, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.surface3 },
  compactInfo: { flex: 1 },
  compactName: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  compactCategory: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
});
