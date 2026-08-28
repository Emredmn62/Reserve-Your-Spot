import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/AppConstants';

interface StarRatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
}

export function StarRating({ rating, size = 14, showNumber = false }: StarRatingProps) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.row}>
      {Array.from({ length: full }).map((_, i) => (
        <Text key={`f${i}`} style={[styles.star, { fontSize: size, color: COLORS.gold }]}>★</Text>
      ))}
      {half && <Text style={[styles.star, { fontSize: size, color: COLORS.gold }]}>½</Text>}
      {Array.from({ length: empty }).map((_, i) => (
        <Text key={`e${i}`} style={[styles.star, { fontSize: size, color: COLORS.greyDark }]}>★</Text>
      ))}
      {showNumber && (
        <Text style={[styles.number, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 1 },
  number: { color: COLORS.grey, marginLeft: 4 },
});
