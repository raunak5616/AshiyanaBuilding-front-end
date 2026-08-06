import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      buttonColor={COLORS.primary}
      textColor={COLORS.secondary}
      style={[styles.button, style]}
      contentStyle={styles.content}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
  },
  content: {
    paddingVertical: 6,
  },
});
