import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';

export const SkeletonProductCard = ({ horizontal = false }: { horizontal?: boolean }) => {
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

  if (horizontal) {
    return (
      <View style={[styles.container, styles.horizontalContainer]}>
        <Animated.View style={[styles.imagePlaceholder, styles.horizontalImage, { opacity }]} />
        <View style={styles.horizontalContent}>
          <Animated.View style={[styles.textPlaceholder, { width: '80%', opacity }]} />
          <Animated.View style={[styles.textPlaceholder, { width: '50%', height: 12, opacity }]} />
          <Animated.View style={[styles.textPlaceholder, { width: '40%', height: 16, marginTop: 8, opacity }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.textPlaceholder, { width: '90%', opacity }]} />
        <Animated.View style={[styles.textPlaceholder, { width: '60%', height: 12, opacity }]} />
        <Animated.View style={[styles.textPlaceholder, { width: '50%', height: 16, marginTop: 12, opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    marginRight: 0,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#E4E4E7',
  },
  horizontalImage: {
    width: 100,
    height: 100,
  },
  content: {
    padding: SPACING.sm,
  },
  horizontalContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  textPlaceholder: {
    height: 14,
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
    marginBottom: 8,
  },
});
