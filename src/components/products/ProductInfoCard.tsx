import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';
import { ProductPrice } from './ProductPrice';
import { StockBadge } from './StockBadge';

interface ProductInfoCardProps {
  product: Product;
}

export const ProductInfoCard = ({ product }: ProductInfoCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.sku}>SKU: {product.sku}</Text>
      </View>

      <View style={styles.priceRow}>
        <ProductPrice priceInPaise={product.sellingPrice} style={styles.price} />
        <StockBadge inStock={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  price: {
    fontSize: 22,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
});
export default ProductInfoCard;
