import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ROUTES } from '../../constants/routes';
import { ErrorState } from '../../components/common/ErrorState';
import { HorizontalProductCard } from '../../components/products/HorizontalProductCard';
import { SkeletonProductCard } from '../../components/products/SkeletonProductCard';
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetBrandsQuery,
  Category,
  Product,
} from '../../features/products/productApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';

// Map database category names to representative images & colors
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'cement': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=150',
  'tiling': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=150',
  'tile': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=150',
  'painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=150',
  'paint': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=150',
  'waterproofing': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=150',
  'plywood': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=150',
  'mdf': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=150',
  'hdhmr': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=150',
  'fevicol': 'https://images.unsplash.com/photo-1567093322473-b34e8e87515b?auto=format&fit=crop&q=80&w=150',
  'glue': 'https://images.unsplash.com/photo-1567093322473-b34e8e87515b?auto=format&fit=crop&q=80&w=150',
  'wire': 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=150',
  'wires': 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=150',
  'switch': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=150',
  'switches': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=150',
  'hinge': 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=150',
  'hinges': 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=150',
  'kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=150',
  'wardrobe': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=150',
  'lock': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=150',
  'locks': 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=150',
  'conduit': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=150',
  'conduits': 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=150',
  'sanitary': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=150',
  'lighting': 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=150',
  'light': 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=150',
  'lights': 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=150',
  'pipe': 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&q=80&w=150',
  'pipes': 'https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&q=80&w=150',
  'cctv': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=150',
  'tool': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=150',
  'tools': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=150',
};

const CATEGORY_BG_MAP: Record<string, string> = {
  'cement': '#F0FDF4',
  'tiling': '#EBF8FF',
  'tile': '#EBF8FF',
  'painting': '#FFF5F5',
  'paint': '#FFF5F5',
  'waterproofing': '#F5F3FF',
  'plywood': '#FEF3C7',
  'mdf': '#FEF3C7',
  'hdhmr': '#FEF3C7',
  'fevicol': '#E0F2FE',
  'glue': '#E0F2FE',
  'wire': '#FFEDD5',
  'wires': '#FFEDD5',
  'switch': '#F1F5F9',
  'switches': '#F1F5F9',
  'hinge': '#ECFDF5',
  'hinges': '#ECFDF5',
  'kitchen': '#EFF6FF',
  'wardrobe': '#FAF5FF',
  'lock': '#FEF2F2',
  'locks': '#FEF2F2',
  'conduit': '#ECFEFF',
  'conduits': '#ECFEFF',
  'sanitary': '#F0FDFA',
  'lighting': '#FFFBEB',
  'pipe': '#F0FDF4',
  'pipes': '#F0FDF4',
  'cctv': '#F8FAFC',
  'tool': '#EBF8FF',
  'tools': '#EBF8FF',
};

const getCategoryStyles = (name: string) => {
  const lowercase = name.toLowerCase();
  const matchedKey = Object.keys(CATEGORY_IMAGE_MAP).find((key) => lowercase.includes(key));

  if (matchedKey) {
    return {
      image: CATEGORY_IMAGE_MAP[matchedKey],
      bgColor: CATEGORY_BG_MAP[matchedKey] || '#F3F4F6',
    };
  }

  return {
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=150',
    bgColor: '#F3F4F6',
  };
};

export const CategoriesScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const routeCategoryId = route?.params?.categoryId;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'createdAt' | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Fetch all categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  // Fetch all brands
  const { data: brandsData } = useGetBrandsQuery();

  const dbCategories = categoriesData?.data || [];

  // Automatically select the first category if none is selected
  useEffect(() => {
    if (dbCategories.length > 0 && !selectedCategory) {
      // Check if redirecting from route params first
      if (routeCategoryId) {
        const found = dbCategories.find((c) => c.id === routeCategoryId);
        if (found) {
          setSelectedCategory(found);
          return;
        }
      }
      setSelectedCategory(dbCategories[0]);
    }
  }, [dbCategories, selectedCategory, routeCategoryId]);

  // Handle route params redirection (e.g., from Home screen category click)
  useEffect(() => {
    if (routeCategoryId && dbCategories.length > 0) {
      const found = dbCategories.find((c) => c.id === routeCategoryId);
      if (found) {
        setSelectedCategory(found);
        setSelectedBrandId(null);
        setSortBy(undefined);
        setSortOrder(undefined);
        setPage(1);
        setAllProducts([]);
      }
    }
  }, [routeCategoryId, dbCategories]);

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
      brandId: selectedBrandId || undefined,
      sortBy,
      sortOrder,
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
    setSelectedBrandId(null);
    setSortBy(undefined);
    setSortOrder(undefined);
    setPage(1);
    setAllProducts([]);
    // Clear route param so it doesn't lock in
    navigation.setParams({ categoryId: undefined });
  };

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrandId(brandId);
    setPage(1);
    setAllProducts([]);
  };

  const handleSortSelect = (
    type: 'price' | 'name' | 'createdAt' | undefined,
    order: 'asc' | 'desc' | undefined
  ) => {
    setSortBy(type);
    setSortOrder(order);
    setPage(1);
    setAllProducts([]);
    setSortMenuVisible(false);
  };

  const handleLoadMore = () => {
    if (productsData && allProducts.length < productsData.meta.total && !productsFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleProductPress = (product: Product) => {
    dispatch(addProductToRecentlyViewed(product));
    navigation.navigate('HomeTab', {
      screen: 'ProductDetails',
      params: { productId: product.id || product._id },
    });
  };

  const getSortLabel = () => {
    if (sortBy === 'price' && sortOrder === 'asc') return 'Price: Low to High';
    if (sortBy === 'price' && sortOrder === 'desc') return 'Price: High to Low';
    if (sortBy === 'name' && sortOrder === 'asc') return 'Name: A to Z';
    return 'Sort By';
  };

  if (categoriesError || (selectedCategory && productsError)) {
    return (
      <ErrorState
        message="Unable to fetch categories or products. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  const renderFooterLoader = () => {
    if (!productsFetching) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header Bar with Search Option */}
      <View style={styles.topHeaderBar}>
        <Text style={styles.topHeaderTitle}>Categories</Text>
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => navigation.navigate(ROUTES.MAIN.HOME, { screen: 'Search' })}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.splitLayout}>
        
        {/* 1. LEFT SIDEBAR: CATEGORIES LIST */}
        <View style={styles.sidebar}>
          {categoriesLoading ? (
            <View style={styles.sidebarLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {dbCategories.map((category) => {
                const isActive = selectedCategory?.id === category.id;
                const mappedStyles = getCategoryStyles(category.name);
                return (
                  <TouchableOpacity
                    key={category.id}
                    activeOpacity={0.8}
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    {isActive && <View style={styles.activeIndicator} />}
                    <View style={[styles.sidebarIconBox, { backgroundColor: mappedStyles.bgColor }]}>
                      <Image source={{ uri: category.image || mappedStyles.image }} style={styles.sidebarIcon} />
                    </View>
                    <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]} numberOfLines={2}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 2. RIGHT CATALOG: SELECTED CATEGORY PRODUCTS */}
        <View style={styles.mainContent}>
          {selectedCategory ? (
            <View style={styles.flex}>
              {/* Category Subheader */}
              <View style={styles.headerBar}>
                <Text style={styles.categoryTitle}>{selectedCategory.name}</Text>
                
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.sortButton, sortBy !== undefined && styles.sortButtonActive]}
                  onPress={() => setSortMenuVisible(true)}
                >
                  <MaterialCommunityIcons
                    name="sort-variant"
                    size={16}
                    color={sortBy !== undefined ? COLORS.background : COLORS.textPrimary}
                  />
                  <Text style={[styles.sortButtonText, sortBy !== undefined && styles.sortButtonTextActive]}>
                    {getSortLabel()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Brands Horizontal Scroll */}
              {brandsData?.data && brandsData.data.length > 0 && (
                <View style={styles.filterSection}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.brandScroll}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.brandChip, selectedBrandId === null && styles.brandChipActive]}
                      onPress={() => handleBrandSelect(null)}
                    >
                      <Text style={[styles.brandChipText, selectedBrandId === null && styles.brandChipTextActive]}>
                        All Brands
                      </Text>
                    </TouchableOpacity>
                    {brandsData.data.map((brand) => (
                      <TouchableOpacity
                        key={brand.id}
                        activeOpacity={0.8}
                        style={[styles.brandChip, selectedBrandId === brand.id && styles.brandChipActive]}
                        onPress={() => handleBrandSelect(brand.id)}
                      >
                        <Text style={[styles.brandChipText, selectedBrandId === brand.id && styles.brandChipTextActive]}>
                          {brand.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Product Grid / List */}
              {productsLoading && allProducts.length === 0 ? (
                <View style={styles.loadingContainer}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonProductCard key={i} horizontal />
                  ))}
                </View>
              ) : allProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="package-variant-closed" size={54} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No Materials Found</Text>
                  <Text style={styles.emptySubtitle}>No items registered under {selectedCategory.name} category yet.</Text>
                </View>
              ) : (
                <FlatList
                  data={allProducts}
                  keyExtractor={(item) => item.id || item._id}
                  contentContainerStyle={styles.listContent}
                  onRefresh={handleRefresh}
                  refreshing={productsFetching && allProducts.length > 0}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.2}
                  ListFooterComponent={renderFooterLoader}
                  renderItem={({ item }) => (
                    <HorizontalProductCard product={item} onPress={handleProductPress} />
                  )}
                />
              )}
            </View>
          ) : (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        </View>
      </View>

      {/* 3. SORT BOTTOM SHEET MODAL */}
      <Modal
        visible={sortMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setSortMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Materials</Text>
              <TouchableOpacity onPress={() => setSortMenuVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuItem}
              onPress={() => handleSortSelect(undefined, undefined)}
            >
              <Text style={[styles.menuItemText, sortBy === undefined && styles.menuItemTextActive]}>
                Default (Newest)
              </Text>
              {sortBy === undefined && (
                <MaterialCommunityIcons name="check" size={20} color="#22C55E" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuItem}
              onPress={() => handleSortSelect('price', 'asc')}
            >
              <Text style={[styles.menuItemText, sortBy === 'price' && sortOrder === 'asc' && styles.menuItemTextActive]}>
                Price: Low to High
              </Text>
              {sortBy === 'price' && sortOrder === 'asc' && (
                <MaterialCommunityIcons name="check" size={20} color="#22C55E" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuItem}
              onPress={() => handleSortSelect('price', 'desc')}
            >
              <Text style={[styles.menuItemText, sortBy === 'price' && sortOrder === 'desc' && styles.menuItemTextActive]}>
                Price: High to Low
              </Text>
              {sortBy === 'price' && sortOrder === 'desc' && (
                <MaterialCommunityIcons name="check" size={20} color="#22C55E" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuItem}
              onPress={() => handleSortSelect('name', 'asc')}
            >
              <Text style={[styles.menuItemText, sortBy === 'name' && sortOrder === 'asc' && styles.menuItemTextActive]}>
                Name: A to Z
              </Text>
              {sortBy === 'name' && sortOrder === 'asc' && (
                <MaterialCommunityIcons name="check" size={20} color="#22C55E" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 86,
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  sidebarLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sidebarItemActive: {
    backgroundColor: COLORS.background,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3.5,
    backgroundColor: '#22C55E', // Green active tag
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sidebarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sidebarIcon: {
    width: '80%',
    height: '80%',
    borderRadius: 6,
  },
  sidebarText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  sidebarTextActive: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  sortButtonTextActive: {
    color: COLORS.background,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  brandScroll: {
    paddingHorizontal: SPACING.md,
  },
  brandChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 4.5,
    paddingHorizontal: 12,
    marginRight: SPACING.xs,
  },
  brandChipActive: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  brandChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  brandChipTextActive: {
    color: COLORS.background,
  },
  loadingContainer: {
    padding: SPACING.md,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  footerLoader: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  menuItemTextActive: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  topHeaderTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  searchIconBtn: {
    padding: 6,
  },
});

export default CategoriesScreen;
