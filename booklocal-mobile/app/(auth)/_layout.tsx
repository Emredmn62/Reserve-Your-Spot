import { Stack } from 'expo-router';
import { COLORS } from '../../constants/AppConstants';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.black } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="business-setup" />
    </Stack>
  );
}
