import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { businessService } from '../../services/businessService';
import { BusinessCard } from '../../components/ui/BusinessCard';
import { Business } from '../../types';
import { COLORS, SPACING } from '../../constants/AppConstants';

export default function FavouritesScreen() {
  const { user } = useAuthStore();
  const { setBusiness } = useBookingStore();
  const [favourites, setFavourites] = useState<Business[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const data = await businessService.getFavourites(user.id);
    setFavourites(data);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [user]);

  const handlePress = (business: Business) => {
    setBusiness(business);
    router.push(`/business/${business.slug}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>Saved</Text>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.gold} />}
        renderItem={({ item }) => <BusinessCard business={item} onPress={handlePress} compact />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>No saved businesses yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any business profile to save it here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl, gap: SPACING.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  emptyText: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22 },
});
