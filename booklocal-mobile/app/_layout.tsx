import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS, STRIPE_PUBLISHABLE_KEY } from '../constants/AppConstants';
import { toastConfig } from '../components/ui/ToastConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadStoredSession } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function init() {
      await loadStoredSession();
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <StatusBar style="light" backgroundColor={COLORS.black} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.black } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(customer)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(business)" options={{ animation: 'fade' }} />
            <Stack.Screen name="business/[slug]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/service" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/staff" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/datetime" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/payment" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="booking/confirmation" options={{ animation: 'fade' }} />
          </Stack>
          <Toast config={toastConfig} />
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
