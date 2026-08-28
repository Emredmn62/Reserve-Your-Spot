import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, APP_NAME } from '../constants/AppConstants';
import { GoldButton } from '../components/ui/GoldButton';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🗺️',
    title: 'Discover Local Pros',
    subtitle: 'Find the best barbers, salons, trainers and more near you — all in one place.',
    color: '#1A1500',
  },
  {
    id: '2',
    emoji: '📅',
    title: 'Book in Seconds',
    subtitle: 'Choose your service, pick a time, and book instantly. No calls, no waiting.',
    color: '#0A150A',
  },
  {
    id: '3',
    emoji: '🔒',
    title: 'Secure & Simple',
    subtitle: 'Pay a small deposit to lock in your spot. The rest you pay in person. No surprises.',
    color: '#0A0A18',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skip = () => router.replace('/(auth)/login');

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.color }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <GoldButton
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={goNext}
          style={styles.btn}
        />
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>
            {currentIndex === SLIDES.length - 1 ? 'I already have an account' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* App name watermark */}
      <Text style={styles.appName}>{APP_NAME}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  slide: {
    width: W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emoji: { fontSize: 96, marginBottom: SPACING.xl },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.grey,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: SPACING.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.greyDark,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.gold,
  },
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.md },
  btn: { width: '100%' },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipText: { color: COLORS.grey, fontSize: 14 },
  appName: {
    position: 'absolute',
    top: SPACING.xl,
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1,
  },
});
