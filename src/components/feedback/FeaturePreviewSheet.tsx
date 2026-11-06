import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../common/PrimaryButton';
import { colors, radii, spacing } from '../../theme/tokens';

type FeaturePreviewSheetProps = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export function FeaturePreviewSheet({ visible, title, description, onClose }: FeaturePreviewSheetProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.overlay}>
        <Pressable accessibilityLabel="Close feature information" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View accessibilityLabel={title} accessibilityRole="alert" style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.iconCircle}><Feather name="tool" size={23} color={colors.red[600]} /></View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.note}>The interface is ready. The secure financial operation will be connected through the backend before this action moves test funds.</Text>
          <PrimaryButton label="Got it" onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  handle: { width: 42, height: 4, borderRadius: radii.pill, backgroundColor: colors.black[200], alignSelf: 'center', marginBottom: spacing.lg },
  iconCircle: { width: 54, height: 54, borderRadius: radii.lg, backgroundColor: colors.red[50], alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.black[950], fontSize: 25, lineHeight: 31, fontWeight: '900', letterSpacing: -0.7, marginTop: spacing.lg },
  description: { color: colors.black[500], fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  note: { color: colors.black[400], fontSize: 11, lineHeight: 17, marginTop: spacing.lg },
  button: { marginTop: spacing.lg },
});
