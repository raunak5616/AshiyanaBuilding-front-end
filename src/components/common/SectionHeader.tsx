import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

interface SectionHeaderProps {
  title: string;
  onPressSeeAll?: () => void;
  showSeeAll?: boolean;
}

export const SectionHeader = ({ title, onPressSeeAll, showSeeAll = true }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showSeeAll && onPressSeeAll && (
        <TouchableOpacity onPress={onPressSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  seeAll: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
});
export default SectionHeader;
