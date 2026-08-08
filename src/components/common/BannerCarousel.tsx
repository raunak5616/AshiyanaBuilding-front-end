import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ImageBackground } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - SPACING.md * 2;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  promo: string;
  bgGradient: [string, string];
}

const PROMO_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'UltraTech Cement',
    subtitle: 'Premium strength for your dream home',
    promo: 'BULK DISCOUNT - 10% OFF',
    bgGradient: ['#E6B800', '#F4C430'],
  },
  {
    id: '2',
    title: 'Tata Tiscon TMT Steel',
    subtitle: 'Wholesale pricing on reinforcement bars',
    promo: 'FREE DELIVERY ON 5+ TONS',
    bgGradient: ['#1E1E1E', '#3A3A3A'],
  },
  {
    id: '3',
    title: 'Bricks & Building Blocks',
    subtitle: 'High quality red clay bricks and fly ash blocks',
    promo: 'SPECIAL OFFERS INSIDE',
    bgGradient: ['#B91C1C', '#EF4444'],
  },
];

export const BannerCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= PROMO_BANNERS.length) {
        nextIndex = 0;
      }
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PROMO_BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.bgGradient[0] }]}>
            <View style={styles.cardContent}>
              <Text style={styles.promoText}>{item.promo}</Text>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.subtitleText}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.dotContainer}>
        {PROMO_BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? COLORS.primary : '#D4D4D8' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    position: 'relative',
    height: 140,
  },
  card: {
    width: CAROUSEL_WIDTH,
    height: 130,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  cardContent: {
    justifyContent: 'center',
  },
  promoText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  titleText: {
    ...TYPOGRAPHY.title,
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 20,
  },
  subtitleText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontSize: 12,
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
export default BannerCarousel;
