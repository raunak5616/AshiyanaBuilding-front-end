import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { CategoryGrid } from '../../components/categories/CategoryGrid';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ErrorState } from '../../components/common/ErrorState';
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  Category,
  Product,
} from '../../features/products/productApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';

export const CategoriesScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const routeCategoryId = route?.params?.categoryId;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  // Handle route params redirection (e.g., from Home screen "See All")
  useEffect(() => {
    if (routeCategoryId && categoriesData?.data) {
      const found = categoriesData.data.find((c) => c.id === routeCategoryId);
      if (found) {
        setSelectedCategory(found);
        setPage(1);
        setAllProducts([]);
      }
    }
  }, [routeCategoryId, categoriesData]);

  // Fetch products under selected category
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsQuery(
    {
      categoryId: selectedCategory?.id,
      page,
      limit: 20,
    },
    { skip: !selectedCategory }
  );

  // Append new products on paginated load
  useEffect(() => {
    if (productsData?.data) {
      if (page === 1) {
        setAllProducts(productsData.data);
      } else {
        setAllProducts((prev) => [...prev, ...productsData.data]);
      }
    }
  }, [productsData, page]);

  const handleRefresh = () => {
    if (selectedCategory) {
      setPage(1);
      refetchProducts();
    } else {
      refetchCategories();
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setPage(1);
    setAllProducts([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPage(1);
    setAllProducts([]);
    // Clear route param so it doesn't immediately lock back in
    navigation.setParams({ categoryId: undefined });
  };

  const handleLoadMore = () => {
    if (productsData && allProducts.length < productsData.meta.total && !productsFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleProductPress = (product: Product) => {
    dispatch(addProductToRecentlyViewed(product));
  };

  if (categoriesError || (selectedCategory && productsError)) {
    return (
      <ErrorState
        message="Unable to fetch categories or products. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      {selectedCategory ? (
        // Mode: Category Products Listing
        <View style={styles.flex}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={handleBackToCategories} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.secondary} />
              <Text style={styles.backText}>{selectedCategory.name}</Text>
            </TouchableOpacity>
          </View>

          <ProductGrid
            products={allProducts}
            isLoading={productsLoading}
            isFetching={productsFetching}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onProductPress={handleProductPress}
            emptyTitle={`No Products in ${selectedCategory.name}`}
            emptySubtitle="Check back later for newly added stock."
          />
        </View>
      ) : (
        // Mode: Categories Grid List
        <View style={styles.flex}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>All Categories</Text>
            <Text style={styles.subtitle}>Explore building materials by category</Text>
          </View>

          <CategoryGrid
            categories={categoriesData?.data || []}
            isLoading={categoriesLoading}
            isFetching={categoriesFetching}
            onRefresh={handleRefresh}
            onCategoryPress={handleCategorySelect}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    fontSize: 16,
  },
});
export default CategoriesScreen;
