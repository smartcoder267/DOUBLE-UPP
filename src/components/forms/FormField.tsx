import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type FormFieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  error?: string;
  password?: boolean;
};

export function FormField({ label, icon, error, password = false, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        <Feather name={icon} size={18} color={error ? colors.error : focused ? colors.red[600] : colors.black[400]} />
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          autoCapitalize={inputProps.autoCapitalize ?? 'none'}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          placeholderTextColor={colors.black[300]}
          secureTextEntry={password ? hidden : inputProps.secureTextEntry}
          style={styles.input}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.black[400]} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { color: colors.black[800], fontSize: 13, fontWeight: '800' },
  field: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.black[50],
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldFocused: { backgroundColor: colors.red[50] },
  fieldError: { backgroundColor: '#FFF1F0' },
  input: { flex: 1, color: colors.black[950], fontSize: 15, paddingVertical: 0 },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600', lineHeight: 17 },
});

