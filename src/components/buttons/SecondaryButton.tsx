import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SecondaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
}: SecondaryButtonProps) => {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
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
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  content: {
    paddingVertical: 6,
  },
});
