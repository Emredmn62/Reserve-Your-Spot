import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { businessService } from '../../services/businessService';
import { useBookingStore } from '../../store/useBookingStore';
import { BusinessCard } from '../../components/ui/BusinessCard';
import { Business } from '../../types';
import { COLORS, SPACING, RADIUS, CATEGORIES } from '../../constants/AppConstants';

export default function SearchScreen() {
  const { setBusiness } = useBookingStore();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<Business[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string, cat: string) => {
    if (!q.trim() && cat === 'all') { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    const data = await businessService.searchBusinesses(q, cat === 'all' ? undefined : cat);
    setResults(data);
    setLoading(false);
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    doSearch(text, selectedCategory);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    doSearch(query, slug);
  };

  const handleBusinessPress = (business: Business) => {
    setBusiness(business);
    router.push(`/business/${business.slug}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor={COLORS.greyDark}
          value={query}
          onChangeText={handleQueryChange}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.slug && styles.chipActive]}
            onPress={() => handleCategoryChange(cat.slug)}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.chipText, selectedCategory === cat.slug && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try a different search or category.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <BusinessCard business={item} onPress={handleBusinessPress} compact />
          )}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
            ) : !searched ? (
              <View style={styles.center}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyTitle}>Discover local businesses</Text>
                <Text style={styles.emptyText}>Start typing or choose a category above.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  back: { fontSize: 22, color: COLORS.gold },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    color: COLORS.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  clearBtn: { fontSize: 18, color: COLORS.grey },
  cats: { marginBottom: SPACING.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold + '22' },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 12, color: COLORS.grey },
  chipTextActive: { color: COLORS.gold, fontWeight: '700' },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  resultCount: { fontSize: 13, color: COLORS.grey, marginBottom: SPACING.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.xxl, paddingHorizontal: SPACING.lg },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyText: { fontSize: 14, color: COLORS.grey, textAlign: 'center' },
  loadingText: { color: COLORS.grey, fontSize: 15 },
});
