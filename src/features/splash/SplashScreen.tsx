import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SplashService } from './SplashService';

export const SplashScreen = () => {
  useEffect(() => {
    SplashService.bootstrap();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Aashiyana.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
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
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
    backgroundColor: COLORS.background, // fallback/border area
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
