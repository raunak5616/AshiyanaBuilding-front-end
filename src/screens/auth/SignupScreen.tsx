import React from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { signupSchema } from '../../features/auth/authValidation';
import { useSignupMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../store/authSlice';
import { secureStore } from '../../utils/secureStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { InputField } from '../../components/inputs/InputField';
import { PasswordField } from '../../components/inputs/PasswordField';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { Card, SegmentedButtons } from 'react-native-paper';

export const SignupScreen = () => {
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const { control, handleSubmit, watch } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      customerType: 'individual',
      businessName: '',
      gstNumber: '',
      address: '',
    },
  });

  const customerType = watch('customerType');

  const onSubmit = async (data: any) => {
    try {
      const response = await signup(data).unwrap();
      const { customer, accessToken } = response.data;

      // Save token securely
      await secureStore.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

      dispatch(setCredentials({ user: customer, accessToken }));
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMsg = error?.data?.message || 'Failed to register account. Please check inputs.';
      Alert.alert('Registration Failed', errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Image
          source={require('../../../assets/Aashiyana.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register a new customer profile</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="customerType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Account Purpose</Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      {
                        value: 'individual',
                        label: 'Individual Use',
                      },
                      {
                        value: 'business',
                        label: 'Selling / Reseller',
                      },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>
              )}
            />

            <InputField
              name="fullName"
              control={control}
              label="Full Name"
              placeholder="e.g. John Doe"
              autoCapitalize="words"
            />

            <InputField
              name="email"
              control={control}
              label="Email Address"
              placeholder="e.g. customer@example.com"
              keyboardType="email-address"
            />

            <InputField
              name="phone"
              control={control}
              label="Phone Number"
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
            />

            <PasswordField
              name="password"
              control={control}
              label="Password"
              placeholder="At least 6 characters"
            />

            {customerType === 'business' && (
              <>
                <InputField
                  name="businessName"
                  control={control}
                  label="Shop Name"
                  placeholder="e.g. Ashiyana Hardware Store"
                  autoCapitalize="words"
                />

                <InputField
                  name="gstNumber"
                  control={control}
                  label="GST Number"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  autoCapitalize="characters"
                />

                <InputField
                  name="address"
                  control={control}
                  label="Shop Address"
                  placeholder="e.g. Sector 12, Main Market Road"
                  autoCapitalize="sentences"
                />
              </>
            )}

            <PrimaryButton
              label="Sign Up"
              onPress={handleSubmit(onSubmit)}
              style={styles.signupBtn}
            />
          </Card.Content>
        </Card>

        <LoadingOverlay visible={isLoading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.heading,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    elevation: 4,
    marginBottom: SPACING.md,
  },
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: SPACING.xs,
  },
  signupBtn: {
    marginTop: SPACING.sm,
  },
});
export default SignupScreen;
