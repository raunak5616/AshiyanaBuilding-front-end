import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RootState } from '../../store/store';
import { SearchBar } from '../../components/common/SearchBar';
import { BannerCarousel } from '../../components/common/BannerCarousel';
import { SectionHeader } from '../../components/common/SectionHeader';
import { CategoryCard } from '../../components/categories/CategoryCard';
import { ProductCard } from '../../components/products/ProductCard';
import { HorizontalProductCard } from '../../components/products/HorizontalProductCard';
import { SkeletonProductCard } from '../../components/products/SkeletonProductCard';
import { SkeletonCategoryCard } from '../../components/categories/SkeletonCategoryCard';
import { ErrorState } from '../../components/common/ErrorState';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  Product,
  Category,
} from '../../features/products/productApi';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const recentlyViewed = useSelector((state: RootState) => state.recentlyViewed.items);

  // RTK Query calls
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const {
    data: featuredData,
    isLoading: featuredLoading,
    isFetching: featuredFetching,
    error: featuredError,
    refetch: refetchFeatured,
  } = useGetProductsQuery({ limit: 5, page: 1 });

  const {
    data: popularData,
    isLoading: popularLoading,
    isFetching: popularFetching,
    error: popularError,
    refetch: refetchPopular,
  } = useGetProductsQuery({ limit: 6, page: 2 });

  const {
    data: trendingData,
    isLoading: trendingLoading,
    isFetching: trendingFetching,
    error: trendingError,
    refetch: refetchTrending,
  } = useGetProductsQuery({ limit: 5, page: 3 });

  const isRefreshing =
    categoriesFetching || featuredFetching || popularFetching || trendingFetching;

  const handleRefresh = () => {
    refetchCategories();
    refetchFeatured();
    refetchPopular();
    refetchTrending();
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoriesTab', { categoryId: category.id });
  };

  const hasErrors = categoriesError || featuredError || popularError || trendingError;

  if (hasErrors && !isRefreshing) {
    return (
      <ErrorState
        message="Failed to load catalog. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Greeting Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.fullName || 'Customer'} 👋</Text>
        <Text style={styles.subGreeting}>Order your premium building materials today</Text>
      </View>

      {/* Readonly Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar readonly onPress={() => navigation.navigate('Search')} />
      </View>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Categories Preview */}
      <SectionHeader
        title="Categories"
        onPressSeeAll={() => navigation.navigate('CategoriesTab')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categoriesLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCategoryCard key={i} />)
          : categoriesData?.data?.slice(0, 8).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
              />
            ))}
      </ScrollView>

      {/* Featured Products */}
      <SectionHeader title="Featured Materials" showSeeAll={false} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productScroll}
      >
        {featuredLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonProductCard key={i} />)
          : featuredData?.data?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeType="featured"
                onPress={handleProductPress}
              />
            ))}
      </ScrollView>

      {/* Trending Products (Horizontal layout) */}
      <SectionHeader title="Trending Deals" showSeeAll={false} />
      <View style={styles.horizontalListContainer}>
        {trendingLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonProductCard key={i} horizontal />)
          : trendingData?.data?.map((product) => (
              <HorizontalProductCard
                key={product.id}
                product={product}
                badgeType="trending"
                onPress={handleProductPress}
              />
            ))}
      </View>

      {/* Popular Products (Grid) */}
      <SectionHeader title="Popular Products" showSeeAll={false} />
      <View style={styles.gridContainer}>
        {popularLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonProductCard key={i} />)
          : popularData?.data?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badgeType="popular"
                onPress={handleProductPress}
              />
            ))}
      </View>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <>
          <SectionHeader title="Recently Viewed" showSeeAll={false} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productScroll}
          >
            {recentlyViewed.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={handleProductPress}
              />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  greeting: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subGreeting: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  categoryScroll: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  productScroll: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  horizontalListContainer: {
    paddingHorizontal: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
});
export default HomeScreen;
