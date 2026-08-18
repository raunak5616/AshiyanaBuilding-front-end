import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ErrorState } from '../../components/common/ErrorState';
import { useGetProductsQuery, Product } from '../../features/products/productApi';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RECENT_SEARCHES_KEY = '@recent_searches';

export const SearchScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Debouncing search input (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
      setAllProducts([]);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchText]);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  };

  const saveRecentSearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    const cleanKeyword = keyword.trim();
    // Filter duplicates, keep max 5
    const updated = [cleanKeyword, ...recentSearches.filter((s) => s !== cleanKeyword)].slice(0, 5);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
  };

  const handleClearRecentSearch = async (keyword: string) => {
    const updated = recentSearches.filter((s) => s !== keyword);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to clear search keyword', e);
    }
  };

  // Fetch paginated products matching debounced search text
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsQuery(
    {
      search: debouncedSearch.trim() || undefined,
      page,
      limit: 20,
    },
    { skip: !debouncedSearch.trim() }
  );

  // Append new product list pages
  useEffect(() => {
    if (productsData?.data) {
      if (page === 1) {
        setAllProducts(productsData.data);
      } else {
        setAllProducts((prev) => [...prev, ...productsData.data]);
      }
    }
  }, [productsData, page]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
    // Save keyword to search history when selection is made
    saveRecentSearch(debouncedSearch);
  };

  const handleLoadMore = () => {
    if (productsData && allProducts.length < productsData.meta.total && !productsFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    refetchProducts();
  };

  const handleRecentKeywordClick = (keyword: string) => {
    setSearchText(keyword);
  };

  return (
    <View style={styles.container}>
      {/* Header and Back navigation */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onClear={() => setSearchText('')}
            placeholder="Search cement, steel, pipes..."
          />
        </View>
      </View>

      {/* Render logic: Recent searches vs. Grid Results */}
      {!debouncedSearch.trim() ? (
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 ? (
            <View>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              <FlatList
                data={recentSearches}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={styles.recentRow}>
                    <TouchableOpacity
                      onPress={() => handleRecentKeywordClick(item)}
                      style={styles.recentKeywordContainer}
                    >
                      <MaterialCommunityIcons name="history" size={20} color={COLORS.textSecondary} />
                      <Text style={styles.recentText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleClearRecentSearch(item)}
                      style={styles.deleteKeywordButton}
                    >
                      <MaterialCommunityIcons name="close" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialCommunityIcons name="magnify" size={64} color={COLORS.disabled} />
              <Text style={styles.emptyTitle}>Search building materials</Text>
              <Text style={styles.emptySubtitle}>Enter keywords above to find concrete, steel, pipes, and more.</Text>
            </View>
          )}
        </View>
      ) : productsError ? (
        <ErrorState message="Could not complete search. Please try again." onRetry={handleRefresh} />
      ) : (
        <View style={styles.resultsContainer}>
          <ProductGrid
            products={allProducts}
            isLoading={productsLoading}
            isFetching={productsFetching}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onProductPress={handleProductPress}
            emptyTitle="No Materials Match Your Search"
            emptySubtitle="Check spelling or try using simpler terms."
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
    marginRight: SPACING.sm,
    padding: 4,
  },
  searchBarWrapper: {
    flex: 1,
  },
  recentContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  recentTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  recentKeywordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  deleteKeywordButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
export default SearchScreen;
