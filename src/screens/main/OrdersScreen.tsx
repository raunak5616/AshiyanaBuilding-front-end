import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGetOrderHistoryQuery } from '../../features/orders/orderApi';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ProductPrice } from '../../components/products/ProductPrice';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const OrdersScreen = ({ navigation }: any) => {
  const { data: ordersData, isLoading, error, refetch, isFetching } = useGetOrderHistoryQuery();
  
  const orders = ordersData?.data || [];

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

  const getStatusColor = (status: string, paymentStatus: string, paymentMethod: string) => {
    if (paymentMethod === 'online' && paymentStatus === 'failed') {
      return { bg: '#FEE2E2', text: '#B91C1C', label: 'PAYMENT FAILED' }; // Red
    }
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#B45309', label: 'PENDING APPROVAL' }; // Amber
      case 'approved':
        return { bg: '#E0F2FE', text: '#0369A1', label: 'APPROVED (WILL SHIP SOON)' }; // Sky blue
      case 'dispatched':
        return { bg: '#FFEDD5', text: '#C2410C', label: 'OUT FOR DELIVERY (REACH SOON)' }; // Orange
      case 'delivered':
        return { bg: '#D1FAE5', text: '#047857', label: 'DELIVERED' }; // Emerald green
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'CANCELLED' }; // Red
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status.toUpperCase() }; // Grey
    }
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Unable to load order history. Please check your internet connection."
        onRetry={handleRefresh}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyWrapper}>
        <EmptyState
          title="No Orders Yet"
          subtitle="You haven't placed any orders yet. Add items to your cart and place an order to see it here."
          icon="clipboard-text-outline"
          buttonLabel="Start Shopping"
          onPress={() => navigation.navigate('HomeTab')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Order History</Text>
        <Text style={styles.subtitle}>{orders.length} orders registered</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={isFetching}
        renderItem={({ item }) => {
          const colors = getStatusColor(item.status, item.paymentStatus, item.paymentMethod);
          const totalItems = item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.orderCard}
              onPress={() => handleOrderPress(item.id || item._id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeftRow}>
                  <MaterialCommunityIcons name="receipt-text-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {colors.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>

              <View style={styles.cardInfoRow}>
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons name="cube-outline" size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.infoBadgeText}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons 
                    name={item.paymentMethod === 'online' ? 'credit-card-outline' : 'cash'} 
                    size={13} 
                    color={COLORS.textSecondary} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={styles.infoBadgeText}>
                    {item.paymentMethod === 'online' ? 'Online' : 'COD'} • {item.paymentStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <ProductPrice priceInPaise={item.grandTotal} style={styles.totalAmount} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    paddingBottom: SPACING.xl,
  },
  orderCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  orderDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  cardInfoRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
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
export default OrdersScreen;
