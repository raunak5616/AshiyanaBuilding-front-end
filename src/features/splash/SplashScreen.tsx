import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SplashService } from './SplashService';

export const SplashScreen = () => {
  useEffect(() => {
    SplashService.bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ashiyana</Text>
      <Text style={styles.subtitle}>Building Materials</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Premium Dark Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.primary, // Brand Yellow
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.background,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loader: {
    marginTop: 48,
  },
});
export default SplashScreen;
