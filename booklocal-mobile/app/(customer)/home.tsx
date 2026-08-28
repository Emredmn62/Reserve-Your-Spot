import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  FlatList, RefreshControl, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { useBookingStore } from '../../store/useBookingStore';
import { BusinessCard } from '../../components/ui/BusinessCard';
import { Business } from '../../types';
import { COLORS, SPACING, RADIUS, CATEGORIES, APP_NAME } from '../../constants/AppConstants';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { setBusiness } = useBookingStore();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 51.5074, lng = -0.1278; // Default: London

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setLocation({ lat, lng });
      }

      const [nearby, featured] = await Promise.all([
        businessService.getNearbyBusinesses(lat, lng, 10, selectedCategory === 'all' ? undefined : selectedCategory),
        businessService.getFeaturedBusinesses(),
      ]);

      setNearbyBusinesses(nearby);
      setFeaturedBusinesses(featured);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleBusinessPress = (business: Business) => {
    setBusiness(business);
    router.push(`/business/${business.slug}`);
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>What are you booking today?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(customer)/search')}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search businesses, services...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.slug && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catText, selectedCategory === cat.slug && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearby */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {nearbyBusinesses.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>No businesses found nearby.</Text>
          </View>
        ) : (
          <FlatList
            data={nearbyBusinesses.slice(0, 8)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
            renderItem={({ item }) => <BusinessCard business={item} onPress={handleBusinessPress} />}
          />
        )}

        {/* Last Minute */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Last Minute</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Today only</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lastMinuteBanner}>
          <Text style={styles.lastMinuteText}>
            ⚡ Tap "Last Minute" slots on any business profile to snap up same-day openings at a discount.
          </Text>
        </View>

        {/* Featured */}
        {featuredBusinesses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Featured</Text>
            </View>
            <FlatList
              data={featuredBusinesses}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}
              renderItem={({ item }) => <BusinessCard business={item} onPress={handleBusinessPress} />}
            />
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  subGreeting: { fontSize: 13, color: COLORS.grey, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.gold },
  avatarPlaceholder: { backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.black },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.surface3,
    gap: SPACING.sm,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: { fontSize: 15, color: COLORS.greyDark },
  categoryScroll: { marginBottom: SPACING.lg },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  catChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '22' },
  catEmoji: { fontSize: 15 },
  catText: { fontSize: 13, color: COLORS.grey },
  catTextActive: { color: COLORS.gold, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  seeAll: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.grey, textAlign: 'center' },
  lastMinuteBanner: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.gold + '11',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '33',
    marginBottom: SPACING.xl,
  },
  lastMinuteText: { color: COLORS.gold, fontSize: 13, lineHeight: 20 },
});
