import React from 'react';
import { FlatList, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Product } from '../../features/products/productApi';
import { ProductCard } from './ProductCard';
import { SkeletonProductCard } from './SkeletonProductCard';
import { EmptyState } from '../common/EmptyState';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onProductPress?: (product: Product) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  badgeType?: 'featured' | 'trending' | 'popular' | 'new';
  numColumns?: number;
}

export const ProductGrid = ({
  products,
  isLoading,
  isFetching = false,
  onRefresh,
  onEndReached,
  onProductPress,
  emptyTitle = 'No Products Found',
  emptySubtitle = 'Try modifying your search or filters.',
  badgeType,
  numColumns = 2,
}: ProductGridProps) => {
  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
        icon="package-variant-closed"
      />
    );
  }

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={isFetching && products.length > 0 && !!onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      ListFooterComponent={renderFooter}
      renderItem={({ item }) => (
        <ProductCard product={item} badgeType={badgeType} onPress={onProductPress} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
});
export default ProductGrid;
