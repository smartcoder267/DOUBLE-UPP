import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../../theme/tokens';

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function VerificationCodeInput({ value, onChange, error }: VerificationCodeInputProps) {
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Enter six digit verification code" onPress={() => inputRef.current?.focus()} style={styles.codeRow}>
        {Array.from({ length: 6 }, (_, index) => {
          const digit = value[index] ?? '';
          const active = index === value.length;
          return <View key={index} style={[styles.cell, active && styles.cellActive, error && styles.cellError]}><Text style={styles.digit}>{digit}</Text></View>;
        })}
      </Pressable>
      <TextInput
        ref={inputRef}
        autoFocus
        caretHidden
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
        style={styles.hiddenInput}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  codeRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'space-between' },
  cell: { flex: 1, maxWidth: 52, aspectRatio: 0.86, borderRadius: radii.md, backgroundColor: colors.black[50], alignItems: 'center', justifyContent: 'center' },
  cellActive: { backgroundColor: colors.red[50] },
  cellError: { backgroundColor: '#FFF1F0' },
  digit: { color: colors.black[950], fontSize: 23, fontWeight: '900' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600', marginTop: spacing.sm },
});
