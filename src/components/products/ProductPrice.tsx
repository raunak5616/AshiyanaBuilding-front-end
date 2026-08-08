import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';

interface ProductPriceProps {
  priceInPaise: number;
  style?: TextStyle;
}

export const ProductPrice = ({ priceInPaise, style }: ProductPriceProps) => {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(priceInPaise / 100);

  return <Text style={[styles.price, style]}>{formattedPrice}</Text>;
};

const styles = StyleSheet.create({
  price: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
});
