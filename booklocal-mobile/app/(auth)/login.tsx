import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/useAuthStore';
import { GoldButton } from '../../components/ui/GoldButton';
import { COLORS, RADIUS, SPACING, APP_NAME } from '../../constants/AppConstants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please enter your email and password.' });
      return;
    }

    const { error } = await signIn(email.trim().toLowerCase(), password);

    if (error) {
      Toast.show({ type: 'error', text1: 'Sign in failed', text2: error });
      return;
    }

    const { isBusinessOwner } = useAuthStore.getState();
    router.replace(isBusinessOwner ? '/(business)/dashboard' : '/(customer)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>BL</Text>
          </View>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.greyDark}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.greyDark}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <GoldButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerBtn}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.black },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: SPACING.xxl },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: COLORS.black },
  appName: { textAlign: 'center', fontSize: 22, fontWeight: '800', color: COLORS.gold, marginBottom: SPACING.xl },
  heading: { fontSize: 30, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  sub: { fontSize: 15, color: COLORS.grey, marginBottom: SPACING.xl },
  label: { fontSize: 13, color: COLORS.greyLight, marginBottom: SPACING.xs, fontWeight: '600' },
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
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  inputFlex: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    height: 52,
    justifyContent: 'center',
  },
  eyeText: { fontSize: 18 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotText: { color: COLORS.gold, fontSize: 13 },
  btn: { width: '100%', marginBottom: SPACING.xl },
  registerBtn: { alignItems: 'center' },
  registerText: { color: COLORS.grey, fontSize: 14 },
  registerLink: { color: COLORS.gold, fontWeight: '700' },
});
