import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type AuthHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  onBack: () => void;
};

export function AuthHeader({ eyebrow, title, description, onBack }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather name="arrow-left" size={20} color={colors.black[950]} />
      </Pressable>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.black[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  eyebrow: { color: colors.red[600], fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.black[950], fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -1, marginTop: spacing.sm },
  description: { color: colors.black[500], fontSize: 15, lineHeight: 23, marginTop: spacing.sm, maxWidth: 360 },
});

