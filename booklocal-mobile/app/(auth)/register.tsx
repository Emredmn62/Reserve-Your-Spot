import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/useAuthStore';
import { GoldButton } from '../../components/ui/GoldButton';
import { COLORS, RADIUS, SPACING, APP_NAME } from '../../constants/AppConstants';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please fill in all required fields.' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters.' });
      return;
    }

    const { error } = await signUp(email.trim().toLowerCase(), password, fullName.trim(), phone, isBusinessOwner);
    if (error) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: error });
      return;
    }

    // Auto sign-in after registration
    const { error: loginErr } = await signIn(email.trim().toLowerCase(), password);
    if (loginErr) {
      router.replace('/(auth)/login');
      return;
    }

    if (isBusinessOwner) {
      router.replace('/(auth)/business-setup');
    } else {
      router.replace('/(customer)/home');
    }
  };

  const inputStyle = [styles.input];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.sub}>Join {APP_NAME} today</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={inputStyle} placeholder="Emma Thompson" placeholderTextColor={COLORS.greyDark}
            value={fullName} onChangeText={setFullName} />

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput style={inputStyle} placeholder="your@email.com" placeholderTextColor={COLORS.greyDark}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={inputStyle} placeholder="+44 7700 000000" placeholderTextColor={COLORS.greyDark}
            value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputRow}>
            <TextInput style={[inputStyle, styles.inputFlex]} placeholder="Min. 8 characters"
              placeholderTextColor={COLORS.greyDark} value={password} onChangeText={setPassword}
              secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput style={inputStyle} placeholder="Repeat password" placeholderTextColor={COLORS.greyDark}
            value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />

          {/* Business Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>I'm a business owner</Text>
              <Text style={styles.toggleSub}>Set up your business profile after registering</Text>
            </View>
            <Switch
              value={isBusinessOwner}
              onValueChange={setIsBusinessOwner}
              trackColor={{ false: COLORS.surface3, true: COLORS.gold }}
              thumbColor={COLORS.white}
            />
          </View>

          <GoldButton title="Create Account" onPress={handleRegister} loading={isLoading} style={styles.btn} />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginBtn}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Sign in</Text>
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
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  backBtn: { marginBottom: SPACING.xl },
  backText: { color: COLORS.gold, fontSize: 15 },
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
  eyeBtn: { position: 'absolute', right: SPACING.md, height: 52, justifyContent: 'center' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.surface3,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  toggleSub: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
  btn: { width: '100%', marginBottom: SPACING.xl },
  loginBtn: { alignItems: 'center' },
  loginText: { color: COLORS.grey, fontSize: 14 },
  loginLink: { color: COLORS.gold, fontWeight: '700' },
});
