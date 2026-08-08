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

interface ProductCardProps {
  product: Product;
  badgeType?: BadgeType;
  onPress?: (product: Product) => void;
}

export const ProductCard = ({ product, badgeType, onPress }: ProductCardProps) => {
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
            <MaterialCommunityIcons name="tools" size={40} color={COLORS.textSecondary} />
          </View>
        )}
        {badgeType && (
          <View style={styles.badgeContainer}>
            <ProductBadge type={badgeType} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.sku} numberOfLines={1}>
          SKU: {product.sku}
        </Text>
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
    width: 160,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    width: '100%',
    height: 110,
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
    padding: SPACING.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    minHeight: 36,
  },
  sku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    color: COLORS.primaryDark,
  },
});
export default ProductCard;
