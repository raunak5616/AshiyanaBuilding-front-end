import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ROUTES } from '../../constants/routes';
import { RootState } from '../../store/store';
import { ProductCard } from '../../components/products/ProductCard';
import { ErrorState } from '../../components/common/ErrorState';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  Product,
  Category,
} from '../../features/products/productApi';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { useListAddressesQuery } from '../../features/profile/profileApi';
import { useGetSlidesQuery } from '../../features/slides/slidesApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic category style & image mappings based on DB names
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
  'cement': '#F0FDF4', // soft green
  'tiling': '#EBF8FF', // soft blue
  'tile': '#EBF8FF',
  'painting': '#FFF5F5', // soft red
  'paint': '#FFF5F5',
  'waterproofing': '#F5F3FF', // soft purple
  'plywood': '#FEF3C7', // soft amber
  'mdf': '#FEF3C7',
  'hdhmr': '#FEF3C7',
  'fevicol': '#E0F2FE', // soft sky
  'glue': '#E0F2FE',
  'wire': '#FFEDD5', // soft orange
  'wires': '#FFEDD5',
  'switch': '#F1F5F9', // soft gray
  'switches': '#F1F5F9',
  'hinge': '#ECFDF5', // soft emerald
  'hinges': '#ECFDF5',
  'kitchen': '#EFF6FF', // soft indigo
  'wardrobe': '#FAF5FF', // soft fuchsia
  'lock': '#FEF2F2', // soft rose
  'locks': '#FEF2F2',
  'conduit': '#ECFEFF', // soft cyan
  'conduits': '#ECFEFF',
  'sanitary': '#F0FDFA', // soft teal
  'lighting': '#FFFBEB', // soft yellow
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

  // General fallback
  return {
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=150',
    bgColor: '#F3F4F6',
  };
};

// Dynamic Banner Slideshow component
const BannerSlideshow = ({ slides, onSlidePress }: { slides: any[]; onSlidePress: (slide: any) => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  if (slides.length === 0) return null;

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id || item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.bannerSlideCard}
              onPress={() => onSlidePress(item)}
              disabled={!item.categoryId}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
              {item.categoryId && (
                <View style={styles.bannerTapIndicator}>
                  <Text style={styles.bannerTapText}>Tap to View Category</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
      {slides.length > 1 && (
        <View style={styles.bannerDots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.bannerDot,
                { backgroundColor: i === activeIndex ? '#22C55E' : '#D4D4D8' },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// 3-4 Product Slideshow Component
const ProductSlideshow = ({ products, onProductPress }: { products: Product[]; onProductPress: (p: Product) => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const displayProducts = products.slice(0, 4); // Limit to 3-4 products

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <View style={styles.slideshowContainer}>
      <Text style={styles.slideshowTitle}>Special Wholesale Deals</Text>
      <FlatList
        ref={flatListRef}
        data={displayProducts}
        keyExtractor={(item) => item.id || item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const imageUrl = item.images?.[0]?.url;
          const getMockMrpAndDiscount = (name: string, price: number) => {
            const code = (name || '').charCodeAt(0) || 1;
            const discountPercent = 15 + (code % 36);
            const mrp = Math.round(price / (1 - discountPercent / 100));
            return { mrp, discountPercent };
          };
          const { mrp, discountPercent } = getMockMrpAndDiscount(item.name, item.sellingPrice);

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.slideCard}
              onPress={() => onProductPress(item)}
            >
              <View style={styles.slideLeft}>
                <View style={styles.slideBadge}>
                  <Text style={styles.slideBadgeText}>{discountPercent}% OFF</Text>
                </View>
                <Text style={styles.slideName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.slidePriceRow}>
                  <Text style={styles.slidePrice}>₹{Math.round(item.sellingPrice / 100)}</Text>
                  <Text style={styles.slideMrp}>M.R.P. ₹{Math.round(mrp / 100)}</Text>
                </View>
                <Text style={styles.slideBulkText}>Bulk prices available for contractors</Text>
              </View>
              <View style={styles.slideRight}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.slideImage} resizeMode="contain" />
                ) : (
                  <View style={styles.slideFallback}>
                    <MaterialCommunityIcons name="tools" size={32} color={COLORS.textSecondary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.slideshowDots}>
        {displayProducts.map((_, i) => (
          <View
            key={i}
            style={[
              styles.slideshowDot,
              { backgroundColor: i === activeIndex ? '#22C55E' : '#D4D4D8' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export const HomeScreen = ({ navigation: propNavigation }: any) => {
  const navigation = useNavigation<any>();
  const recentlyViewed = useSelector((state: RootState) => state.recentlyViewed.items);

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // RTK Query calls
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const {
    data: featuredData,
    isLoading: featuredLoading,
    isFetching: featuredFetching,
    error: featuredError,
    refetch: refetchFeatured,
  } = useGetProductsQuery({ limit: 8, page: 1 });

  const {
    data: slidesData,
    refetch: refetchSlides,
  } = useGetSlidesQuery();

  const slides = slidesData?.data || [];

  const {
    data: cartData,
  } = useGetCartQuery();

  const {
    data: addressData,
  } = useListAddressesQuery();

  const cartItems = cartData?.data?.items || [];
  const savedAddresses = addressData?.data || [];

  // Slice categories fetched from DB to limit categories to 5 rows maximum (5 rows x 4 columns = 20 categories)
  const dbCategories = categoriesData?.data || [];
  const displayCategories = dbCategories.slice(0, 20);

  // Automatically pick default address or first saved address
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddress) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [savedAddresses, selectedAddress]);

  const handleRefresh = () => {
    refetchCategories();
    refetchFeatured();
    refetchSlides();
  };

  const handleSlidePress = (slide: any) => {
    if (slide.categoryId) {
      navigation.navigate('CategoriesTab', { categoryId: slide.categoryId });
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id || product._id });
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoriesTab', { categoryId: category.id });
  };

  if (featuredError && !featuredFetching) {
    return (
      <ErrorState
        message="Failed to load catalog. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. PREMIUM HEADER BAR */}
      <View style={styles.headerBar}>
        {/* Left Side: Delivery Pincode Dropdown */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.deliverySelector}
          onPress={() => setAddressModalVisible(true)}
        >
          <View style={styles.deliveryTimeBadge}>
            <Text style={styles.deliveryTimeText}>60 Mins</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliverToLabel}>Deliver To</Text>
            <View style={styles.pincodeRow}>
              <Text style={styles.pincodeText} numberOfLines={1}>
                {selectedAddress
                  ? `${selectedAddress.postalCode} ${selectedAddress.city}`
                  : 'Select Location'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color={COLORS.textPrimary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Center Logo: Branded Image */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/Aashiyana.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Right Actions: Search & Cart badge */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate(ROUTES.MAIN.HOME, { screen: 'Search' })}
          >
            <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('CartTab')}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color={COLORS.textPrimary} />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={featuredFetching}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* 2. PROMO CASHBACK BANNER */}
        <View style={styles.cashbackBanner}>
          <View style={styles.cashbackLeft}>
            <MaterialCommunityIcons name="wallet-giftcard" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.cashbackBold}>WALLET BENEFIT</Text>
          </View>
          <Text style={styles.cashbackText}>
            Get an additional <Text style={styles.cashbackHighlight}>2% discount</Text> on orders above ₹100 using Wallet
          </Text>
        </View>

        {/* 3. HERO PROMO CARD (Wholesale Prices Now Live) or Dynamic Banner Slider */}
        {slides && slides.length > 0 ? (
          <BannerSlideshow slides={slides} onSlidePress={handleSlidePress} />
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroPromoCard}
            onPress={() => navigation.navigate('CategoriesTab')}
          >
            <View style={styles.heroPromoLeft}>
              <Text style={styles.heroPromoTitle}>WHOLESALE PRICES.{"\n"}NOW LIVE.</Text>
              <Text style={styles.heroPromoSubtitle}>On Wires, Plywood, Cement & More</Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Shop Now</Text>
              </View>
            </View>
            <View style={styles.heroPromoRight}>
              {/* Overlay collage of materials */}
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=250',
                }}
                style={styles.heroPromoImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}

        {/* 4. REAL BACKEND PRODUCT CATEGORIES GRID (Max 5 Rows) */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Browse Categories</Text>
          <Text style={styles.categorySubtitle}>Fetched directly from backend</Text>
        </View>

        {categoriesLoading ? (
          <View style={styles.loadingCategories}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : displayCategories.length === 0 ? (
          <View style={styles.emptyCategories}>
            <Text style={styles.emptyCategoriesText}>No categories loaded from database</Text>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {displayCategories.map((category) => {
              const mappedDetails = getCategoryStyles(category.name);
              const numColumns = SCREEN_WIDTH > 600 ? 6 : 4;
              const cardWidth = `${Math.floor(100 / numColumns) - 3}%` as any;
              return (
                <TouchableOpacity
                  key={category.id}
                  activeOpacity={0.7}
                  style={[styles.categoryCard, { width: cardWidth }]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: mappedDetails.bgColor }]}>
                    <Image
                      source={{ uri: category.image || mappedDetails.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 5. DYNAMIC SLIDESHOW SECTION (Just below Category Grid) */}
        {featuredData?.data && featuredData.data.length > 0 && (
          <ProductSlideshow
            products={featuredData.data}
            onProductPress={handleProductPress}
          />
        )}

        {/* 6. BEST PRICES PRODUCT SECTION */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Best prices on Wires, Plywood</Text>
            <Text style={styles.sectionSubtitle}>Wholesale Prices. Now Live.</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('CategoriesTab')}
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {featuredLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalProductScroll}
          >
            {featuredData?.data?.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onPress={handleProductPress}
              />
            ))}
          </ScrollView>
        )}

        {/* 7. AASHIYANA QUALITY GUARANTEE SEAL BANNER */}
        <View style={styles.guaranteeBanner}>
          <View style={styles.guaranteeLogoContainer}>
            <MaterialCommunityIcons name="check-decagram" size={44} color="#1E1E1E" />
            <Text style={styles.guaranteeLogoText}>AASHIYANA{"\n"}GUARANTEE</Text>
          </View>
          <View style={styles.guaranteeDivider} />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>100% Original Materials</Text>
            <Text style={styles.guaranteeDesc}>
              Verify product authenticity instantly using official manufacturer apps. Direct from brand warehouses.
            </Text>
            <View style={styles.brandRow}>
              <Text style={styles.brandTag}>CenturyPly</Text>
              <Text style={styles.brandTag}>Polycab</Text>
              <Text style={styles.brandTag}>Havells</Text>
              <Text style={styles.brandTag}>Ultratech</Text>
            </View>
          </View>
        </View>

        {/* 8. RECENTLY VIEWED SECTION */}
        {recentlyViewed.length > 0 && (
          <View style={styles.recentlyViewedSection}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm }]}>
              Recently Viewed Materials
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductScroll}
            >
              {recentlyViewed.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  onPress={handleProductPress}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* 9. ADDRESS SELECTOR BOTTOM SHEET MODAL */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setAddressModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {savedAddresses.length === 0 ? (
              <View style={styles.emptyAddressContainer}>
                <MaterialCommunityIcons name="map-marker-off-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyAddressText}>No saved addresses found</Text>
                <TouchableOpacity
                  style={styles.addAddressBtn}
                  onPress={() => {
                    setAddressModalVisible(false);
                    navigation.navigate('ProfileTab');
                  }}
                >
                  <Text style={styles.addAddressBtnText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.addressListScroll} showsVerticalScrollIndicator={false}>
                {savedAddresses.map((addr: any) => (
                  <TouchableOpacity
                    key={addr.id || addr._id}
                    activeOpacity={0.7}
                    style={[
                      styles.addressCard,
                      (selectedAddress?.id || selectedAddress?._id) === (addr.id || addr._id) && styles.addressCardActive,
                    ]}
                    onPress={() => {
                      setSelectedAddress(addr);
                      setAddressModalVisible(false);
                    }}
                  >
                    <View style={styles.addressLabelRow}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      {addr.isDefault && <Text style={styles.defaultTag}>Default</Text>}
                    </View>
                    <Text style={styles.addressReceiver}>{addr.receiverName}</Text>
                    <Text style={styles.addressLine} numberOfLines={2}>
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.postalCode}
                    </Text>
                    <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.manageAddressBtn}
                  onPress={() => {
                    setAddressModalVisible(false);
                    navigation.navigate('ProfileTab');
                  }}
                >
                  <MaterialCommunityIcons name="cog-outline" size={20} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
                  <Text style={styles.manageAddressText}>Manage Addresses in Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  headerBar: {
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
  deliverySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.5,
  },
  deliveryTimeBadge: {
    backgroundColor: '#22C55E', // Blinkit green
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTimeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10.5,
    textAlign: 'center',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliverToLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  pincodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 2,
  },
  logoContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 0.3,
  },
  headerIconBtn: {
    padding: 6,
    marginLeft: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#22C55E', // Green badge
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary, // Premium Deep Slate Gray/Black
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
  },
  cashbackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashbackBold: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cashbackText: {
    color: '#F9FAFB',
    fontSize: 10,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  cashbackHighlight: {
    color: COLORS.primary, // yellow highlight
    fontWeight: 'bold',
  },
  cashbackBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  cashbackBadgeText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  heroPromoCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Soft green tint
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  heroPromoLeft: {
    flex: 0.65,
    justifyContent: 'center',
  },
  heroPromoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064E3B',
    lineHeight: 22,
  },
  heroPromoSubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 4,
    fontWeight: '500',
  },
  shopNowBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroPromoRight: {
    flex: 0.35,
    alignItems: 'flex-end',
  },
  heroPromoImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  categoryHeader: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categorySubtitle: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  loadingCategories: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCategories: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyCategoriesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '22%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryImage: {
    width: '78%',
    height: '78%',
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 12.5,
  },
  slideshowContainer: {
    marginVertical: SPACING.md,
    backgroundColor: '#F8FAFC',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  slideshowTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slideCard: {
    width: SCREEN_WIDTH - SPACING.md * 2,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    height: 140,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  slideLeft: {
    flex: 0.65,
    justifyContent: 'space-between',
    height: '100%',
  },
  slideBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  slideBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  slideName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  slidePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  slidePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  slideMrp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  slideBulkText: {
    fontSize: 9.5,
    color: '#0284C7',
    fontWeight: '500',
    marginTop: 2,
  },
  slideRight: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImage: {
    width: '90%',
    height: '90%',
  },
  slideFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  slideshowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  seeAllBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  seeAllText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  horizontalProductScroll: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guaranteeBanner: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // light gray
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    padding: SPACING.md,
    alignItems: 'center',
  },
  guaranteeLogoContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeLogoText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 4,
  },
  guaranteeDivider: {
    width: 1.2,
    height: '80%',
    backgroundColor: '#D1D5DB',
    marginHorizontal: SPACING.md,
  },
  guaranteeContent: {
    flex: 0.7,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  guaranteeDesc: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
  brandRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  brandTag: {
    fontSize: 8.5,
    backgroundColor: '#E5E7EB',
    color: COLORS.textPrimary,
    fontWeight: '600',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  recentlyViewedSection: {
    marginTop: SPACING.md,
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
    maxHeight: '60%',
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
  emptyAddressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyAddressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 16,
  },
  addAddressBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAddressBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  addressListScroll: {
    marginBottom: 12,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
  },
  addressCardActive: {
    borderColor: '#22C55E',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  addressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#047857',
  },
  defaultTag: {
    fontSize: 9,
    backgroundColor: '#DEF7EC',
    color: '#03543F',
    fontWeight: 'bold',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  addressReceiver: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  addressPhone: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  manageAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryDark,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 6,
  },
  manageAddressText: {
    fontSize: 12.5,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  bannerContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerSlideCard: {
    width: SCREEN_WIDTH - SPACING.md * 2,
    aspectRatio: 21 / 9,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
  },
  bannerTapIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bannerTapText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default HomeScreen;
