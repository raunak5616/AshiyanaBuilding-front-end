import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../../features/auth/authValidation';
import { useResetPasswordMutation } from '../../features/auth/authApi';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { InputField } from '../../components/inputs/InputField';
import { PasswordField } from '../../components/inputs/PasswordField';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { Card } from 'react-native-paper';

export const ResetPasswordScreen = ({ route, navigation }: any) => {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const routeToken = route?.params?.token || '';

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      password: '',
    },
  });

  useEffect(() => {
    if (routeToken) {
      setValue('token', routeToken);
    }
  }, [routeToken, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await resetPassword(data).unwrap();

      Alert.alert(
        'Password Reset Success',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'Log In',
            onPress: () => navigation.navigate(ROUTES.AUTH.LOGIN),
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMsg = error?.data?.message || 'Failed to reset password. Please check token.';
      Alert.alert('Reset Failed', errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your token and new password</Text>

        <Card style={styles.card}>
          <Card.Content>
            <InputField
              name="token"
              control={control}
              label="Reset Token"
              placeholder="Paste your reset token here"
            />

            <PasswordField
              name="password"
              control={control}
              label="New Password"
              placeholder="Enter new password (min 6 characters)"
            />

            <PrimaryButton
              label="Reset Password"
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
export default ResetPasswordScreen;
