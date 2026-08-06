import React from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
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
import { Card } from 'react-native-paper';

export const SignupScreen = () => {
  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      shopId: '60b9f15c7c2b5d4e6f8a9b1c', // Pre-filled with our seeded Shop ID
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register a new customer profile</Text>

        <Card style={styles.card}>
          <Card.Content>


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
  signupBtn: {
    marginTop: SPACING.sm,
  },
});
export default SignupScreen;
