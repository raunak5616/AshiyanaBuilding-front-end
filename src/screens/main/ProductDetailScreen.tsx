import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Platform, ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addProductToRecentlyViewed } from '../../store/recentlyViewedSlice';
import { useGetProductDetailsFromDetailsQuery } from '../../features/products/productDetailsApi';
import { useAddToCartMutation } from '../../features/cart/cartApi';
import { ImageCarousel } from '../../components/products/ImageCarousel';
import { ImageViewerModal } from '../../components/products/ImageViewerModal';
import { ProductInfoCard } from '../../components/products/ProductInfoCard';
import { SpecificationList } from '../../components/products/SpecificationList';
import { RelatedProducts } from '../../components/products/RelatedProducts';
import { ShareButton } from '../../components/common/ShareButton';
import { SkeletonProductDetails } from '../../components/products/SkeletonProductDetails';
import { ErrorState } from '../../components/common/ErrorState';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../features/products/productApi';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const { productId } = route.params;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Fetch product detail info
  const {
    data: productData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetProductDetailsFromDetailsQuery(productId);

  const product = productData?.data;

  // Add to recently viewed on load
  useEffect(() => {
    if (product) {
      dispatch(addProductToRecentlyViewed(product));
    }
  }, [product, dispatch]);

  // Refetch product details when screen comes into focus to reflect updates from admin immediately
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart({ productId: product.id || product._id, quantity }).unwrap();
      Alert.alert('Success', `${product.name} (x${quantity}) added to cart.`);
    } catch (err) {
      console.error('Failed to add to cart', err);
      Alert.alert('Error', 'Could not add item to cart. Please try again.');
    }
  };

  const handleProductPress = (relatedProduct: Product) => {
    // Navigate to same screen with new product id
    navigation.push('ProductDetails', { productId: relatedProduct.id || relatedProduct._id });
  };

  if (isLoading) {
    return <SkeletonProductDetails />;
  }

  if (error || !product) {
    return (
      <ErrorState
        message="Unable to load product details. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerActions}>
          <ShareButton product={product} style={styles.headerAction} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Product Images */}
        <ImageCarousel
          images={product.images || []}
          onPressImage={(index) => {
            setActiveImageIndex(index);
            setModalVisible(true);
          }}
        />

        {/* Product Info Block */}
        <ProductInfoCard product={product} />

        {/* Description Section */}
        {product.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}

        {/* Specifications List Table */}
        <SpecificationList product={product} />

        {/* Related Products Carousel */}
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id || product._id}
          onProductPress={handleProductPress}
        />
      </ScrollView>

      {/* Full-screen Image Modal overlay */}
      {product.images && product.images.length > 0 && (
        <ImageViewerModal
          visible={modalVisible}
          imageUrl={product.images[activeImageIndex]?.url}
          onClose={() => setModalVisible(false)}
        />
      )}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <MaterialCommunityIcons name="minus" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isAddingToCart}
          style={[styles.addToCartBtn, isAddingToCart && styles.disabledBtn]}
          onPress={handleAddToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <>
              <MaterialCommunityIcons name="cart-plus" size={20} color={COLORS.background} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: SPACING.sm,
    backgroundColor: 'transparent',
    padding: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  scroll: {
    paddingBottom: SPACING.xl,
  },
  descriptionSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  qtyBtn: {
    padding: 10,
  },
  qtyValue: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginLeft: SPACING.md,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  addToCartText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: 8,
  },
});
export default ProductDetailScreen;
