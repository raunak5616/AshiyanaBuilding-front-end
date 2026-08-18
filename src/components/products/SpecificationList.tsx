import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { Product, useGetCategoriesQuery, useGetBrandsQuery } from '../../features/products/productApi';

interface SpecificationListProps {
  product: Product;
}

export const SpecificationList = ({ product }: SpecificationListProps) => {
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const getCategoryName = (id: string | null) => {
    if (!id || !categoriesData?.data) return 'General';
    const found = categoriesData.data.find((c) => c.id === id);
    return found ? found.name : 'General';
  };

  const getBrandName = (id: string | null) => {
    if (!id || !brandsData?.data) return 'Generic';
    const found = brandsData.data.find((b) => b.id === id);
    return found ? found.name : 'Generic';
  };

  const specs = [
    { label: 'SKU Code', value: product.sku },
    { label: 'Brand', value: getBrandName(product.brandId) },
    { label: 'Category', value: getCategoryName(product.categoryId) },
    { label: 'Tax Rate', value: `${product.taxRate}% GST` },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Specifications</Text>
      <View style={styles.table}>
        {specs.map((spec, index) => (
          <View
            key={index}
            style={[styles.row, index % 2 === 0 ? styles.evenBg : styles.oddBg]}
          >
            <Text style={styles.label}>{spec.label}</Text>
            <Text style={styles.value}>{spec.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  evenBg: {
    backgroundColor: COLORS.surface,
  },
  oddBg: {
    backgroundColor: COLORS.background,
  },
  label: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  value: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
});
export default SpecificationList;
