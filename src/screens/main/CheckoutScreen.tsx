import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput as RNTextInput, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetCartQuery, useSyncCartMutation } from '../../features/cart/cartApi';
import { useListAddressesQuery, useCreateAddressMutation } from '../../features/profile/profileApi';
import { usePlaceOrderMutation } from '../../features/orders/orderApi';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS } from '../../theme/radius';
import { ProductPrice } from '../../components/products/ProductPrice';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField } from '../../components/inputs/InputField';

// Validation schema for custom shipping address
const customAddressSchema = z.object({
  receiverName: z.string().trim().min(1, 'Receiver name is required'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits'),
  addressLine: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
});

export const CheckoutScreen = ({ navigation }: any) => {
  const { data: cartData } = useGetCartQuery();
  const { data: addressData, isLoading: isAddressesLoading } = useListAddressesQuery();
  const [createAddress] = useCreateAddressMutation();
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [syncCart] = useSyncCartMutation();

  const cart = cartData?.data;
  const cartItems = cart?.items || [];
  const savedAddresses = addressData?.data || [];

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'custom' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [notes, setNotes] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form for custom address
  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: zodResolver(customAddressSchema),
    defaultValues: {
      receiverName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  // Set default address on load
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id || defaultAddr._id);
      } else {
        setSelectedAddressId(savedAddresses[0].id || savedAddresses[0]._id);
      }
    } else {
      setSelectedAddressId('custom');
    }
  }, [savedAddresses]);

  // Calculations
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.productId?.sellingPrice || 0) * item.quantity, 0);
  };
  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handlePlaceOrderSubmit = async (customAddressData?: any) => {
    try {
      let shippingAddress: any;

      if (selectedAddressId === 'custom') {
        shippingAddress = {
          receiverName: customAddressData.receiverName,
          phone: customAddressData.phone,
          addressLine: customAddressData.addressLine,
          city: customAddressData.city,
          state: customAddressData.state,
          postalCode: customAddressData.postalCode,
          country: 'India',
        };

        // If checkbox is checked, save this address to their profile
        if (saveToProfile) {
          try {
            await createAddress({
              label: 'Shipping',
              ...shippingAddress,
              isDefault: savedAddresses.length === 0, // set default if it's their first saved address
            }).unwrap();
          } catch (e) {
            console.error('Failed to auto-save custom address to profile', e);
          }
        }
      } else {
        const selected = savedAddresses.find((a) => (a.id || a._id) === selectedAddressId);
        if (!selected) {
          Alert.alert('Error', 'Please select a valid shipping address.');
          return;
        }
        shippingAddress = {
          receiverName: selected.receiverName,
          phone: selected.phone,
          addressLine: selected.addressLine,
          city: selected.city,
          state: selected.state,
          postalCode: selected.postalCode,
          country: selected.country || 'India',
        };
      }

      // 1. Submit order
      const itemsPayload = cartItems.map((item) => ({
        productId: item.productId.id || item.productId._id,
        quantity: item.quantity,
      }));

      const response = await placeOrder({
        items: itemsPayload,
        shippingAddress,
        paymentMethod,
        notes: notes.trim() || undefined,
      }).unwrap();

      const orderNumber = response.data.orderNumber;
      const paymentUrl = response.data.paymentUrl;
      setCreatedOrderNumber(orderNumber);

      // 2. Clear remote cart
      await syncCart({ items: [] }).unwrap();

      // 3. Handle online payment or cash success modal
      if (paymentMethod === 'online' && paymentUrl) {
        setOrderSuccessModal(false);
        // Open the Razorpay payment window
        await WebBrowser.openBrowserAsync(paymentUrl);
        // Navigate directly to the orders list inside Profile
        navigation.navigate('OrdersList');
      } else {
        setOrderSuccessModal(true);
      }
    } catch (err: any) {
      console.error('Order placement error:', err);
      const errMsg = err?.data?.message || 'Something went wrong while placing your order. Please check your stock or connection.';
      Alert.alert('Order Failed', errMsg);
    }
  };

  const handleConfirmPress = () => {
    if (selectedAddressId === 'custom') {
      handleSubmit(handlePlaceOrderSubmit)();
    } else {
      handlePlaceOrderSubmit();
    }
  };

  const handleSuccessClose = () => {
    setOrderSuccessModal(false);
    // Navigate to Orders List inside Profile Navigator
    navigation.navigate('OrdersList');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.secondary} />
          <Text style={styles.backText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Order Items summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="receipt" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Order Invoice Summary</Text>
          </View>
          
          <View style={styles.summaryBox}>
            {cartItems.map((item) => (
              <View key={item._id || item.productId?.id || item.productId?._id} style={styles.summaryItemRow}>
                {item.productId?.images?.[0]?.url ? (
                  <Image
                    source={{ uri: item.productId.images[0].url }}
                    style={styles.summaryItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.summaryItemImageFallback}>
                    <MaterialCommunityIcons name="tools" size={16} color={COLORS.textSecondary} />
                  </View>
                )}
                
                <View style={styles.summaryItemInfo}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.productId?.name}
                  </Text>
                  <Text style={styles.summaryItemQty}>Qty: {item.quantity}</Text>
                </View>
                <ProductPrice priceInPaise={(item.productId?.sellingPrice || 0) * item.quantity} style={styles.summaryItemPrice} />
              </View>
            ))}

            <View style={styles.receiptDividerDashed} />

            <View style={styles.receiptFeeRow}>
              <Text style={styles.receiptFeeLabel}>Subtotal</Text>
              <ProductPrice priceInPaise={subtotal} style={styles.receiptFeeValue} />
            </View>
            <View style={styles.receiptFeeRow}>
              <Text style={styles.receiptFeeLabel}>Estimated GST (18%)</Text>
              <ProductPrice priceInPaise={tax} style={styles.receiptFeeValue} />
            </View>
          </View>
        </View>

        {/* Shipping Address section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          
          {savedAddresses.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addressScroll}
            >
              {savedAddresses.map((addr) => {
                const isActive = selectedAddressId === (addr.id || addr._id);
                return (
                  <TouchableOpacity
                    key={addr.id || addr._id}
                    activeOpacity={0.8}
                    style={[
                      styles.addressCard,
                      isActive && styles.addressCardActive,
                    ]}
                    onPress={() => setSelectedAddressId(addr.id || addr._id)}
                  >
                    <View style={styles.addressLabelRow}>
                      <View style={styles.addressLabelWrapper}>
                        <MaterialCommunityIcons 
                          name={addr.label?.toLowerCase() === 'work' ? 'briefcase-outline' : 'home-outline'} 
                          size={13} 
                          color={isActive ? COLORS.primary : COLORS.textSecondary} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.addressLabel, isActive && styles.addressLabelActive]}>
                          {addr.label}
                        </Text>
                      </View>
                      {isActive && (
                        <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.primary} />
                      )}
                    </View>
                    <Text style={styles.addressName} numberOfLines={1}>{addr.receiverName}</Text>
                    <Text style={styles.addressPhone}>{addr.phone}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {addr.addressLine}, {addr.city}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.addressCard,
                  selectedAddressId === 'custom' && styles.addressCardActive,
                  styles.newAddressCard,
                ]}
                onPress={() => setSelectedAddressId('custom')}
              >
                <View style={styles.plusIconWrapper}>
                  <MaterialCommunityIcons name="plus" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.newAddressText}>Custom Address</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Custom Address Input Form */}
          {selectedAddressId === 'custom' && (
            <View style={styles.customForm}>
              <InputField name="receiverName" control={control} label="Receiver Full Name" placeholder="e.g. John Doe" />
              <InputField name="phone" control={control} label="Phone Number" placeholder="e.g. 9876543210" keyboardType="phone-pad" />
              <InputField name="addressLine" control={control} label="Street Address" placeholder="e.g. 12, Link Road" />
              
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <InputField name="city" control={control} label="City" placeholder="Ranchi" />
                </View>
                <View style={styles.formCol}>
                  <InputField name="state" control={control} label="State" placeholder="Jharkhand" />
                </View>
              </View>

              <InputField name="postalCode" control={control} label="Postal Pincode" placeholder="e.g. 834001" keyboardType="numeric" />

              {/* Checkbox to save address */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.checkboxRow}
                onPress={() => setSaveToProfile(!saveToProfile)}
              >
                <MaterialCommunityIcons
                  name={saveToProfile ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>Save this address to my profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Method section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'cash' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={[styles.radioOutline, paymentMethod === 'cash' && styles.radioOutlineActive]}>
              {paymentMethod === 'cash' && <View style={styles.radioDot} />}
            </View>
            <View style={styles.paymentTextCol}>
              <Text style={styles.paymentName}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentDesc}>Pay in cash upon materials arrival at site.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.paymentOption,
              paymentMethod === 'online' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('online')}
          >
            <View style={[styles.radioOutline, paymentMethod === 'online' && styles.radioOutlineActive]}>
              {paymentMethod === 'online' && <View style={styles.radioDot} />}
            </View>
            <View style={styles.paymentTextCol}>
              <Text style={styles.paymentName}>Online Payment</Text>
              <Text style={styles.paymentDesc}>Instant checkout with Credit/Debit cards, UPI or Netbanking.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="notebook-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          </View>
          <RNTextInput
            style={styles.notesInput}
            multiline
            numberOfLines={3}
            placeholder="Add delivery instructions, site entry directions, or any other preferences..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </ScrollView>

      {/* Place Order bottom footer */}
      <View style={styles.footer}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>GRAND TOTAL</Text>
          <ProductPrice priceInPaise={total} style={styles.pricingValue} />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.orderBtn}
          onPress={handleConfirmPress}
        >
          <Text style={styles.orderText}>Confirm & Place Order</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={orderSuccessModal} transparent animationType="slide">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#22C55E" />
            </View>
            
            <Text style={styles.successTitle}>Order Registered!</Text>
            <Text style={styles.successDesc}>
              Your order request has been submitted to Aashiyana ERP successfully.
            </Text>

            {/* Ticket Box */}
            <View style={styles.successTicket}>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Order Number</Text>
                <Text style={styles.ticketValue}>{createdOrderNumber}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Payment Method</Text>
                <Text style={styles.ticketValue}>{paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Total Invoiced</Text>
                <ProductPrice priceInPaise={total} style={styles.ticketValuePrice} />
              </View>
            </View>

            <Text style={styles.successSub}>
              Our logistics team is currently processing the dispatch order list. We will update you here.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.successBtn}
              onPress={handleSuccessClose}
            >
              <Text style={styles.successBtnText}>View My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={isPlacingOrder} />
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
  },
  backText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontSize: 18,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryItemImage: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: '#F3F4F6',
  },
  summaryItemImageFallback: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryItemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  summaryItemName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryItemQty: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  summaryItemPrice: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  receiptDividerDashed: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.sm,
  },
  receiptFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptFeeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  receiptFeeValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  addressScroll: {
    paddingBottom: SPACING.xs,
  },
  addressCard: {
    width: 176,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  addressCardActive: {
    backgroundColor: 'rgba(244, 196, 48, 0.04)',
  },
  addressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  addressLabelActive: {
    color: COLORS.primary,
  },
  addressName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addressPhone: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  addressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 13,
  },
  newAddressCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    backgroundColor: COLORS.background,
  },
  plusIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 196, 48, 0.05)',
  },
  newAddressText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  customForm: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formCol: {
    flex: 0.48,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  checkboxLabel: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentOptionActive: {
    backgroundColor: 'rgba(244, 196, 48, 0.04)',
  },
  radioOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOutlineActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  paymentTextCol: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  paymentDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    textAlignVertical: 'top',
    color: COLORS.textPrimary,
    fontSize: 12.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricingRow: {
    flex: 0.45,
  },
  pricingLabel: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pricingValue: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 1,
  },
  orderBtn: {
    flex: 0.52,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  orderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconWrapper: {
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: SPACING.md,
  },
  successTicket: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ticketLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ticketValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  ticketValuePrice: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  successSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  successBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  successBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});

export default CheckoutScreen;
