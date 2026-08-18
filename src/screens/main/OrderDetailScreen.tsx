import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetOrderDetailsQuery, useCancelOrderMutation } from '../../features/orders/orderApi';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ProductPrice } from '../../components/products/ProductPrice';
import { ErrorState } from '../../components/common/ErrorState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import * as WebBrowser from 'expo-web-browser';

export const OrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;

  const { data: orderData, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const order = orderData?.data;

  const handleRefresh = () => {
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'approved':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'dispatched':
        return { bg: '#FFEDD5', text: '#C2410C' }; // Orange
      case 'delivered':
        return { bg: '#D1FAE5', text: '#047857' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId).unwrap();
              Alert.alert('Success', 'Your order has been cancelled.');
            } catch (err: any) {
              console.error('Failed to cancel order:', err);
              const errMsg = err?.data?.message || 'Failed to cancel the order. Please try again.';
              Alert.alert('Cancellation Failed', errMsg);
            }
          },
        },
      ]
    );
  };

  const handlePayNow = async () => {
    if (!order?.paymentUrl) {
      Alert.alert('Error', 'Payment URL is missing.');
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(order.paymentUrl);
      refetch();
    } catch (err) {
      console.error('Failed to open payment gateway:', err);
      Alert.alert('Error', 'Could not open the payment gateway.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <ErrorState
        message="Unable to load order details. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  const getStatusDetails = (status: string, paymentStatus: string, paymentMethod: string) => {
    if (paymentMethod === 'online' && paymentStatus === 'failed') {
      return {
        title: 'Payment Failed',
        desc: 'Online payment failed or was cancelled.',
        badgeText: 'PAYMENT FAILED',
        color: '#B91C1C', // Red
        bg: '#FEE2E2',
        stepIndex: -1,
      };
    }

    switch (status) {
      case 'pending':
        return {
          title: 'Pending Approval',
          desc: 'Waiting for shop acceptance',
          badgeText: 'PENDING APPROVAL',
          color: '#B45309', // Amber
          bg: '#FEF3C7',
          stepIndex: 0,
        };
      case 'approved':
        return {
          title: 'Order Approved',
          desc: 'Order will ship soon within an hour',
          badgeText: 'APPROVED (WILL SHIP SOON)',
          color: '#0369A1', // Sky blue
          bg: '#E0F2FE',
          stepIndex: 1,
        };
      case 'dispatched':
        return {
          title: 'Out for Delivery',
          desc: 'Out for delivery. Order will reach you soon!',
          badgeText: 'DISPATCHED (OUT FOR DELIVERY)',
          color: '#C2410C', // Orange
          bg: '#FFEDD5',
          stepIndex: 2,
        };
      case 'delivered':
        return {
          title: 'Delivered',
          desc: 'Delivered successfully. Thank you!',
          badgeText: 'DELIVERED',
          color: '#047857', // Emerald green
          bg: '#D1FAE5',
          stepIndex: 3,
        };
      case 'cancelled':
        return {
          title: 'Cancelled',
          desc: 'This order was cancelled.',
          badgeText: 'CANCELLED',
          color: '#B91C1C', // Red
          bg: '#FEE2E2',
          stepIndex: -1,
        };
      default:
        return {
          title: status.toUpperCase(),
          desc: '',
          badgeText: status.toUpperCase(),
          color: '#4B5563',
          bg: '#F3F4F6',
          stepIndex: -1,
        };
    }
  };

  const statusDetails = getStatusDetails(order.status, order.paymentStatus, order.paymentMethod);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.secondary} />
          <Text style={styles.backText} numberOfLines={1}>Order Details</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Status Header Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
              <Text style={[styles.statusText, { color: statusDetails.color }]}>
                {statusDetails.badgeText}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>Placed on: {formatDate(order.createdAt)}</Text>
          {statusDetails.desc ? (
            <Text style={[styles.statusDescText, { color: statusDetails.color }]}>
              {statusDetails.desc}
            </Text>
          ) : null}

          {/* Pay Now Button for unpaid online orders */}
          {order.paymentMethod === 'online' && (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') && order.paymentUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.retryPaymentBtn}
              onPress={handlePayNow}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={18} color="#FFFFFF" />
              <Text style={styles.retryPaymentBtnText}>Complete Payment</Text>
            </TouchableOpacity>
          ) : null}

          {/* Dynamic Progress Timeline */}
          {statusDetails.stepIndex !== -1 && (
            <View style={styles.timelineContainer}>
              <View style={styles.timelineProgressLineBackground} />
              <View 
                style={[
                  styles.timelineProgressLineActive, 
                  { width: `${(statusDetails.stepIndex / 3) * 76 + 12}%` }
                ]} 
              />
              
              <View style={styles.timelineStepsRow}>
                {/* Step 1: Placed */}
                <View style={styles.timelineStep}>
                  <View style={[
                    styles.timelineDot,
                    statusDetails.stepIndex >= 0 ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    <MaterialCommunityIcons 
                      name="check" 
                      size={12} 
                      color={statusDetails.stepIndex >= 0 ? '#FFFFFF' : COLORS.textSecondary} 
                    />
                  </View>
                  <Text style={[
                    styles.timelineStepLabel,
                    statusDetails.stepIndex >= 0 ? styles.timelineStepLabelActive : null
                  ]}>Placed</Text>
                </View>

                {/* Step 2: Approved */}
                <View style={styles.timelineStep}>
                  <View style={[
                    styles.timelineDot,
                    statusDetails.stepIndex >= 1 ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    {statusDetails.stepIndex >= 1 ? (
                      <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                    ) : (
                      <View style={styles.timelineDotInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.timelineStepLabel,
                    statusDetails.stepIndex >= 1 ? styles.timelineStepLabelActive : null
                  ]}>Accepted</Text>
                </View>

                {/* Step 3: Dispatched */}
                <View style={styles.timelineStep}>
                  <View style={[
                    styles.timelineDot,
                    statusDetails.stepIndex >= 2 ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    {statusDetails.stepIndex >= 2 ? (
                      <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                    ) : (
                      <View style={styles.timelineDotInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.timelineStepLabel,
                    statusDetails.stepIndex >= 2 ? styles.timelineStepLabelActive : null
                  ]}>Dispatched</Text>
                </View>

                {/* Step 4: Delivered */}
                <View style={styles.timelineStep}>
                  <View style={[
                    styles.timelineDot,
                    statusDetails.stepIndex >= 3 ? styles.timelineDotActive : styles.timelineDotInactive
                  ]}>
                    {statusDetails.stepIndex >= 3 ? (
                      <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                    ) : (
                      <View style={styles.timelineDotInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.timelineStepLabel,
                    statusDetails.stepIndex >= 3 ? styles.timelineStepLabelActive : null
                  ]}>Delivered</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Details</Text>
          <View style={styles.detailsBox}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoValue}>{order.shippingAddress.receiverName}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoValue}>{order.shippingAddress.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoValue}>
                {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered ({totalItems})</Text>
          <View style={styles.itemsBox}>
            {order.items.map((item, index) => (
              <View key={item.productId?._id || item.productId?.id || index} style={styles.itemRow}>
                <View style={styles.itemMainCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productId?.name || 'Deleted Product'}
                  </Text>
                  <Text style={styles.itemSkuQuantity}>
                    QTY: {item.quantity}  •  <ProductPrice priceInPaise={item.unitPrice} style={styles.itemUnitPrice} /> / unit
                  </Text>
                </View>
                <View style={styles.itemTotalCol}>
                  <ProductPrice priceInPaise={item.unitPrice * item.quantity} style={styles.itemTotal} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Info</Text>
          <View style={styles.detailsBox}>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentLabel}>Method</Text>
              <Text style={styles.paymentVal}>
                {order.paymentMethod === 'cash' ? 'Cash on Delivery (COD)' : 'Online Payment'}
              </Text>
            </View>
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentLabel}>Status</Text>
              <Text style={[styles.paymentVal, { fontWeight: 'bold', color: order.paymentStatus === 'paid' ? '#047857' : '#B45309' }]}>
                {order.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Pricing breakdown summary */}
        <View style={styles.section}>
          <View style={styles.pricingBox}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <ProductPrice priceInPaise={order.subtotal} style={styles.priceVal} />
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>GST (18%)</Text>
              <ProductPrice priceInPaise={order.tax} style={styles.priceVal} />
            </View>
            <View style={styles.cardDivider} />
            <View style={[styles.priceRow, { marginBottom: 0 }]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <ProductPrice priceInPaise={order.grandTotal} style={styles.grandTotalVal} />
            </View>
          </View>
        </View>

        {/* Cancel Button (ONLY for pending orders) */}
        {order.status === 'pending' && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.cancelBtn}
            onPress={handleCancelOrder}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={20} color={COLORS.background} />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <LoadingOverlay visible={isCancelling} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  backText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    fontSize: 16,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  itemsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  itemMainCol: {
    flex: 0.7,
  },
  itemName: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  itemSkuQuantity: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemUnitPrice: {
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  itemTotalCol: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  paymentLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  paymentVal: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  notesBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  notesText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  pricingBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  priceVal: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  grandTotalLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  grandTotalVal: {
    fontSize: 18,
    color: COLORS.primaryDark,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginTop: SPACING.md,
  },
  cancelBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  statusDescText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginTop: SPACING.xs,
    fontSize: 12.5,
  },
  timelineContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
    position: 'relative',
    height: 48,
    justifyContent: 'center',
  },
  timelineProgressLineBackground: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#E5E7EB',
    top: 14,
  },
  timelineProgressLineActive: {
    position: 'absolute',
    left: '10%',
    height: 3,
    backgroundColor: '#22C55E',
    top: 14,
  },
  timelineStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  timelineStep: {
    alignItems: 'center',
    width: '20%',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: COLORS.surface,
  },
  timelineDotActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineDotInactive: {
    borderColor: '#D1D5DB',
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  timelineStepLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  timelineStepLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  retryPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary || '#f59e0b',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginTop: SPACING.md,
    shadowColor: COLORS.primary || '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  retryPaymentBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
});
export default OrderDetailScreen;
