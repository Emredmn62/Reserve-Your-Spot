import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/AppConstants';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.success]}>
      <Text style={styles.title}>✓ {text1}</Text>
      {text2 ? <Text style={styles.sub}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.error]}>
      <Text style={styles.title}>✕ {text1}</Text>
      {text2 ? <Text style={styles.sub}>{text2}</Text> : null}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.info]}>
      <Text style={styles.title}>ℹ {text1}</Text>
      {text2 ? <Text style={styles.sub}>{text2}</Text> : null}
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  success: { backgroundColor: '#0A2A0A', borderLeftWidth: 3, borderLeftColor: COLORS.success },
  error: { backgroundColor: '#2A0A0A', borderLeftWidth: 3, borderLeftColor: COLORS.error },
  info: { backgroundColor: '#0A0A2A', borderLeftWidth: 3, borderLeftColor: COLORS.info },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  sub: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
});
