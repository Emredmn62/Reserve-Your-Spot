import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../../store/useBookingStore';
import { businessService } from '../../services/businessService';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { GoldButton } from '../../components/ui/GoldButton';
import { Service } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/AppConstants';

export default function ServiceSelectionScreen() {
  const { business, service: selectedService, setService } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;
    businessService.getServices(business.id).then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, [business]);

  const handleContinue = () => {
    if (!selectedService) return;
    router.push('/booking/staff');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Choose a Service</Text>
          <Text style={styles.sub}>{business?.name}</Text>
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading services...</Text>
          ) : (
            <Text style={styles.empty}>No services available.</Text>
          )
        }
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            selected={selectedService?.id === item.id}
            onPress={setService}
          />
        )}
      />

      <View style={styles.footer}>
        <GoldButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!selectedService}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  back: { fontSize: 22, color: COLORS.gold },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 13, color: COLORS.grey },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  empty: { color: COLORS.grey, textAlign: 'center', marginTop: SPACING.xl },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.surface3 },
});
