import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';
import { ProductPrice } from './ProductPrice';
import { StockBadge } from './StockBadge';
import { ProductBadge, BadgeType } from './ProductBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HorizontalProductCardProps {
  product: Product;
  badgeType?: BadgeType;
  onPress?: (product: Product) => void;
}

export const HorizontalProductCard = ({ product, badgeType, onPress }: HorizontalProductCardProps) => {
  const imageUrl = product.images?.[0]?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => onPress && onPress(product)}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.fallbackImage}>
            <MaterialCommunityIcons name="tools" size={30} color={COLORS.textSecondary} />
          </View>
        )}
        {badgeType && (
          <View style={styles.badgeContainer}>
            <ProductBadge type={badgeType} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.sku} numberOfLines={1}>
            SKU: {product.sku}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <ProductPrice priceInPaise={product.sellingPrice} style={styles.price} />
          <StockBadge inStock={true} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
    height: 100,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  imageContainer: {
    width: 100,
    height: '100%',
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    color: COLORS.primaryDark,
  },
});
export default HorizontalProductCard;
