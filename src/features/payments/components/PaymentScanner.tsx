import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { colors, radii, spacing } from '../../../theme/tokens';

type PaymentScannerProps = {
  loading?: boolean;
  error?: string;
  onBack: () => void;
  onScanned: (data: string) => void;
  onTryAgain: () => void;
};

export function PaymentScanner({ loading = false, error, onBack, onScanned, onTryAgain }: PaymentScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  if (!permission) return <View style={styles.permissionState}><Text style={styles.permissionText}>Preparing the camera…</Text></View>;

  if (!permission.granted) {
    return (
      <View style={styles.permissionState}>
        <View style={styles.permissionIcon}><Feather name="camera" size={28} color={colors.red[600]} /></View>
        <Text style={styles.permissionTitle}>Camera access is needed</Text>
        <Text style={styles.permissionText}>Double Up uses the camera only to scan payment QR codes.</Text>
        <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} style={styles.permissionButton} />
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.textButton}><Text style={styles.textButtonLabel}>Go back</Text></Pressable>
      </View>
    );
  }

  const retry = () => {
    setScanned(false);
    onTryAgain();
  };

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={torch}
        facing="back"
        onBarcodeScanned={scanned || loading ? undefined : ({ data }) => { setScanned(true); onScanned(data); }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.shadeTop} />
      <View style={styles.shadeBottom} />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close scanner" accessibilityRole="button" onPress={onBack} style={styles.cameraButton}><Feather name="x" size={22} color={colors.white} /></Pressable>
        <Text style={styles.headerTitle}>Scan to pay</Text>
        <Pressable accessibilityLabel={torch ? 'Turn torch off' : 'Turn torch on'} accessibilityRole="button" onPress={() => setTorch((value) => !value)} style={styles.cameraButton}><Feather name={torch ? 'zap-off' : 'zap'} size={21} color={colors.white} /></Pressable>
      </View>

      <View pointerEvents="none" style={styles.frame}><View style={styles.scanLine} /></View>

      <View style={styles.footer}>
        {loading ? <Text style={styles.footerTitle}>Checking request…</Text> : error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : <Text style={styles.footerTitle}>Place the Double Up QR code inside the frame</Text>}
        <Text style={styles.footerText}>You will review the receiver and amount before payment.</Text>
        {error ? <PrimaryButton label="Scan again" variant="light" onPress={retry} style={styles.retryButton} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: colors.black[950] },
  shadeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 155, backgroundColor: colors.overlay },
  shadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 190, backgroundColor: colors.overlay },
  header: { position: 'absolute', top: spacing.md, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  cameraButton: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.black[700], alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'absolute', width: 260, height: 260, alignSelf: 'center', top: '25%', borderWidth: 3, borderColor: colors.white, borderRadius: 32, overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 22, right: 22, top: '50%', height: 3, borderRadius: radii.pill, backgroundColor: colors.red[500] },
  footer: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, alignItems: 'center', gap: spacing.sm },
  footerTitle: { color: colors.white, fontSize: 15, lineHeight: 21, fontWeight: '900', textAlign: 'center' },
  footerText: { color: colors.black[100], fontSize: 12, lineHeight: 18, textAlign: 'center' },
  error: { color: colors.red[200], fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'center' },
  retryButton: { alignSelf: 'stretch', marginTop: spacing.sm },
  permissionState: { flex: 1, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  permissionIcon: { width: 64, height: 64, borderRadius: radii.lg, backgroundColor: colors.red[50], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  permissionTitle: { color: colors.black[950], fontSize: 21, fontWeight: '900', textAlign: 'center' },
  permissionText: { color: colors.black[500], fontSize: 13, lineHeight: 20, textAlign: 'center' },
  permissionButton: { alignSelf: 'stretch', marginTop: spacing.lg },
  textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg },
  textButtonLabel: { color: colors.black[700], fontSize: 13, fontWeight: '800' },
});
