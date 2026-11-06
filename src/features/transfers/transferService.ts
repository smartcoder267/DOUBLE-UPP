import { supabase } from '../../services/supabase/client';
import { createPaymentIdempotencyKey, paymentErrorMessage } from '../payments/paymentService';
import type { RecipientPreview, TransferResult } from './types';

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The backend returned an invalid response.');
  return value as Record<string, unknown>;
}

export { paymentErrorMessage };

export function normalizeRecipientPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('267')) return `+${digits}`;
  if (digits.startsWith('0')) return `+267${digits.slice(1)}`;
  if (digits.length === 8) return `+267${digits}`;
  return digits;
}

export async function resolveRecipient(phone: string): Promise<RecipientPreview> {
  const { data, error } = await supabase.rpc('resolve_recipient_by_phone', { p_recipient_phone: normalizeRecipientPhone(phone) });
  if (error) throw error;
  const result = asObject(data);
  if (typeof result.recipient_name !== 'string' || !result.recipient_name) throw new Error('recipient_not_found');
  return { recipient_name: result.recipient_name };
}

export async function sendMoneyToUser(phone: string, amountMinor: number, idempotencyKey = createPaymentIdempotencyKey()): Promise<TransferResult> {
  const { data, error } = await supabase.rpc('send_money_to_user', {
    p_recipient_phone: normalizeRecipientPhone(phone),
    p_amount_minor: amountMinor,
    p_idempotency_key: idempotencyKey,
  });
  if (error) throw error;
  const result = asObject(data);
  if (typeof result.transaction_id !== 'string' || typeof result.status !== 'string' || typeof result.recipient_name !== 'string' || typeof result.sender_balance_minor !== 'number' || typeof result.recipient_balance_minor !== 'number') {
    throw new Error('The backend returned an invalid transfer response.');
  }
  return {
    transaction_id: result.transaction_id,
    status: result.status,
    recipient_name: result.recipient_name,
    sender_balance_minor: result.sender_balance_minor,
    recipient_balance_minor: result.recipient_balance_minor,
    duplicate: result.duplicate === true,
  };
}
