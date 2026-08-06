import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onPress?: () => void;
}

export const EmptyState = ({
  icon = 'package-variant',
  title,
  subtitle,
  buttonLabel,
  onPress,
}: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={COLORS.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {buttonLabel && onPress && (
        <Button
          mode="contained"
          onPress={onPress}
          style={styles.button}
          buttonColor={COLORS.primary}
          textColor={COLORS.secondary}
        >
          {buttonLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
});
