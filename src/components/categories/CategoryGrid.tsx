import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Category } from '../../features/products/productApi';
import { CategoryCard } from './CategoryCard';
import { SkeletonCategoryCard } from './SkeletonCategoryCard';
import { EmptyState } from '../common/EmptyState';
import { SPACING } from '../../theme/spacing';

interface CategoryGridProps {
  categories: Category[];
  isLoading: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  onCategoryPress?: (category: Category) => void;
}

export const CategoryGrid = ({
  categories,
  isLoading,
  isFetching = false,
  onRefresh,
  onCategoryPress,
}: CategoryGridProps) => {
  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCategoryCard key={i} />
        ))}
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="No Categories Available"
        subtitle="Please check back later."
        icon="shape-outline"
      />
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id}
      numColumns={4}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={isFetching && categories.length > 0 && !!onRefresh}
      renderItem={({ item }) => (
        <CategoryCard category={item} onPress={onCategoryPress} />
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
    marginBottom: SPACING.sm,
  },
});
export default CategoryGrid;
