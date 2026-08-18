import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { useGetRelatedProductsQuery } from '../../features/products/productDetailsApi';
import { ProductCard } from './ProductCard';
import { SkeletonProductCard } from './SkeletonProductCard';

interface RelatedProductsProps {
  categoryId: string | null;
  currentProductId: string;
  onProductPress?: (product: any) => void;
}

export const RelatedProducts = ({
  categoryId,
  currentProductId,
  onProductPress,
}: RelatedProductsProps) => {
  if (!categoryId) return null;

  const { data: relatedData, isLoading } = useGetRelatedProductsQuery({
    categoryId,
    limit: 6,
  });

  const filteredItems = relatedData?.data?.filter((p) => p.id !== currentProductId) || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Related Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (filteredItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Related Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filteredItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={onProductPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scroll: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
});
export default RelatedProducts;
