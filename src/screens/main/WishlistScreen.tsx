import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setWishlist } from '../../store/wishlistSlice';
import { useGetWishlistQuery } from '../../features/wishlist/wishlistApi';
import { WishlistCard } from '../../components/wishlist/WishlistCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product } from '../../features/products/productApi';

export const WishlistScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  
  // Read wishlist items directly from Redux (guarantees fast loading/offline cache)
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const {
    data: wishlistData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWishlistQuery();

  // Sync RTK Query data to Redux slice whenever it refreshes
  useEffect(() => {
    if (wishlistData?.data?.products) {
      dispatch(setWishlist(wishlistData.data.products));
    }
  }, [wishlistData, dispatch]);

  const handleRefresh = () => {
    refetch();
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('HomeTab', {
      screen: 'ProductDetails',
      params: { productId: product.id },
    });
  };

  if (isLoading && wishlistItems.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error && wishlistItems.length === 0) {
    return (
      <ErrorState
        message="Unable to fetch wishlist. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <EmptyState
          title="Your Wishlist is Empty"
          subtitle="Save items you want to purchase later. Tap the heart icon on any product."
          icon="heart-outline"
          buttonLabel="Explore Products"
          onPress={() => navigation.navigate('HomeTab')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.subtitle}>{wishlistItems.length} items saved</Text>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={isFetching}
        renderItem={({ item }) => (
          <WishlistCard product={item} onPress={handleProductPress} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
export default WishlistScreen;
