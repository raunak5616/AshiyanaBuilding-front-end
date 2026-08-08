import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Category } from '../../features/products/productApi';

interface CategoryCardProps {
  category: Category;
  onPress?: (category: Category) => void;
}

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  // Get first two characters of category name for the fallback circular icon
  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => onPress && onPress(category)}
    >
      <View style={styles.circle}>
        <Text style={styles.initials}>{getInitials(category.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  initials: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.secondary,
    fontSize: 16,
  },
  name: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
});
export default CategoryCard;
