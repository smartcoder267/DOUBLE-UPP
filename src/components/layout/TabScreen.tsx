import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

type TabScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function TabScreen({ eyebrow, title, description, children }: TabScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.xl },
  heading: { gap: spacing.xs },
  eyebrow: { color: colors.red[600], fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.black[950], fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -0.9 },
  description: { color: colors.black[500], fontSize: 14, lineHeight: 21, maxWidth: 330 },
});
