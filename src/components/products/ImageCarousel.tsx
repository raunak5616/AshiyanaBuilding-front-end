import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ProductImage } from '../../features/products/productApi';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageCarouselProps {
  images: ProductImage[];
  onPressImage: (index: number) => void;
}

export const ImageCarousel = ({ images, onPressImage }: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  if (images.length === 0) {
    return (
      <View style={styles.fallbackContainer}>
        <MaterialCommunityIcons name="tools" size={64} color={COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {images.map((item, index) => (
          <TouchableOpacity
            key={item.publicId || String(index)}
            activeOpacity={0.9}
            onPress={() => onPressImage(index)}
            style={styles.imageWrapper}
          >
            <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.dotContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === activeIndex ? COLORS.primary : '#D4D4D8' },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 230,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  fallbackContainer: {
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: 245,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: SPACING.md,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});
export default ImageCarousel;
