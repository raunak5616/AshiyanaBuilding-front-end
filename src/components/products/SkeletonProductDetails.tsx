import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SkeletonProductDetails = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Image Carousel Placeholder */}
      <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

      {/* Info Card Placeholder */}
      <View style={styles.section}>
        <Animated.View style={[styles.titlePlaceholder, { opacity }]} />
        <Animated.View style={[styles.subtitlePlaceholder, { opacity }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.pricePlaceholder, { opacity }]} />
          <Animated.View style={[styles.badgePlaceholder, { opacity }]} />
        </View>
      </View>

      {/* Description Placeholder */}
      <View style={styles.section}>
        <Animated.View style={[styles.headingPlaceholder, { opacity }]} />
        <Animated.View style={[styles.textLinePlaceholder, { width: '95%', opacity }]} />
        <Animated.View style={[styles.textLinePlaceholder, { width: '90%', opacity }]} />
        <Animated.View style={[styles.textLinePlaceholder, { width: '70%', opacity }]} />
      </View>

      {/* Specifications Table Placeholder */}
      <View style={styles.section}>
        <Animated.View style={[styles.headingPlaceholder, { opacity }]} />
        <View style={styles.table}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.tableRow}>
              <Animated.View style={[styles.tableCell, { width: '40%', opacity }]} />
              <Animated.View style={[styles.tableCell, { width: '30%', opacity }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 250,
    backgroundColor: '#E4E4E7',
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  titlePlaceholder: {
    height: 20,
    width: '70%',
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitlePlaceholder: {
    height: 12,
    width: '35%',
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricePlaceholder: {
    height: 24,
    width: '30%',
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
  },
  badgePlaceholder: {
    height: 20,
    width: '25%',
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
  },
  headingPlaceholder: {
    height: 16,
    width: '40%',
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
    marginBottom: 12,
  },
  textLinePlaceholder: {
    height: 12,
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tableCell: {
    height: 12,
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
  },
});
export default SkeletonProductDetails;
