import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { TabScreen } from '../../components/layout/TabScreen';
import type { ProfileSummary, WalletSummary } from '../../features/account/accountService';
import { colors, radii, spacing } from '../../theme/tokens';

type ProfileScreenProps = {
  email?: string;
  profile: ProfileSummary | null;
  wallet: WalletSummary | null;
  loading?: boolean;
  signingOut?: boolean;
  onSignOut: () => void;
};

function DetailRow({ icon, label, value }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}><Feather name={icon} size={18} color={colors.black[700]} /></View>
      <View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
    </View>
  );
}

export function ProfileScreen({ email, profile, wallet, loading = false, signingOut = false, onSignOut }: ProfileScreenProps) {
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : loading ? 'Loading profile…' : 'Profile unavailable';
  const phoneStatus = profile?.phone_verification_status === 'simulated_verified' ? 'Prototype verified' : profile?.phone_verification_status ?? 'Unavailable';
  const walletStatus = wallet ? wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1) : '';

  return (
    <TabScreen eyebrow="YOUR ACCOUNT" title="Profile" description="Review the identity and wallet details connected to this personal account.">
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{profile?.first_name?.charAt(0).toUpperCase() || 'D'}</Text></View>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.testLabel}>Prototype account · Test funds only</Text>
      </View>

      <View style={styles.details}>
        <DetailRow icon="mail" label="Email" value={email ? email.toLowerCase() : 'Unavailable'} />
        <DetailRow icon="phone" label="Mobile number" value={profile?.phone || 'Unavailable'} />
        <DetailRow icon="shield" label="Phone verification" value={phoneStatus} />
        <DetailRow icon="credit-card" label="Personal wallet" value={wallet ? `${wallet.currency} · ${walletStatus}` : loading ? 'Loading wallet…' : 'Unavailable'} />
      </View>

      <PrimaryButton label="Sign out" variant="black" loading={signingOut} onPress={onSignOut} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.xs },
  avatar: { width: 72, height: 72, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.white, fontSize: 25, fontWeight: '900' },
  name: { color: colors.black[950], fontSize: 20, fontWeight: '900' },
  testLabel: { color: colors.black[400], fontSize: 11, fontWeight: '700' },
  details: { borderRadius: radii.lg, backgroundColor: colors.black[50], padding: spacing.md, gap: spacing.sm },
  detailRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailIcon: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  detailCopy: { flex: 1, gap: 3 },
  detailLabel: { color: colors.black[400], fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  detailValue: { color: colors.black[900], fontSize: 13, fontWeight: '800' },
});
