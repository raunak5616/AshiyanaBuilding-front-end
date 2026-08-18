import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';
import { ProductPrice } from '../products/ProductPrice';
import { useRemoveFromWishlistMutation } from '../../features/wishlist/wishlistApi';
import { setWishlist } from '../../store/wishlistSlice';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WishlistCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export const WishlistCard = ({ product, onPress }: WishlistCardProps) => {
  const dispatch = useDispatch();
  const imageUrl = product.images?.[0]?.url;

  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const handleRemove = async () => {
    try {
      const res = await removeFromWishlist(product.id).unwrap();
      dispatch(setWishlist(res.data.products));
    } catch (e) {
      console.error('Failed to remove item from wishlist:', e);
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
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.fallbackImage}>
            <MaterialCommunityIcons name="tools" size={30} color={COLORS.textSecondary} />
          </View>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
          disabled={isRemoving}
          activeOpacity={0.8}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={COLORS.error} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.sku} numberOfLines={1}>
          SKU: {product.sku}
        </Text>
        <View style={styles.priceRow}>
          <ProductPrice priceInPaise={product.sellingPrice} style={styles.price} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
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
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 6,
    borderRadius: 14,
    elevation: 2,
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
  priceRow: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
});
export default WishlistCard;
