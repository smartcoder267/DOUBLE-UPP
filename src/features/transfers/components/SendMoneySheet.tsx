import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../../theme/tokens';
import { SendMoneyFlow } from './SendMoneyFlow';

type SendMoneySheetProps = {
  visible: boolean;
  balance: number | null;
  onClose: () => void;
  onCompleted: () => void | Promise<void>;
};

export function SendMoneySheet({ visible, balance, onClose, onCompleted }: SendMoneySheetProps) {
  const [presentation, setPresentation] = useState<'bottom' | 'popup'>('bottom');
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    setModalVisible(visible);
    if (visible) setPresentation('bottom');
  }, [visible]);

  const close = () => {
    setModalVisible(false);
    onClose();
  };

  const switchPresentation = (nextPresentation: 'bottom' | 'popup') => {
    setModalVisible(false);
    setPresentation(nextPresentation);
    setTimeout(() => setModalVisible(true), 180);
  };

  return (
    <Modal animationType={presentation === 'bottom' ? 'slide' : 'fade'} onRequestClose={close} transparent visible={modalVisible}>
      <View accessibilityViewIsModal style={presentation === 'bottom' ? styles.overlay : styles.popupOverlay}>
        <Pressable accessibilityLabel="Close send money" onPress={close} style={StyleSheet.absoluteFill} />
        <View accessibilityLabel="Send money" accessibilityRole="alert" style={presentation === 'bottom' ? styles.sheet : styles.popup}>
          <View style={styles.sheetHeader}>
            <View style={styles.handle} />
            <Pressable accessibilityLabel="Close send money" accessibilityRole="button" hitSlop={8} onPress={close} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.black[700]} />
            </Pressable>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'position' : 'padding'} keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0} contentContainerStyle={styles.keyboardContent} style={styles.content}>
            <SendMoneyFlow balance={balance} onCompleted={onCompleted} onBack={close} onModeChange={(mode) => {
                if (mode === 'review' || mode === 'success') switchPresentation('popup');
                if (mode === 'form') switchPresentation('bottom');
              }} />
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  popupOverlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { height: '100%', borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: colors.white, overflow: 'hidden' },
  popup: { width: '100%', minHeight: 560, maxHeight: '86%', borderRadius: 30, backgroundColor: colors.white, overflow: 'hidden' },
  sheetHeader: { minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 42, height: 4, borderRadius: radii.pill, backgroundColor: colors.black[200] },
  closeButton: { position: 'absolute', right: spacing.lg, top: spacing.sm, width: 42, height: 42, borderRadius: radii.lg, backgroundColor: colors.black[50], alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minHeight: 0 }, keyboardContent: { flex: 1 },
});
