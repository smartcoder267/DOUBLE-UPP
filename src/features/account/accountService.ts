import { supabase } from '../../services/supabase/client';
import type { Tables } from '../../types/supabase';

export type ProfileSummary = Pick<Tables<'profiles'>, 'first_name' | 'last_name' | 'phone' | 'phone_verification_mode' | 'phone_verification_status'>;
export type WalletSummary = Pick<Tables<'wallets'>, 'id' | 'currency' | 'status'>;
export type WalletBalanceSummary = Pick<Tables<'wallet_balances'>, 'available_balance_minor' | 'last_entry_at'>;
export type LedgerEntrySummary = Pick<Tables<'wallet_ledger_entries'>, 'id' | 'amount_minor' | 'entry_kind' | 'description' | 'created_at'>;

export type AccountSummary = {
  profile: ProfileSummary | null;
  wallet: WalletSummary | null;
  balance: WalletBalanceSummary | null;
  ledgerEntries: LedgerEntrySummary[];
};

export async function loadAccountSummary(userId: string): Promise<AccountSummary> {
  const [profileResult, walletResult, balanceResult] = await Promise.all([
    supabase.from('profiles').select('first_name,last_name,phone,phone_verification_mode,phone_verification_status').eq('id', userId).maybeSingle(),
    supabase.from('wallets').select('id,currency,status').eq('user_id', userId).maybeSingle(),
    supabase.from('wallet_balances').select('available_balance_minor,last_entry_at').eq('user_id', userId).maybeSingle(),
  ]);

  const error = profileResult.error ?? walletResult.error ?? balanceResult.error;
  if (error) throw new Error(error.message);

  let ledgerEntries: LedgerEntrySummary[] = [];
  if (walletResult.data) {
    const ledgerResult = await supabase
      .from('wallet_ledger_entries')
      .select('id,amount_minor,entry_kind,description,created_at')
      .eq('wallet_id', walletResult.data.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (ledgerResult.error) throw new Error(ledgerResult.error.message);
    ledgerEntries = ledgerResult.data;
  }

  return { profile: profileResult.data, wallet: walletResult.data, balance: balanceResult.data, ledgerEntries };
}
