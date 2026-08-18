import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ErrorState } from '../../components/common/ErrorState';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  Product,
} from '../../features/products/productApi';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RECENT_SEARCHES_KEY = '@recent_searches';

export const SearchScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Filter & Sorting state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'createdAt' | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

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

  // Reset filters if search input is cleared
  useEffect(() => {
    if (!searchText.trim()) {
      setSelectedCategoryId(null);
      setSelectedBrandId(null);
      setSortBy(undefined);
      setSortOrder(undefined);
    }
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

  // Fetch static categories and brands for filters
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

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
      categoryId: selectedCategoryId || undefined,
      brandId: selectedBrandId || undefined,
      sortBy,
      sortOrder,
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

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
    setAllProducts([]);
  };

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrandId(brandId);
    setPage(1);
    setAllProducts([]);
  };

  const handleSortSelect = (type: 'price' | 'name' | 'createdAt' | undefined, order: 'asc' | 'desc' | undefined) => {
    setSortBy(type);
    setSortOrder(order);
    setPage(1);
    setAllProducts([]);
    setSortMenuVisible(false);
  };

  const getSortLabel = () => {
    if (sortBy === 'price' && sortOrder === 'asc') return 'Price: Low to High';
    if (sortBy === 'price' && sortOrder === 'desc') return 'Price: High to Low';
    if (sortBy === 'name' && sortOrder === 'asc') return 'Name: A to Z';
    return 'Sort By';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          {/* Filters Section (Only when results are shown) */}
          <View style={styles.filterSection}>
            {/* Category horizontal list + Sort button */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.sortButton, (sortBy !== undefined) && styles.sortButtonActive]}
                onPress={() => setSortMenuVisible(true)}
              >
                <MaterialCommunityIcons 
                  name="sort-variant" 
                  size={16} 
                  color={sortBy !== undefined ? COLORS.background : COLORS.textPrimary} 
                />
                <Text style={[styles.sortButtonText, (sortBy !== undefined) && styles.sortButtonTextActive]}>
                  {getSortLabel()}
                </Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.chip, selectedCategoryId === null && styles.chipActive]}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={[styles.chipText, selectedCategoryId === null && styles.chipTextActive]}>
                  All Categories
                </Text>
              </TouchableOpacity>
              {categoriesData?.data?.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
                  onPress={() => handleCategorySelect(cat.id)}
                >
                  <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Brand horizontal list */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.filterScroll, { marginTop: SPACING.xs }]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.chip, selectedBrandId === null && styles.chipActive]}
                onPress={() => handleBrandSelect(null)}
              >
                <Text style={[styles.chipText, selectedBrandId === null && styles.chipTextActive]}>
                  All Brands
                </Text>
              </TouchableOpacity>
              {brandsData?.data?.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  activeOpacity={0.8}
                  style={[styles.chip, selectedBrandId === brand.id && styles.chipActive]}
                  onPress={() => handleBrandSelect(brand.id)}
                >
                  <Text style={[styles.chipText, selectedBrandId === brand.id && styles.chipTextActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

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

          {/* Sort Menu Modal */}
          <Modal
            visible={sortMenuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSortMenuVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalOverlay}
              onPress={() => setSortMenuVisible(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sort Products</Text>
                
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSortSelect(undefined, undefined)}
                >
                  <Text style={[styles.menuItemText, sortBy === undefined && styles.menuItemTextActive]}>
                    Default (Newest)
                  </Text>
                  {sortBy === undefined && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSortSelect('price', 'asc')}
                >
                  <Text style={[styles.menuItemText, sortBy === 'price' && sortOrder === 'asc' && styles.menuItemTextActive]}>
                    Price: Low to High
                  </Text>
                  {sortBy === 'price' && sortOrder === 'asc' && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSortSelect('price', 'desc')}
                >
                  <Text style={[styles.menuItemText, sortBy === 'price' && sortOrder === 'desc' && styles.menuItemTextActive]}>
                    Price: High to Low
                  </Text>
                  {sortBy === 'price' && sortOrder === 'desc' && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSortSelect('name', 'asc')}
                >
                  <Text style={[styles.menuItemText, sortBy === 'name' && sortOrder === 'asc' && styles.menuItemTextActive]}>
                    Name: A to Z
                  </Text>
                  {sortBy === 'name' && sortOrder === 'asc' && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}
     </SafeAreaView>
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
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 4,
    fontSize: 11,
  },
  sortButtonTextActive: {
    color: COLORS.background,
  },
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  chipTextActive: {
    color: COLORS.background,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  modalTitle: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
export default SearchScreen;
