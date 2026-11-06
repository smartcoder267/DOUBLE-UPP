import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type CheckboxRowProps = {
  checked: boolean;
  label: React.ReactNode;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function CheckboxRow({ checked, label, onChange, error }: CheckboxRowProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? <Feather name="check" size={14} color={colors.white} /> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  box: { width: 22, height: 22, borderRadius: radii.sm, backgroundColor: colors.black[100], alignItems: 'center', justifyContent: 'center' },
  boxChecked: { backgroundColor: colors.red[600] },
  label: { flex: 1, color: colors.black[500], fontSize: 12, lineHeight: 19 },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600', marginTop: spacing.xs, marginLeft: 32 },
});

