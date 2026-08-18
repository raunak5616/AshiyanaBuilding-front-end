import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setWishlist } from '../../store/wishlistSlice';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../../features/wishlist/wishlistApi';
import { COLORS } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WishlistButtonProps {
  productId: string;
  size?: number;
  style?: ViewStyle;
}

export const WishlistButton = ({ productId, size = 24, style }: WishlistButtonProps) => {
  const dispatch = useDispatch();
  const productIds = useSelector((state: RootState) => state.wishlist.productIds);
  const isWishlisted = productIds.includes(productId);

  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const [localToggle, setLocalToggle] = useState(isWishlisted);

  const handleToggle = async () => {
    try {
      if (isWishlisted) {
        setLocalToggle(false);
        const res = await removeFromWishlist(productId).unwrap();
        dispatch(setWishlist(res.data.products));
      } else {
        setLocalToggle(true);
        const res = await addToWishlist(productId).unwrap();
        dispatch(setWishlist(res.data.products));
      }
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
      // Revert local state on error
      setLocalToggle(isWishlisted);
    }
  };

  const isLoading = isAdding || isRemoving;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleToggle}
      disabled={isLoading}
      style={[styles.button, style]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.error} />
      ) : (
        <MaterialCommunityIcons
          name={localToggle ? 'heart' : 'heart-outline'}
          size={size}
          color={localToggle ? COLORS.error : COLORS.secondary}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});
export default WishlistButton;
