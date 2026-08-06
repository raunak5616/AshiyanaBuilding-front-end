import React from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../../features/auth/authValidation';
import { useForgotPasswordMutation } from '../../features/auth/authApi';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { InputField } from '../../components/inputs/InputField';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { Card } from 'react-native-paper';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      shopId: '60b9f15c7c2b5d4e6f8a9b1c',
      email: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await forgotPassword(data).unwrap();
      const resetToken = response.resetToken;

      Alert.alert(
        'Reset Token Generated',
        `For testing purposes, here is your reset token:\n\n${resetToken}\n\nCopy this token to reset your password.`,
        [
          {
            text: 'Reset Password',
            onPress: () => navigation.navigate(ROUTES.AUTH.RESET_PASSWORD, { token: resetToken }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMsg = error?.data?.message || 'Failed to submit request. Please try again.';
      Alert.alert('Request Failed', errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Request a password reset link</Text>

        <Card style={styles.card}>
          <Card.Content>


            <InputField
              name="email"
              control={control}
              label="Email Address"
              placeholder="e.g. customer@example.com"
              keyboardType="email-address"
            />

            <PrimaryButton
              label="Submit Request"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
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
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    elevation: 4,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
});
export default ForgotPasswordScreen;
