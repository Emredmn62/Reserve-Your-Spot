import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/useAuthStore';
import { businessService } from '../../services/businessService';
import { GoldButton } from '../../components/ui/GoldButton';
import { COLORS, RADIUS, SPACING, CATEGORIES } from '../../constants/AppConstants';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BusinessSetupScreen() {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 — Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !categoryId || !address.trim() || !phone.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in all required fields.' });
      return;
    }

    setIsLoading(true);
    const slug = businessService.generateSlug(name);

    const { data, error } = await businessService.createBusiness({
      owner_id: user!.id,
      name: name.trim(),
      slug,
      description: description.trim(),
      category_id: categoryId,
      address: address.trim(),
      phone: phone.trim(),
      instagram_url: instagram.trim() || undefined,
      whatsapp_number: whatsapp.trim() || undefined,
      deposit_percentage: 20,
      is_approved: false,
      is_featured: false,
      subscription_plan: 'free',
      rating: 0,
      total_reviews: 0,
      gallery_urls: [],
      opening_hours: {
        Mon: { open: '09:00', close: '18:00', is_open: true },
        Tue: { open: '09:00', close: '18:00', is_open: true },
        Wed: { open: '09:00', close: '18:00', is_open: true },
        Thu: { open: '09:00', close: '18:00', is_open: true },
        Fri: { open: '09:00', close: '18:00', is_open: true },
        Sat: { open: '10:00', close: '16:00', is_open: true },
        Sun: { open: '00:00', close: '00:00', is_open: false },
      },
    });

    setIsLoading(false);

    if (error || !data) {
      Toast.show({ type: 'error', text1: 'Could not create business', text2: error ?? 'Try again.' });
      return;
    }

    Toast.show({ type: 'success', text1: '🎉 Business created!', text2: 'Pending admin approval.' });
    router.replace('/(business)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Set Up Your Business</Text>
        <Text style={styles.sub}>Tell us about your business to get started</Text>

        <Text style={styles.label}>Business Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Razor Craft" placeholderTextColor={COLORS.greyDark}
          value={name} onChangeText={setName} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Tell customers about your business..."
          placeholderTextColor={COLORS.greyDark} value={description} onChangeText={setDescription}
          multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catText, categoryId === cat.id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Address *</Text>
        <TextInput style={styles.input} placeholder="123 High Street, London, E1 6RF"
          placeholderTextColor={COLORS.greyDark} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} placeholder="+44 7700 000000" placeholderTextColor={COLORS.greyDark}
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>Instagram (optional)</Text>
        <TextInput style={styles.input} placeholder="@yourbusiness" placeholderTextColor={COLORS.greyDark}
          value={instagram} onChangeText={setInstagram} autoCapitalize="none" />

        <Text style={styles.label}>WhatsApp Number (optional)</Text>
        <TextInput style={styles.input} placeholder="+44 7700 000000" placeholderTextColor={COLORS.greyDark}
          value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            ⏳ Your business will be reviewed and approved within 24 hours.
          </Text>
        </View>

        <GoldButton title="Create My Business" onPress={handleCreate} loading={isLoading} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  heading: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  sub: { fontSize: 15, color: COLORS.grey, marginBottom: SPACING.xl },
  label: { fontSize: 13, color: COLORS.greyLight, marginBottom: SPACING.xs, fontWeight: '600', marginTop: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
    color: COLORS.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surface3,
    marginBottom: SPACING.md,
  },
  textarea: { height: 100, paddingTop: SPACING.md },
  categories: { marginBottom: SPACING.md },
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
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 13, color: COLORS.grey },
  catTextActive: { color: COLORS.gold, fontWeight: '700' },
  notice: {
    backgroundColor: COLORS.gold + '11',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
    marginBottom: SPACING.xl,
  },
  noticeText: { color: COLORS.gold, fontSize: 13, lineHeight: 20 },
  btn: { width: '100%' },
});
