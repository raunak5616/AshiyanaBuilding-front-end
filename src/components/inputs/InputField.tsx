import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';

interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
}

export const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  disabled = false,
}: InputFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value || ''}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            disabled={disabled}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            error={!!error}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.background,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
