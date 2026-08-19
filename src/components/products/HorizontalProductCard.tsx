import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';
import { ProductPrice } from './ProductPrice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAddToCartMutation } from '../../features/cart/cartApi';

interface HorizontalProductCardProps {
  product: Product;
  badgeType?: any;
  onPress?: (product: Product) => void;
}

export const HorizontalProductCard = ({ product, onPress }: HorizontalProductCardProps) => {
  const imageUrl = product.images?.[0]?.url;
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const hasDiscount = product.mrp !== undefined && product.mrp !== null && product.mrp > product.sellingPrice;
  const discountPercent = hasDiscount ? Math.round(((product.mrp! - product.sellingPrice) / product.mrp!) * 100) : 0;

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    try {
      await addToCart({ productId: product.id || product._id, quantity: 1 }).unwrap();
    } catch (err) {
      console.error('Failed to quick-add to cart from horizontal card', err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={() => onPress && onPress(product)}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.fallbackImage}>
            <MaterialCommunityIcons name="tools" size={24} color={COLORS.textSecondary} />
          </View>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% Off</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.sku} numberOfLines={1}>
            SKU: {product.sku}
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.priceCol}>
            <View style={styles.priceRow}>
              <ProductPrice priceInPaise={product.sellingPrice} style={styles.price} />
              {hasDiscount && <Text style={styles.mrpText}>₹{Math.round(product.mrp! / 100)}</Text>}
            </View>
            <Text style={styles.bulkText}>Bulk Prices Available</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#22C55E" />
            ) : (
              <>
                <MaterialCommunityIcons name="plus" size={14} color="#22C55E" style={{ marginRight: 2 }} />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
    height: 115,
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
    shadowRadius: 1.5,
  },
  imageContainer: {
    width: 105,
    height: '100%',
    backgroundColor: COLORS.surface,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  wishlistContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  discountText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 12.5,
    lineHeight: 16.5,
  },
  sku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontSize: 9.5,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.xs,
  },
  priceCol: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  mrpText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  bulkText: {
    fontSize: 9,
    color: '#0284C7',
    fontWeight: '500',
    marginTop: 1.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    minWidth: 64,
  },
  addButtonText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
export default HorizontalProductCard;
