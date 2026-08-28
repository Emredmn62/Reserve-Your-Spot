import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../../store/useBookingStore';
import { businessService } from '../../services/businessService';
import { GoldButton } from '../../components/ui/GoldButton';
import { StaffMember } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

export default function StaffSelectionScreen() {
  const { business, service, staff: selectedStaff, anyStaff, setStaff } = useBookingStore();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (!business) return;
    businessService.getStaff(business.id).then(setStaffList);
  }, [business]);

  const handleSelect = (member: StaffMember | null, isAny = false) => {
    setStaff(member, isAny);
  };

  const handleContinue = () => {
    router.push('/booking/datetime');
  };

  const isSelected = (id: string) => selectedStaff?.id === id;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Choose Team Member</Text>
          <Text style={styles.sub}>{service?.name}</Text>
        </View>
      </View>

      <FlatList
        data={[null, ...staffList]}
        keyExtractor={(item) => item?.id ?? 'any'}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (!item) {
            return (
              <TouchableOpacity
                style={[styles.card, anyStaff && styles.cardSelected]}
                onPress={() => handleSelect(null, true)}
              >
                <View style={styles.anyIcon}>
                  <Text style={styles.anyEmoji}>👥</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>Any Available</Text>
                  <Text style={styles.cardRole}>Let us assign the next free team member</Text>
                </View>
                {anyStaff && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={[styles.card, isSelected(item.id) && styles.cardSelected]}
              onPress={() => handleSelect(item, false)}
            >
              <Image
                source={{ uri: item.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=C9A84C&color=000` }}
                style={styles.photo}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardRole}>{item.role}</Text>
                {item.bio ? <Text style={styles.cardBio} numberOfLines={2}>{item.bio}</Text> : null}
              </View>
              {isSelected(item.id) && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <GoldButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!selectedStaff && !anyStaff}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  back: { fontSize: 22, color: COLORS.gold },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 13, color: COLORS.grey },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: SPACING.md,
  },
  cardSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '11' },
  anyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface3, alignItems: 'center', justifyContent: 'center' },
  anyEmoji: { fontSize: 26 },
  photo: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: COLORS.surface3 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  cardRole: { fontSize: 13, color: COLORS.grey, marginTop: 2 },
  cardBio: { fontSize: 12, color: COLORS.greyDark, marginTop: 4 },
  checkmark: { fontSize: 20, color: COLORS.gold, fontWeight: '800' },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.surface3 },
});
