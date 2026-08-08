import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/radius';
import { SPACING } from '../../theme/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  readonly?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onClear?: () => void;
}

export const SearchBar = ({
  placeholder = 'Search materials, steel, cement...',
  readonly = false,
  value,
  onChangeText,
  onPress,
  onClear,
}: SearchBarProps) => {
  if (readonly) {
    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={onPress}>
        <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textSecondary} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          editable={false}
          pointerEvents="none"
          style={styles.input}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={22} color={COLORS.textSecondary} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        autoFocus={!readonly}
        returnKeyType="search"
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    width: '100%',
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    padding: 0, // Reset default padding
  },
  clearBtn: {
    padding: 4,
  },
});
export default SearchBar;
