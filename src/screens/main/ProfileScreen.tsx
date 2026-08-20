import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearCredentials, setCredentials } from '../../store/authSlice';
import { useLogoutMutation, useGetProfileQuery } from '../../features/auth/authApi';
import { apiSlice } from '../../api/apiSlice';
import {
  useUpdateProfileMutation,
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  SavedAddress,
} from '../../features/profile/profileApi';
import { secureStore } from '../../utils/secureStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { ROUTES } from '../../constants/routes';
import { InputField } from '../../components/inputs/InputField';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-paper';
import { googleMapsService, PlaceSuggestion } from '../../utils/googleMaps';

// Zod schemas for edit modals
const profileEditSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landmark: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
});

const addressFormSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  receiverName: z.string().trim().min(1, 'Receiver name is required'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits'),
  addressLine: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Pincode is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  landmark: z.string().trim().optional(),
});

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: profileData } = useGetProfileQuery();
  const walletBalance = profileData?.data?.walletBalance ?? user?.walletBalance ?? 0;

  // API mutations & queries
  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const { data: addressesData, isLoading: isAddressesLoading, refetch: refetchAddresses } = useListAddressesQuery();
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteAddressMutation();

  const savedAddresses = addressesData?.data || [];

  // Local state
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Custom states for new menu list items
  const [showSavedAddressesModal, setShowSavedAddressesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [policyModal, setPolicyModal] = useState<{ visible: boolean; type: 'shipping' | 'refund' | 'privacy' | 'terms' | null }>({ visible: false, type: null });
  const [reopenAddressesModal, setReopenAddressesModal] = useState(false);
  const [showWalletDetailsModal, setShowWalletDetailsModal] = useState(false);

  const openPolicyModal = (type: 'shipping' | 'refund' | 'privacy' | 'terms') => {
    setPolicyModal({ visible: true, type });
  };

  const handleOpenLink = async (url: string, fallbackUrl?: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert('Error', 'Unable to open this link.');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'An error occurred while opening the link.');
    }
  };

  const menuItems = [
    {
      id: 'orders',
      label: 'Order History',
      icon: 'file-clock-outline',
      action: () => navigation.navigate('OrdersList'),
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      icon: 'map-marker-account-outline',
      action: () => setShowSavedAddressesModal(true),
    },
    {
      id: 'support',
      label: 'Aashiyana Building Support',
      icon: 'headset',
      action: () => setShowSupportModal(true),
    },
    {
      id: 'shipping',
      label: 'Shipping Policy',
      icon: 'truck-check-outline',
      action: () => openPolicyModal('shipping'),
    },
    {
      id: 'refund',
      label: 'Refund Policy',
      icon: 'receipt-text-outline',
      action: () => openPolicyModal('refund'),
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: 'shield-check-outline',
      action: () => openPolicyModal('privacy'),
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: 'file-cog-outline',
      action: () => openPolicyModal('terms'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: 'logout',
      isLogout: true,
      action: () => handleLogout(),
    },
  ];

  // Profile Form
  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfileForm, setValue: setProfileValue } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      latitude: user?.latitude || undefined,
      longitude: user?.longitude || undefined,
      landmark: user?.landmark || '',
      addressLine: user?.addressLine || '',
      city: user?.city || '',
      state: user?.state || '',
      postalCode: user?.postalCode || '',
    },
  });

  // Address Form
  const { control: addressControl, handleSubmit: handleAddressSubmit, reset: resetAddressForm, setValue: setAddressValue } = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: 'Home',
      receiverName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
      landmark: '',
    },
  });

  // Sync profile defaults when user details change
  useEffect(() => {
    if (user) {
      resetProfileForm({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        latitude: user.latitude,
        longitude: user.longitude,
        landmark: user.landmark || '',
        addressLine: user.addressLine || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
      });
    }
  }, [user, resetProfileForm]);

  // Set address form fields if editing
  useEffect(() => {
    if (editingAddress) {
      setAddressValue('label', editingAddress.label);
      setAddressValue('receiverName', editingAddress.receiverName);
      setAddressValue('phone', editingAddress.phone);
      setAddressValue('addressLine', editingAddress.addressLine);
      setAddressValue('city', editingAddress.city);
      setAddressValue('state', editingAddress.state);
      setAddressValue('postalCode', editingAddress.postalCode);
      setAddressValue('latitude', editingAddress.latitude);
      setAddressValue('longitude', editingAddress.longitude);
      setAddressValue('landmark', editingAddress.landmark || '');
    } else {
      resetAddressForm({
        label: 'Home',
        receiverName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        postalCode: '',
        latitude: undefined,
        longitude: undefined,
        landmark: '',
      });
    }
  }, [editingAddress, setAddressValue, resetAddressForm]);

  // Location and Google API state
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      if (editProfileModal) {
        setProfileValue('latitude', latitude);
        setProfileValue('longitude', longitude);
      } else {
        setAddressValue('latitude', latitude);
        setAddressValue('longitude', longitude);
      }

      // Call Reverse Geocode
      const details = await googleMapsService.reverseGeocode(latitude, longitude);
      if (editProfileModal) {
        setProfileValue('addressLine', details.addressLine);
        setProfileValue('city', details.city);
        setProfileValue('state', details.state);
        setProfileValue('postalCode', details.postalCode);
        if (details.landmark) {
          setProfileValue('landmark', details.landmark);
        }
      } else {
        setAddressValue('addressLine', details.addressLine);
        setAddressValue('city', details.city);
        setAddressValue('state', details.state);
        setAddressValue('postalCode', details.postalCode);
        if (details.landmark) {
          setAddressValue('landmark', details.landmark);
        }
      }
      
      Alert.alert('Location Fetched', `Successfully fetched coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to retrieve your current location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const list = await googleMapsService.getAutocompleteSuggestions(text);
      setSuggestions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    setIsSearching(true);
    try {
      const details = await googleMapsService.getPlaceDetails(suggestion.placeId);
      
      if (editProfileModal) {
        setProfileValue('addressLine', details.addressLine);
        setProfileValue('city', details.city);
        setProfileValue('state', details.state);
        setProfileValue('postalCode', details.postalCode);
        setProfileValue('latitude', details.latitude);
        setProfileValue('longitude', details.longitude);
        setProfileValue('landmark', details.landmark || '');
      } else {
        setAddressValue('addressLine', details.addressLine);
        setAddressValue('city', details.city);
        setAddressValue('state', details.state);
        setAddressValue('postalCode', details.postalCode);
        setAddressValue('latitude', details.latitude);
        setAddressValue('longitude', details.longitude);
        setAddressValue('landmark', details.landmark || '');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch place details.');
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search when modal closes/opens
  useEffect(() => {
    if (!addressModal && !editProfileModal) {
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [addressModal, editProfileModal]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout().unwrap();
          } catch (e) {
            // Proceed anyway
          }
          dispatch(clearCredentials());
          dispatch(apiSlice.util.resetApiState());
          await secureStore.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
          await secureStore.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
        },
      },
    ]);
  };

  const onProfileSave = async (data: any) => {
    try {
      const sanitizedData = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        landmark: data.landmark?.trim() || undefined,
        addressLine: data.addressLine?.trim() || undefined,
        city: data.city?.trim() || undefined,
        state: data.state?.trim() || undefined,
        postalCode: data.postalCode?.trim() || undefined,
      };

      if (sanitizedData.latitude === undefined || isNaN(sanitizedData.latitude)) delete sanitizedData.latitude;
      if (sanitizedData.longitude === undefined || isNaN(sanitizedData.longitude)) delete sanitizedData.longitude;
      if (!sanitizedData.landmark) delete sanitizedData.landmark;
      if (!sanitizedData.addressLine) delete sanitizedData.addressLine;
      if (!sanitizedData.city) delete sanitizedData.city;
      if (!sanitizedData.state) delete sanitizedData.state;
      if (!sanitizedData.postalCode) delete sanitizedData.postalCode;

      const response = await updateProfile(sanitizedData).unwrap();
      const updatedUser = response.data;
      dispatch(setCredentials({ user: updatedUser, accessToken: null as any })); // maintains current token, updates profile details
      setEditProfileModal(false);
      Alert.alert('Success', 'Profile details updated.');
    } catch (err: any) {
      console.error('Profile update failed:', err);
      const errMsg = err?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Update Failed', errMsg);
    }
  };

  const onAddressSave = async (data: any) => {
    try {
      const sanitizedData = {
        ...data,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        landmark: data.landmark?.trim() || undefined,
      };

      if (sanitizedData.latitude === undefined || isNaN(sanitizedData.latitude)) delete sanitizedData.latitude;
      if (sanitizedData.longitude === undefined || isNaN(sanitizedData.longitude)) delete sanitizedData.longitude;
      if (!sanitizedData.landmark) delete sanitizedData.landmark;

      if (editingAddress) {
        await updateAddress({
          id: editingAddress.id || (editingAddress as any)._id,
          body: sanitizedData,
        }).unwrap();
        Alert.alert('Success', 'Shipping address updated.');
      } else {
        await createAddress({
          ...sanitizedData,
          isDefault: savedAddresses.length === 0, // make default if it is their first saved address
        }).unwrap();
        Alert.alert('Success', 'New shipping address saved.');
      }
      setAddressModal(false);
      setEditingAddress(null);
      if (reopenAddressesModal) {
        setShowSavedAddressesModal(true);
        setReopenAddressesModal(false);
      }
    } catch (err: any) {
      console.error('Address save failed:', err);
      const errMsg = err?.data?.message || 'Failed to save address. Please try again.';
      Alert.alert('Error', errMsg);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(addressId).unwrap();
          } catch (err: any) {
            console.error('Delete address failed:', err);
            Alert.alert('Error', 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefaultAddress = async (address: SavedAddress) => {
    try {
      await updateAddress({
        id: address.id || (address as any)._id,
        body: { isDefault: true },
      }).unwrap();
    } catch (err: any) {
      console.error('Set default address failed:', err);
      Alert.alert('Error', 'Failed to set default address.');
    }
  };

  const isUpdating = isUpdatingProfile || isCreatingAddress || isUpdatingAddress || isDeletingAddress;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerDetails}>
              <Text style={styles.fullName}>{user?.fullName || 'Customer'}</Text>
              
              <View style={styles.profileBadgesRow}>
                <View style={styles.profileBadge}>
                  <MaterialCommunityIcons name="phone-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.profileBadgeText}>{user?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.profileBadge}>
                  <MaterialCommunityIcons name="email-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.profileBadgeText}>{user?.email}</Text>
                </View>
              </View>

              {user?.addressLine && (
                <Text style={styles.locationDetailText}>
                  Home: {user.addressLine}
                  {user.landmark ? `, ${user.landmark}` : ''}
                  , {user.city}, {user.state}
                </Text>
              )}
              {user?.latitude && user?.longitude && (
                <View style={styles.profileCoordsRow}>
                  <MaterialCommunityIcons name="map-marker-radius" size={12} color={COLORS.secondary} style={{ marginRight: 2 }} />
                  <Text style={styles.profileCoordsText}>
                    {user.latitude.toFixed(5)}, {user.longitude.toFixed(5)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editProfileBtn}
            onPress={() => setEditProfileModal(true)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.premiumWalletCard}
          onPress={() => setShowWalletDetailsModal(true)}
        >
          <View style={styles.premiumWalletHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="wallet-membership" size={24} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.premiumWalletTitle}>Aashiyana Wallet</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>HOW IT WORKS</Text>
            </View>
          </View>
          <View style={styles.premiumWalletBody}>
            <Text style={styles.premiumBalanceLabel}>Available Balance</Text>
            <Text style={styles.premiumBalanceValue}>₹{((walletBalance || 0) / 100).toFixed(2)}</Text>
            <View style={styles.premiumWalletDivider} />
            <View style={styles.premiumWalletBenefitRow}>
              <MaterialCommunityIcons name="brightness-percent" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.premiumWalletBenefitText}>
                Get an instant 2% discount on orders over ₹100 using Wallet
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Options List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isLogout = item.isLogout;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.menuItemCard}
                onPress={item.action}
              >
                <View style={[styles.iconCircle, isLogout && styles.logoutIconCircle]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={isLogout ? COLORS.error : '#10B981'}
                  />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.chevron}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Wallet Details Modal */}
        <Modal visible={showWalletDetailsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Aashiyana Wallet — Info</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowWalletDetailsModal(false)}
                  style={styles.closeModalHeaderBtn}
                >
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginVertical: SPACING.sm }} showsVerticalScrollIndicator={true}>
                <View style={styles.walletDetailsContainer}>
                  
                  {/* Card 1: What is Wallet */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoBlockHeader}>
                      <MaterialCommunityIcons name="wallet" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.infoBlockTitle}>What is Aashiyana Wallet?</Text>
                    </View>
                    <Text style={styles.infoBlockBody}>
                      Aashiyana Wallet is your pre-funded credit and cashback account. It allows you to complete material checkouts instantly, secure refund balances, and qualify for exclusive store rewards on every purchase.
                    </Text>
                  </View>

                  {/* Card 2: 2% discount */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoBlockHeader}>
                      <MaterialCommunityIcons name="percent" size={20} color="#22C55E" style={{ marginRight: 8 }} />
                      <Text style={styles.infoBlockTitle}>Automatic 2% Discount</Text>
                    </View>
                    <Text style={styles.infoBlockBody}>
                      Get an instant 2% discount on your order subtotal when you pay using Aashiyana Wallet. This benefit is automatically applied at checkout to any order exceeding ₹100.
                    </Text>
                  </View>

                  {/* Card 3: Cashback Reflection */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoBlockHeader}>
                      <MaterialCommunityIcons name="clock-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                      <Text style={styles.infoBlockTitle}>Instant Cashback Reflection</Text>
                    </View>
                    <Text style={styles.infoBlockBody}>
                      Any promotional cashback or returns will reflect in your Aashiyana Wallet balance instantly after the product status updates to Delivered.
                    </Text>
                  </View>

                  {/* Card 4: Wallet Expiry */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoBlockHeader}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                      <Text style={styles.infoBlockTitle}>30-Day Balance Expiry</Text>
                    </View>
                    <Text style={styles.infoBlockBody}>
                      Please note that promotional cashback and wallet credit balances are valid for 30 days. Ensure to utilize your balance before it expires.
                    </Text>
                  </View>

                </View>
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.walletModalCloseBtn}
                onPress={() => setShowWalletDetailsModal(false)}
              >
                <Text style={styles.walletModalCloseBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Saved Addresses Modal */}
        <Modal visible={showSavedAddressesModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Saved Addresses</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowSavedAddressesModal(false)}
                  style={styles.closeModalHeaderBtn}
                >
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalAddAddressBtn}
                onPress={() => {
                  setEditingAddress(null);
                  setReopenAddressesModal(true);
                  setShowSavedAddressesModal(false);
                  setAddressModal(true);
                }}
              >
                <MaterialCommunityIcons name="plus" size={18} color={COLORS.background} />
                <Text style={styles.modalAddAddressBtnText}>Add New Shipping Address</Text>
              </TouchableOpacity>

              {isAddressesLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.md }} />
              ) : savedAddresses.length === 0 ? (
                <View style={[styles.emptyAddresses, { borderStyle: 'dashed', elevation: 0, marginVertical: SPACING.md }]}>
                  <MaterialCommunityIcons name="map-marker-off-outline" size={36} color={COLORS.disabled} />
                  <Text style={styles.emptyText}>No saved addresses found</Text>
                  <Text style={styles.emptySub}>Add shipping locations for faster checkouts.</Text>
                </View>
              ) : (
                <ScrollView style={{ marginVertical: SPACING.sm }} showsVerticalScrollIndicator={true}>
                  <View style={styles.addressList}>
                    {savedAddresses.map((addr, index) => (
                      <View key={addr.id || (addr as any)._id || index.toString()} style={styles.addressCard}>
                        <View style={styles.addressRow}>
                          <View style={styles.addressInfo}>
                            <View style={styles.labelRow}>
                              <Text style={styles.addressLabel}>{addr.label}</Text>
                              {addr.isDefault ? (
                                <Text style={styles.defaultBadge}>Default</Text>
                              ) : (
                                <TouchableOpacity
                                  activeOpacity={0.6}
                                  onPress={() => handleSetDefaultAddress(addr)}
                                >
                                  <Text style={styles.setDefaultText}>Set Default</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={styles.receiverName}>{addr.receiverName}  •  {addr.phone}</Text>
                            <Text style={styles.addressText}>
                              {addr.addressLine}
                              {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                              , {addr.city}, {addr.state} - {addr.postalCode}
                            </Text>
                            {addr.latitude && addr.longitude && (
                              <View style={styles.cardCoords}>
                                <MaterialCommunityIcons name="map-marker-radius" size={12} color={COLORS.secondary} />
                                <Text style={styles.cardCoordsText}>
                                  {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.addressActions}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.actionIconBtn}
                              onPress={() => {
                                setEditingAddress(addr);
                                setReopenAddressesModal(true);
                                setShowSavedAddressesModal(false);
                                setAddressModal(true);
                              }}
                            >
                              <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>
                            
                            {!addr.isDefault && (
                              <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.actionIconBtn, { marginTop: SPACING.sm }]}
                                onPress={() => handleDeleteAddress(addr.id)}
                              >
                                <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.modalBtn, styles.modalCancelBtn, { width: '100%', marginTop: SPACING.sm }]}
                onPress={() => setShowSavedAddressesModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Support Modal */}
        <Modal visible={showSupportModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Aashiyana Support</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowSupportModal(false)}
                    style={styles.closeModalHeaderBtn}
                  >
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.supportSubtitle}>
                  Have queries regarding materials, delivery, or orders? Reach out to us.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.supportCard}
                  onPress={() => handleOpenLink('tel:+919876543210')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <MaterialCommunityIcons name="phone" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.supportCardText}>
                    <Text style={styles.supportCardTitle}>Call Us</Text>
                    <Text style={styles.supportCardValue}>+91 98765 43210</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.supportCard}
                  onPress={() => handleOpenLink('https://wa.me/919876543210?text=Hi,%20I%20need%20support%20with%20Aashiyana%20Building%20App!')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <MaterialCommunityIcons name="whatsapp" size={20} color="#16A34A" />
                  </View>
                  <View style={styles.supportCardText}>
                    <Text style={styles.supportCardTitle}>WhatsApp Support</Text>
                    <Text style={styles.supportCardValue}>Instant chat assistance</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.supportCard}
                  onPress={() => handleOpenLink('mailto:support@ashiyanabuilding.com?subject=Aashiyana%20App%20Support')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#DC2626" />
                  </View>
                  <View style={styles.supportCardText}>
                    <Text style={styles.supportCardTitle}>Email Us</Text>
                    <Text style={styles.supportCardValue}>support@ashiyanabuilding.com</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <View style={styles.supportTimingBox}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.supportTimingText}>
                    Support is active: Mon - Sat, 9:00 AM - 6:00 PM
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.modalBtn, styles.modalConfirmBtn, { width: '100%', marginTop: SPACING.md }]}
                  onPress={() => setShowSupportModal(false)}
                >
                  <Text style={styles.modalConfirmText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Policies Modal */}
        <Modal visible={policyModal.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {policyModal.type === 'shipping' && 'Shipping Policy'}
                  {policyModal.type === 'refund' && 'Refund Policy'}
                  {policyModal.type === 'privacy' && 'Privacy Policy'}
                  {policyModal.type === 'terms' && 'Terms of Service'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPolicyModal({ visible: false, type: null })}
                  style={styles.closeModalHeaderBtn}
                >
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginVertical: SPACING.md }} showsVerticalScrollIndicator={true}>
                {policyModal.type === 'shipping' && (
                  <View style={styles.policyContent}>
                    <Text style={styles.policyParagraph}>
                      At Aashiyana Building, we strive to deliver your building materials efficiently and safely to your construction site.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Delivery Area</Text>
                    <Text style={styles.policyText}>
                      We currently deliver across Ranchi and surrounding regions within a 50km radius. For deliveries beyond this, please get in touch with our support team.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Dispatch & Timelines</Text>
                    <Text style={styles.policyText}>
                      Standard materials (cement, bricks, steel) in stock are dispatched within 24–48 hours. Sand and gravel deliveries may be subject to weather conditions and mining/transport regulations.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Logistics & Vehicle Entry</Text>
                    <Text style={styles.policyText}>
                      Ensure your construction site has adequate road access for pick-up trucks, tractors, or heavy dump trucks. Any restriction on heavy vehicle entry (e.g., no-entry hours in municipal areas) must be informed beforehand.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Unloading Rules</Text>
                    <Text style={styles.policyText}>
                      Standard unloading includes dropping materials at the nearest accessible point next to the transport vehicle. Carrying materials into narrow lanes, upper floors, or deep inside a site is subject to local labor availability and extra handling fees.
                    </Text>
                  </View>
                )}

                {policyModal.type === 'refund' && (
                  <View style={styles.policyContent}>
                    <Text style={styles.policyParagraph}>
                      We stand by the quality of our materials. If you are not satisfied, here are the terms for refunds and returns.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Eligible Returns</Text>
                    <Text style={styles.policyText}>
                      - Steel Rebar: Full length bundles that are not cut, rusted, or bent.
                    </Text>
                    <Text style={styles.policyText}>
                      - Cement Bags: Unopened bags returned within 24 hours of delivery. We cannot accept older bags due to atmospheric moisture absorption.
                    </Text>
                    <Text style={styles.policyText}>
                      - Bricks & Tiles: Bricks returned intact, and tiles in unopened original box packages.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Cancellation Policy</Text>
                    <Text style={styles.policyText}>
                      Orders can be cancelled free of cost before the delivery vehicle is loaded at our yard. Once dispatched, cancellation will incur round-trip transport charges.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Refund Processing</Text>
                    <Text style={styles.policyText}>
                      Once the returned material is received and inspected at our warehouse, the refund will be initiated. Approved refunds are credited to the original payment source (UPI, Card, or Net Banking) within 5–7 working days.
                    </Text>
                  </View>
                )}

                {policyModal.type === 'privacy' && (
                  <View style={styles.policyContent}>
                    <Text style={styles.policyParagraph}>
                      Your privacy and data security are of utmost importance to us. This policy details how we handle user information.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Information We Collect</Text>
                    <Text style={styles.policyText}>
                      We collect your full name, email, phone number, saved delivery addresses, and precise GPS location coordinates.
                    </Text>
                    <Text style={styles.policySectionHeader}>• How We Use Location Data</Text>
                    <Text style={styles.policyText}>
                      GPS coordinates are used solely to locate your construction site for accurate logistics routing when you use the 'Use Current GPS Location' features. This prevents delayed shipments due to incorrect address inputs.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Data Security</Text>
                    <Text style={styles.policyText}>
                      All customer profile details, authentication credentials, and API requests are encrypted using industry-standard SSL/TLS protocols and secure JWT storage mechanisms.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Third-Party Sharing</Text>
                    <Text style={styles.policyText}>
                      We do not sell, trade, or distribute your profile data to third-party advertising companies. Your details are shared strictly with transport drivers and partners to facilitate shipping.
                    </Text>
                  </View>
                )}

                {policyModal.type === 'terms' && (
                  <View style={styles.policyContent}>
                    <Text style={styles.policyParagraph}>
                      Welcome to Aashiyana Building. By using our mobile application, you agree to comply with these terms.
                    </Text>
                    <Text style={styles.policySectionHeader}>• User Accounts</Text>
                    <Text style={styles.policyText}>
                      You must ensure your account details, phone number, and address are accurate. You are solely responsible for all activities occurring under your registered profile.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Fluctuation in Pricing</Text>
                    <Text style={styles.policyText}>
                      Prices of materials like steel, cement, and sand fluctuate daily based on market rates, demand, and factory prices. The prices locked at the moment of checkout are final for that specific transaction.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Inspection at Delivery</Text>
                    <Text style={styles.policyText}>
                      Customers are requested to inspect the quantity, brand, and quality of building materials immediately upon arrival at the site. Once delivery acceptance is signed, Aashiyana Building is not responsible for missing quantities or subsequent physical damage.
                    </Text>
                    <Text style={styles.policySectionHeader}>• Limitation of Liability</Text>
                    <Text style={styles.policyText}>
                      We are not responsible for project construction delays, contractor downtime, or loss of profits arising from delayed material shipments due to unforeseen transport blockades, mineral transit strikes, or force majeure events.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.modalBtn, styles.modalConfirmBtn, { width: '100%' }]}
                onPress={() => setPolicyModal({ visible: false, type: null })}
              >
                <Text style={styles.modalConfirmText}>Accept & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              
              <InputField name="fullName" control={profileControl} label="Full Name" placeholder="John Doe" />
              <InputField name="email" control={profileControl} label="Email Address" placeholder="john@example.com" keyboardType="email-address" />
              <InputField name="phone" control={profileControl} label="Phone Number" placeholder="9876543210" keyboardType="phone-pad" />

              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>Home / Profile Location</Text>

              {/* Autocomplete Search & Locate Me Buttons for Profile */}
              <View style={styles.searchSection}>
                <TextInput
                  mode="outlined"
                  label="Search Home Address / Landmark..."
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                  style={styles.searchInput}
                  right={
                    isSearching ? (
                      <TextInput.Icon icon={() => <ActivityIndicator size="small" color={COLORS.primary} />} />
                    ) : (
                      <TextInput.Icon icon="magnify" color={COLORS.secondary} />
                    )
                  }
                />

                {suggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    {suggestions.map((item, index) => (
                      <TouchableOpacity
                        key={item.placeId || index.toString()}
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} style={styles.suggestionIcon} />
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionMainText}>{item.mainText}</Text>
                          <Text style={styles.suggestionSubText}>{item.secondaryText}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.locateMeBtn}
                  onPress={handleLocateMe}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialCommunityIcons name="crosshairs-gps" size={18} color={COLORS.primary} />
                  )}
                  <Text style={styles.locateMeBtnText}>
                    {isLocating ? 'Locating...' : 'Use Current GPS Location'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <InputField name="landmark" control={profileControl} label="Landmark / Building Name" placeholder="e.g. Near Royal Plaza" />
              <InputField name="addressLine" control={profileControl} label="Street Address Line" placeholder="e.g. 12, Link Road" />

              <View style={styles.rowLayout}>
                <View style={styles.colLayout}>
                  <InputField name="city" control={profileControl} label="City" placeholder="Ranchi" />
                </View>
                <View style={styles.colLayout}>
                  <InputField name="state" control={profileControl} label="State" placeholder="Jharkhand" />
                </View>
              </View>

              <InputField name="postalCode" control={profileControl} label="Postal Pincode" placeholder="e.g. 834001" keyboardType="numeric" />

              {/* Coordinates Badge */}
              <Controller
                control={profileControl}
                name="latitude"
                render={({ field: { value: lat } }) => (
                  <Controller
                    control={profileControl}
                    name="longitude"
                    render={({ field: { value: lng } }) => {
                      if (lat && lng) {
                        return (
                          <View style={styles.coordinatesBadge}>
                            <MaterialCommunityIcons name="map-marker-radius" size={14} color="#047857" />
                            <Text style={styles.coordinatesText}>
                              GPS Saved: {lat.toFixed(6)}, {lng.toFixed(6)}
                            </Text>
                          </View>
                        );
                      }
                      return <></>;
                    }}
                  />
                )}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setEditProfileModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.modalBtn, styles.modalConfirmBtn]}
                  onPress={handleProfileSubmit(onProfileSave)}
                >
                  <Text style={styles.modalConfirmText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Address Add/Edit Modal */}
      <Modal visible={addressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Shipping Location' : 'Add Shipping Location'}
              </Text>

              {/* Autocomplete Search & Locate Me Buttons */}
              <View style={styles.searchSection}>
                <TextInput
                  mode="outlined"
                  label="Search Building, Landmark, or Area..."
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                  style={styles.searchInput}
                  right={
                    isSearching ? (
                      <TextInput.Icon icon={() => <ActivityIndicator size="small" color={COLORS.primary} />} />
                    ) : (
                      <TextInput.Icon icon="magnify" color={COLORS.secondary} />
                    )
                  }
                />

                {suggestions.length > 0 && (
                  <View style={styles.suggestionsBox}>
                    {suggestions.map((item, index) => (
                      <TouchableOpacity
                        key={item.placeId || index.toString()}
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} style={styles.suggestionIcon} />
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionMainText}>{item.mainText}</Text>
                          <Text style={styles.suggestionSubText}>{item.secondaryText}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.locateMeBtn}
                  onPress={handleLocateMe}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialCommunityIcons name="crosshairs-gps" size={18} color={COLORS.primary} />
                  )}
                  <Text style={styles.locateMeBtnText}>
                    {isLocating ? 'Locating...' : 'Use Current GPS Location'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <InputField name="label" control={addressControl} label="Address Label (e.g. Home, Office)" placeholder="e.g. Home" />
              <InputField name="receiverName" control={addressControl} label="Receiver Full Name" placeholder="e.g. John Doe" />
              <InputField name="phone" control={addressControl} label="Receiver Phone Number" placeholder="e.g. 9876543210" keyboardType="phone-pad" />
              
              <InputField name="landmark" control={addressControl} label="Landmark / Building Name (e.g. Near Kali Mandir)" placeholder="e.g. Near Royal Plaza" />
              <InputField name="addressLine" control={addressControl} label="Street Address Line" placeholder="e.g. 12, Link Road" />

              <View style={styles.rowLayout}>
                <View style={styles.colLayout}>
                  <InputField name="city" control={addressControl} label="City" placeholder="Ranchi" />
                </View>
                <View style={styles.colLayout}>
                  <InputField name="state" control={addressControl} label="State" placeholder="Jharkhand" />
                </View>
              </View>

              <InputField name="postalCode" control={addressControl} label="Postal Pincode" placeholder="e.g. 834001" keyboardType="numeric" />

              {/* Coordinates Badge */}
              <Controller
                control={addressControl}
                name="latitude"
                render={({ field: { value: lat } }) => (
                  <Controller
                    control={addressControl}
                    name="longitude"
                    render={({ field: { value: lng } }) => {
                      if (lat && lng) {
                        return (
                          <View style={styles.coordinatesBadge}>
                            <MaterialCommunityIcons name="map-marker-radius" size={14} color="#047857" />
                            <Text style={styles.coordinatesText}>
                              GPS Saved: {lat.toFixed(6)}, {lng.toFixed(6)}
                            </Text>
                          </View>
                        );
                      }
                      return <></>;
                    }}
                  />
                )}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => {
                    setAddressModal(false);
                    setEditingAddress(null);
                    if (reopenAddressesModal) {
                      setShowSavedAddressesModal(true);
                      setReopenAddressesModal(false);
                    }
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.modalBtn, styles.modalConfirmBtn]}
                  onPress={handleAddressSubmit(onAddressSave)}
                >
                  <Text style={styles.modalConfirmText}>
                    {editingAddress ? 'Save Changes' : 'Add Address'}
                  </Text>
                </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>

      <LoadingOverlay visible={isUpdating} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary, // Dark slate/black avatar background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  headerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  fullName: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  locationDetailText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  profileCoordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profileCoordsText: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  editProfileText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAddressBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginLeft: 2,
  },
  emptyAddresses: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  emptySub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  addressList: {
    marginBottom: SPACING.lg,
  },
  addressCard: {
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
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 0.85,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginRight: SPACING.xs,
  },
  defaultBadge: {
    fontSize: 9,
    backgroundColor: '#DEF7EC',
    color: '#03543F',
    fontWeight: 'bold',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  setDefaultText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  receiverName: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardCoords: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardCoordsText: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 2,
  },
  addressActions: {
    flex: 0.15,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionIconBtn: {
    padding: 6,
  },
  systemBox: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  systemTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  systemLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  systemValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginBottom: 24,
  },
  logoutBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollOverlay: {
    flexGrow: 1,
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 0.48,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  modalCancelText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  modalConfirmText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colLayout: {
    flex: 0.48,
  },
  // Duplicate locationDetailText, profileCoordsRow, and profileCoordsText properties removed
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
  },
  suggestionsBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    maxHeight: 200,
    overflow: 'hidden',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    marginRight: SPACING.xs,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  suggestionSubText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  locateMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    marginTop: SPACING.sm,
  },
  locateMeBtnText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  coordinatesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  coordinatesText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: '#065F46',
    marginLeft: 6,
  },
  // Duplicate cardCoords and cardCoordsText properties removed
  menuContainer: {
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  menuItemCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4', // Very light green / emerald-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  logoutIconCircle: {
    backgroundColor: '#FEF2F2', // Very light red / rose-50
  },
  menuItemLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  chevron: {
    opacity: 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  closeModalHeaderBtn: {
    padding: 4,
  },
  modalAddAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
  },
  modalAddAddressBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: 6,
  },
  supportSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  supportCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  supportCardText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  supportCardTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  supportCardValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  supportTimingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  supportTimingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 6,
    textAlign: 'center',
  },
  policyContent: {
    paddingHorizontal: SPACING.xs,
  },
  policyParagraph: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  policySectionHeader: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  policyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  walletCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  premiumWalletCard: {
    backgroundColor: COLORS.secondary, // Premium Deep Slate Gray/Black
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary, // Gold Border
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  premiumWalletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  premiumWalletTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#FFFFFF', // High contrast white
  },
  infoBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)', // transparent gold bg
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: COLORS.primary,
  },
  infoBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  premiumWalletBody: {
    alignItems: 'flex-start',
  },
  premiumBalanceLabel: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.6)', // muted white
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumBalanceValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: 'bold',
    color: COLORS.primary, // Gold Value
    marginVertical: 2,
  },
  premiumWalletDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginVertical: SPACING.xs,
  },
  premiumWalletBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  premiumWalletBenefitText: {
    ...TYPOGRAPHY.caption,
    color: '#F8FAFC', // Slate 50 light text
    fontWeight: '500',
    flex: 1,
  },
  walletDetailsContainer: {
    paddingBottom: SPACING.md,
  },
  infoBlock: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoBlockTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  infoBlockBody: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  walletModalCloseBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  walletModalCloseBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});
export default ProfileScreen;
