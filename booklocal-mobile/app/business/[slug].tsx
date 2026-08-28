import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Share, FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBookingStore } from '../../store/useBookingStore';
import { businessService } from '../../services/businessService';
import { Business, Review, Service } from '../../types';
import { GoldButton } from '../../components/ui/GoldButton';
import { StarRating } from '../../components/ui/StarRating';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { COLORS, SPACING, RADIUS, APP_NAME } from '../../constants/AppConstants';

type Tab = 'services' | 'staff' | 'gallery' | 'reviews' | 'info';

export default function BusinessProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { setBusiness, setService } = useBookingStore();

  const [business, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await businessService.getBusinessBySlug(slug);
      setBiz(data);
      setLoading(false);
      if (data && user) {
        const fav = await businessService.isFavourite(user.id, data.id);
        setIsFavourite(fav);
      }
    })();
  }, [slug]);

  const handleToggleFavourite = async () => {
    if (!user || !business) return;
    const result = await businessService.toggleFavourite(user.id, business.id);
    setIsFavourite(result);
  };

  const handleBookService = (service: Service) => {
    if (!business) return;
    setBusiness(business);
    setService(service);
    router.push('/booking/staff');
  };

  const handleBookNow = () => {
    if (!business) return;
    setBusiness(business);
    router.push('/booking/service');
  };

  if (loading || !business) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'services', label: 'Services' },
    { key: 'staff', label: 'Team' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'info', label: 'Info' },
  ];

  const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[]} nestedScrollEnabled>
        {/* Cover image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: business.cover_image_url ?? 'https://via.placeholder.com/400x200/1A1A1A/C9A84C?text=Business' }}
            style={styles.cover}
            resizeMode="cover"
          />
          {/* Back button overlay */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          {/* Logo overlay */}
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: business.logo_url ?? 'https://via.placeholder.com/80/C9A84C/000000?text=B' }}
              style={styles.logo}
            />
          </View>
        </View>

        {/* Header info */}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameBlock}>
              <Text style={styles.businessName}>{business.name}</Text>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>
                  {business.category?.emoji} {business.category?.name}
                </Text>
              </View>
            </View>
            {!business.is_approved && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending Approval</Text>
              </View>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={business.rating} size={15} showNumber />
            <Text style={styles.ratingCount}>({business.total_reviews} reviews)</Text>
            {business.distance_km != null && (
              <Text style={styles.distance}>📍 {business.distance_km.toFixed(1)} km away</Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <ActionBtn emoji="📞" label="Call" onPress={() => Linking.openURL(`tel:${business.phone}`)} />
            {business.whatsapp_number && (
              <ActionBtn emoji="💬" label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${business.whatsapp_number?.replace(/\s/g, '')}`)} />
            )}
            {business.instagram_url && (
              <ActionBtn emoji="📸" label="Insta" onPress={() => Linking.openURL(`https://instagram.com/${business.instagram_url?.replace('@', '')}`)} />
            )}
            <ActionBtn
              emoji={isFavourite ? '❤️' : '🤍'}
              label={isFavourite ? 'Saved' : 'Save'}
              onPress={handleToggleFavourite}
            />
            <ActionBtn
              emoji="🔗"
              label="Share"
              onPress={() => Share.share({ message: `Check out ${business.name} on ${APP_NAME}!`, url: `https://booklocal.app/${business.slug}` })}
            />
          </View>

          {/* Description */}
          {business.description ? (
            <Text style={styles.description}>{business.description}</Text>
          ) : null}
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'services' && (
            <View>
              {(business.services ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No services listed yet.</Text>
              ) : (
                (business.services ?? []).map((s) => (
                  <ServiceCard key={s.id} service={s} onPress={handleBookService} />
                ))
              )}
            </View>
          )}

          {activeTab === 'staff' && (
            <View>
              {(business.staff ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No team members listed yet.</Text>
              ) : (
                <FlatList
                  data={business.staff}
                  horizontal
                  scrollEnabled={false}
                  keyExtractor={(s) => s.id}
                  renderItem={({ item: s }) => (
                    <View style={styles.staffCard}>
                      <Image
                        source={{ uri: s.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=C9A84C&color=000` }}
                        style={styles.staffPhoto}
                      />
                      <Text style={styles.staffName}>{s.name}</Text>
                      <Text style={styles.staffRole}>{s.role}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {activeTab === 'gallery' && (
            <View style={styles.gallery}>
              {(business.gallery_urls ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No gallery images yet.</Text>
              ) : (
                business.gallery_urls.map((url, i) => (
                  <Image key={i} source={{ uri: url }} style={styles.galleryImage} />
                ))
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {(business.reviews ?? []).length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
              ) : (
                (business.reviews ?? []).map((r: Review) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewName}>{r.customer?.full_name ?? 'Customer'}</Text>
                      <StarRating rating={r.rating} size={12} />
                      {r.is_verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
                    </View>
                    <Text style={styles.reviewComment}>{r.comment}</Text>
                    <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('en-GB')}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'info' && (
            <View style={styles.infoSection}>
              <InfoRow label="📍 Address" value={business.address} />
              <InfoRow label="📞 Phone" value={business.phone} />
              {business.website_url && <InfoRow label="🌐 Website" value={business.website_url} />}
              {business.cancellation_policy && <InfoRow label="📋 Cancellation" value={business.cancellation_policy} />}
              <Text style={styles.infoLabel}>🕐 Opening Hours</Text>
              {DAY_ORDER.map((day) => {
                const h = business.opening_hours?.[day];
                if (!h) return null;
                return (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>{day}</Text>
                    <Text style={styles.hoursTime}>
                      {h.is_open ? `${h.open} – ${h.close}` : 'Closed'}
                    </Text>
                  </View>
                );
              })}

              {/* QR Code placeholder */}
              <View style={styles.qrSection}>
                <Text style={styles.qrTitle}>📱 Share & Book</Text>
                <Text style={styles.qrText}>
                  Share this link or display the QR code in your shop:
                </Text>
                <Text style={styles.qrLink}>booklocal.app/{business.slug}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Book Now button */}
      <View style={styles.stickyFooter}>
        <View style={styles.pricePill}>
          {(business.services ?? []).length > 0 && (
            <Text style={styles.fromPrice}>
              From £{Math.min(...(business.services ?? []).map((s) => s.price)).toFixed(0)}
            </Text>
          )}
        </View>
        <GoldButton title="Book Now" onPress={handleBookNow} style={styles.bookBtn} />
      </View>
    </View>
  );
}

function ActionBtn({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={actionStyles.btn} onPress={onPress}>
      <Text style={actionStyles.emoji}>{emoji}</Text>
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const actionStyles = StyleSheet.create({
  btn: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 22 },
  label: { fontSize: 11, color: COLORS.grey },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}
const infoStyles = StyleSheet.create({
  row: { marginBottom: SPACING.md },
  label: { fontSize: 12, color: COLORS.grey, fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 14, color: COLORS.white },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.black },
  loading: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.grey },
  coverContainer: { position: 'relative' },
  cover: { width: '100%', height: 220 },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: SPACING.lg,
    backgroundColor: COLORS.black + 'AA',
    borderRadius: RADIUS.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 20, color: COLORS.white },
  logoWrapper: {
    position: 'absolute',
    bottom: -30,
    left: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.black,
  },
  logo: { width: 70, height: 70, borderRadius: 35 },
  headerInfo: { paddingHorizontal: SPACING.lg, paddingTop: 40, paddingBottom: SPACING.lg },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nameBlock: { flex: 1 },
  businessName: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold + '22',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.gold + '55',
  },
  categoryText: { fontSize: 12, color: COLORS.gold, fontWeight: '600' },
  pendingBadge: {
    backgroundColor: COLORS.warning + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  pendingText: { fontSize: 11, color: COLORS.warning, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  ratingCount: { fontSize: 13, color: COLORS.grey },
  distance: { fontSize: 12, color: COLORS.grey },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.surface3,
  },
  description: { fontSize: 14, color: COLORS.greyLight, lineHeight: 22, marginTop: SPACING.md },
  tabScroll: { marginVertical: SPACING.md },
  tab: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginRight: SPACING.sm },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.gold },
  tabText: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },
  tabTextActive: { color: COLORS.gold },
  tabContent: { paddingHorizontal: SPACING.lg },
  staffCard: { alignItems: 'center', marginRight: SPACING.lg, width: 90 },
  staffPhoto: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: COLORS.gold, marginBottom: SPACING.sm },
  staffName: { fontSize: 13, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  staffRole: { fontSize: 11, color: COLORS.grey, textAlign: 'center' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  galleryImage: { width: '47%', aspectRatio: 1, borderRadius: RADIUS.md },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  reviewName: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  verifiedBadge: { fontSize: 11, color: COLORS.gold },
  reviewComment: { fontSize: 13, color: COLORS.greyLight, lineHeight: 20 },
  reviewDate: { fontSize: 11, color: COLORS.greyDark, marginTop: SPACING.xs },
  infoSection: {},
  infoLabel: { fontSize: 13, color: COLORS.grey, fontWeight: '600', marginTop: SPACING.md, marginBottom: SPACING.sm },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  hoursDay: { fontSize: 14, color: COLORS.greyLight, width: 40 },
  hoursTime: { fontSize: 14, color: COLORS.white },
  qrSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  qrTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  qrText: { fontSize: 13, color: COLORS.grey, marginBottom: SPACING.xs },
  qrLink: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },
  emptyText: { color: COLORS.grey, fontSize: 14, textAlign: 'center', paddingVertical: SPACING.xl },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface3,
    gap: SPACING.md,
    paddingBottom: 28,
  },
  pricePill: { flex: 1 },
  fromPrice: { fontSize: 16, fontWeight: '800', color: COLORS.gold },
  bookBtn: { flex: 2 },
});
