import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { LoyaltyCard } from '../../types';
import { COLORS, SPACING, RADIUS, APP_NAME } from '../../constants/AppConstants';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);

  useEffect(() => {
    if (user) {
      businessService.getCustomerLoyaltyCards(user.id).then((data) => setLoyaltyCards(data as LoyaltyCard[]));
    }
  }, [user]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/onboarding'); } },
    ]);
  };

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.phone_number && <Text style={styles.phone}>{user.phone_number}</Text>}
        </View>

        {/* Loyalty Cards */}
        {loyaltyCards.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Loyalty Cards</Text>
            {loyaltyCards.map((card: any) => (
              <View key={card.id} style={[styles.loyaltyCard, { borderColor: card.business?.brand_color ?? COLORS.gold }]}>
                <View style={styles.loyaltyTop}>
                  <Text style={styles.loyaltyBusiness}>{card.business?.name ?? 'Business'}</Text>
                  <Text style={styles.loyaltyReward}>{card.reward_description}</Text>
                </View>
                <View style={styles.stamps}>
                  {Array.from({ length: card.required_stamps }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.stamp, i < card.total_stamps && { backgroundColor: card.business?.brand_color ?? COLORS.gold }]}
                    >
                      <Text style={styles.stampIcon}>{i < card.total_stamps ? '★' : '☆'}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.loyaltyProgress}>
                  {card.total_stamps}/{card.required_stamps} stamps
                  {card.total_stamps >= card.required_stamps ? ' — 🎉 Reward unlocked!' : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Menu */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem emoji="✏️" label="Edit Profile" onPress={() => {}} />
          <MenuItem emoji="🔔" label="Notifications" onPress={() => {}} />
          <MenuItem emoji="❤️" label="Saved Businesses" onPress={() => router.push('/(customer)/favourites')} />
          <MenuItem emoji="📅" label="My Bookings" onPress={() => router.push('/(customer)/bookings')} />
          <MenuItem emoji="🔒" label="Privacy & Security" onPress={() => {}} />
          <MenuItem emoji="❓" label="Help & Support" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{APP_NAME} v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress}>
      <Text style={menuStyles.emoji}>{emoji}</Text>
      <Text style={menuStyles.label}>{label}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}
const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.surface3, gap: SPACING.md },
  emoji: { fontSize: 20, width: 28 },
  label: { flex: 1, fontSize: 15, color: COLORS.white },
  arrow: { fontSize: 20, color: COLORS.grey },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  profileHeader: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: COLORS.gold },
  avatarFallback: { backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '900', color: COLORS.black },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  email: { fontSize: 14, color: COLORS.grey },
  phone: { fontSize: 14, color: COLORS.grey },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginTop: SPACING.xl, marginBottom: SPACING.md },
  loyaltyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  loyaltyTop: { marginBottom: SPACING.md },
  loyaltyBusiness: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  loyaltyReward: { fontSize: 13, color: COLORS.grey, marginTop: 2 },
  stamps: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.sm },
  stamp: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampIcon: { fontSize: 18, color: COLORS.black },
  loyaltyProgress: { fontSize: 13, color: COLORS.gold, fontWeight: '700' },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  signOutBtn: {
    marginTop: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.greyDark, marginTop: SPACING.xl },
});
