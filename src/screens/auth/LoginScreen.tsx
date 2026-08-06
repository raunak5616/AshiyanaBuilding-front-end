import React from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { loginSchema } from '../../features/auth/authValidation';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../store/authSlice';
import { secureStore } from '../../utils/secureStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { RADIUS } from '../../theme/radius';
import { TYPOGRAPHY } from '../../theme/typography';
import { InputField } from '../../components/inputs/InputField';
import { PasswordField } from '../../components/inputs/PasswordField';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { LoadingOverlay } from '../../components/loaders/LoadingOverlay';
import { Card, Button } from 'react-native-paper';

export const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data).unwrap();
      const { customer, accessToken } = response.data;

      // Save access token securely (the refresh token is handled by the apiSlice set-cookie interceptor)
      await secureStore.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

      dispatch(setCredentials({ user: customer, accessToken }));
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error?.data?.message || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', errorMsg);
    }
  };

  const handleQuickDemo = () => {
    setValue('emailOrPhone', 'customer@example.com');
    setValue('password', 'Password123');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Ashiyana Building</Text>
        <Text style={styles.subtitle}>Log in to your customer account</Text>

        <Card style={styles.card}>
          <Card.Content>
            <InputField
              name="emailOrPhone"
              control={control}
              label="Email or Phone Number"
              placeholder="e.g. customer@example.com or 9876543210"
              keyboardType="email-address"
            />

            <PasswordField
              name="password"
              control={control}
              label="Password"
              placeholder="Enter your password"
            />

            <PrimaryButton
              label="Login"
              onPress={handleSubmit(onSubmit)}
              style={styles.loginBtn}
            />

            <Button
              mode="text"
              onPress={() => navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
              textColor={COLORS.primaryDark}
              style={styles.forgotBtn}
            >
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>

        <SecondaryButton
          label="Create New Account"
          onPress={() => navigation.navigate(ROUTES.AUTH.SIGNUP)}
          style={styles.signupBtn}
        />

        {/* Quick Demo Accounts Panel */}
        <Card style={styles.demoCard}>
          <Card.Content style={styles.demoContent}>
            <Text style={styles.demoTitle}>Quick Demo Login</Text>
            <Text style={styles.demoDesc}>
              Quickly fill the fields with the seeded demo customer account to test login.
            </Text>
            <Button
              mode="outlined"
              onPress={handleQuickDemo}
              textColor={COLORS.secondary}
              style={[styles.demoBtn, { borderColor: COLORS.primary }]}
            >
              Pre-fill customer@example.com
            </Button>
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
    ...TYPOGRAPHY.display,
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
  loginBtn: {
    marginTop: SPACING.xs,
  },
  forgotBtn: {
    marginTop: SPACING.xs,
    alignSelf: 'center',
  },
  signupBtn: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  demoCard: {
    width: '100%',
    backgroundColor: '#FFFBEB', // Light amber background for demo box
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  demoContent: {
    alignItems: 'center',
  },
  demoTitle: {
    ...TYPOGRAPHY.title,
    fontSize: 16,
    color: COLORS.warning,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  demoDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  demoBtn: {
    borderRadius: RADIUS.sm,
  },
});
export default LoginScreen;
