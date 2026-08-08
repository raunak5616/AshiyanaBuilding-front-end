import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StockBadgeProps {
  inStock?: boolean;
}

export const StockBadge = ({ inStock = true }: StockBadgeProps) => {
  return (
    <View style={[styles.badge, inStock ? styles.inStockBg : styles.outOfStockBg]}>
      <MaterialCommunityIcons
        name={inStock ? 'check-circle' : 'close-circle'}
        size={14}
        color={inStock ? COLORS.success : COLORS.error}
        style={styles.icon}
      />
      <Text style={[styles.text, inStock ? styles.inStockText : styles.outOfStockText]}>
        {inStock ? 'In Stock' : 'Out of Stock'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  inStockBg: {
    backgroundColor: '#DCFCE7', // Light green
  },
  outOfStockBg: {
    backgroundColor: '#FEE2E2', // Light red
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  inStockText: {
    color: '#15803D', // Dark green
  },
  outOfStockText: {
    color: '#B91C1C', // Dark red
  },
});
