import React from 'react';
import { TouchableOpacity, Share, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../features/products/productApi';

interface ShareButtonProps {
  product: Product;
  size?: number;
  style?: ViewStyle;
}

export const ShareButton = ({ product, size = 24, style }: ShareButtonProps) => {
  const handleShare = async () => {
    try {
      const shareMessage = `Check out this building material from Ashiyana Building Materials:\n\n*${product.name}*\nSKU: ${product.sku}\nDescription: ${product.description || 'No description'}\nPrice: ₹${(product.sellingPrice / 100).toFixed(2)}`;
      
      await Share.share({
        message: shareMessage,
        title: product.name,
      });
    } catch (e) {
      console.error('Error sharing product:', e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleShare}
      style={[styles.button, style]}
    >
      <MaterialCommunityIcons name="share-variant" size={size} color={COLORS.secondary} />
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
export default ShareButton;
