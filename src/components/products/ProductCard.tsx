import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';
import { ProductPrice } from './ProductPrice';
import { StockBadge } from './StockBadge';
import { ProductBadge, BadgeType } from './ProductBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAddToCartMutation } from '../../features/cart/cartApi';

interface ProductCardProps {
  product: Product;
  badgeType?: BadgeType;
  onPress?: (product: Product) => void;
}

export const ProductCard = ({ product, badgeType, onPress }: ProductCardProps) => {
  const imageUrl = product.images?.[0]?.url;
  const [addToCart, { isLoading }] = useAddToCartMutation();

  // Deterministic mock MRP and discount based on product name
  const getMockMrpAndDiscount = (name: string, sellingPrice: number) => {
    const code = (name || '').charCodeAt(0) || 1;
    const discountPercent = 15 + (code % 36); // Deterministic discount between 15% and 50%
    const mrp = Math.round(sellingPrice / (1 - discountPercent / 100));
    return { mrp, discountPercent };
  };

  const { mrp, discountPercent } = getMockMrpAndDiscount(product.name, product.sellingPrice);

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    try {
      await addToCart({ productId: product.id || product._id, quantity: 1 }).unwrap();
    } catch (err) {
      console.error('Failed to quick-add to cart', err);
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
            <MaterialCommunityIcons name="tools" size={40} color={COLORS.textSecondary} />
          </View>
        )}
        
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPercent}% Off</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.sku} numberOfLines={1}>
            SKU: {product.sku}
          </Text>
          
          <View style={styles.priceRow}>
            <ProductPrice priceInPaise={product.sellingPrice} style={styles.price} />
            <Text style={styles.mrpText}>₹{Math.round(mrp / 100)}</Text>
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
            <ActivityIndicator size="small" color={COLORS.success} />
          ) : (
            <Text style={styles.addButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
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
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    padding: SPACING.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    minHeight: 36,
    fontSize: 13,
  },
  sku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontSize: 10,
  },
  priceRow: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  mrpText: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  bulkText: {
    fontSize: 9.5,
    color: '#0284C7',
    fontWeight: '500',
    marginTop: 2,
  },
  wishlistContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
  },
  addButton: {
    borderWidth: 1.2,
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingVertical: 5,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  addButtonText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
export default ProductCard;
