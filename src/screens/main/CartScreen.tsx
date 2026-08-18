import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useGetCartQuery, useAddToCartMutation, useRemoveFromCartMutation } from '../../features/cart/cartApi';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ProductPrice } from '../../components/products/ProductPrice';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const CartScreen = ({ navigation }: any) => {
  const { data: cartData, isLoading, error, refetch, isFetching } = useGetCartQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
  const [includeUnloading, setIncludeUnloading] = useState(false);

  const cart = cartData?.data;
  const cartItems = cart?.items || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleIncrement = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
    } catch (err) {
      console.error('Failed to increase quantity', err);
    }
  };

  const handleDecrement = async (productId: string, currentQuantity: number) => {
    try {
      // If quantity is 1, decrement removes the item entirely
      await removeFromCart({ productId, quantity: 1 }).unwrap();
    } catch (err) {
      console.error('Failed to decrease quantity', err);
    }
  };

  const handleRemoveAll = async (productId: string) => {
    try {
      await removeFromCart({ productId }).unwrap(); // passing only productId removes it completely
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  // Calculations
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.productId?.sellingPrice || 0) * item.quantity, 0);
  };

  const calculateTax = (subtotal: number) => {
    // 18% GST standard building materials tax rate
    return Math.round(subtotal * 0.18);
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const unloadingCharge = 30000; // ₹300 in paise
  const total = subtotal + tax + (includeUnloading ? unloadingCharge : 0);

  const isUpdating = isAdding || isRemoving || isFetching;

  if (isLoading && cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Unable to load your shopping cart. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <EmptyState
          title="Your Cart is Empty"
          subtitle="Explore our catalog of premium building materials and add them to your cart."
          icon="cart-outline"
          buttonLabel="Browse Catalog"
          onPress={() => navigation.navigate('HomeTab')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.subtitle}>{cartItems.length} items selected</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id || item.productId?.id || item.productId?._id}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={isFetching}
        renderItem={({ item }) => {
          const product = item.productId;
          if (!product) return null;
          const imageUrl = product.images?.[0]?.url;

          return (
            <View style={styles.itemCard}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={styles.itemImageFallback}>
                  <MaterialCommunityIcons name="tools" size={24} color={COLORS.textSecondary} />
                </View>
              )}

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.itemSku}>SKU: {product.sku}</Text>
                <ProductPrice priceInPaise={product.sellingPrice} style={styles.itemPrice} />

                <View style={styles.quantityRow}>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      disabled={isUpdating}
                      style={[styles.counterBtn, isUpdating && styles.disabledBtn]}
                      onPress={() => handleDecrement(product.id || product._id, item.quantity)}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.counterVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      disabled={isUpdating}
                      style={[styles.counterBtn, isUpdating && styles.disabledBtn]}
                      onPress={() => handleIncrement(product.id || product._id)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.removeBtn}
                    onPress={() => handleRemoveAll(product.id || product._id)}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Unloading Service Toggle Card */}
      <View style={styles.unloadingCard}>
        <View style={styles.unloadingInfo}>
          <MaterialCommunityIcons name="dolly" size={24} color={COLORS.primary} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.unloadingTitle}>Unloading Service</Text>
            <Text style={styles.unloadingDesc}>Get professional labor to unload materials at site</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.unloadingAddBtn, includeUnloading && styles.unloadingAddBtnActive]}
          onPress={() => setIncludeUnloading(!includeUnloading)}
        >
          <Text style={[styles.unloadingAddBtnText, includeUnloading && styles.unloadingAddBtnTextActive]}>
            {includeUnloading ? 'Added (+₹300)' : 'Add (₹300)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <ProductPrice priceInPaise={subtotal} style={styles.summaryValue} />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST (18%)</Text>
          <ProductPrice priceInPaise={tax} style={styles.summaryValue} />
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Handling Charge</Text>
          <Text style={styles.freeChargeText}>FREE</Text>
        </View>
        {includeUnloading && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Unloading Service</Text>
            <ProductPrice priceInPaise={unloadingCharge} style={styles.summaryValue} />
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <ProductPrice priceInPaise={total} style={styles.totalValue} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout', { includeUnloading })}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.background} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingBottom: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  itemImageFallback: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemName: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  itemSku: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  counterBtn: {
    padding: 6,
    paddingHorizontal: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  counterVal: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.xs,
  },
  removeBtn: {
    padding: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  unloadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  unloadingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: SPACING.xs,
  },
  unloadingTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  unloadingDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unloadingAddBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  unloadingAddBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unloadingAddBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  unloadingAddBtnTextActive: {
    color: COLORS.secondary,
  },
  freeChargeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
  },
});
export default CartScreen;
