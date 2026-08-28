import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { isLoggedIn, isLoading, isBusinessOwner } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={isBusinessOwner ? '/(business)/dashboard' : '/(customer)/home'} />;
}
