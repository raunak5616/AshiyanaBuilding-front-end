import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

export type BadgeType = 'featured' | 'trending' | 'popular' | 'new';

interface ProductBadgeProps {
  type: BadgeType;
}

export const ProductBadge = ({ type }: ProductBadgeProps) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'featured':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Featured' }; // Amber
      case 'trending':
        return { bg: '#E0F2FE', text: '#0284C7', label: 'Trending' }; // Blue
      case 'popular':
        return { bg: '#F3E8FF', text: '#7C3AED', label: 'Popular' }; // Purple
      case 'new':
      default:
        return { bg: '#DCEFEE', text: '#0D9488', label: 'New' }; // Teal
    }
  };

  const badge = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
      <Text style={[styles.text, { color: badge.text }]}>{badge.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
