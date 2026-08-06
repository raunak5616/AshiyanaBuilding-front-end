import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';

interface PasswordFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  disabled = false,
}: PasswordFieldProps<T>) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

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
            secureTextEntry={secureTextEntry}
            disabled={disabled}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            error={!!error}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                color={COLORS.textSecondary}
              />
            }
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
