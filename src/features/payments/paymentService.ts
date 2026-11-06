import { supabase } from '../../services/supabase/client';
import type { CreatedPaymentRequest, PaymentPreview, PaymentRequest, PaymentResult } from './types';

const QR_PREFIX = 'doubleup://pay-request/';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The backend returned an invalid response.');
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`The backend response is missing ${field}.`);
  return value;
}

function requiredNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`The backend response is missing ${field}.`);
  return value;
}

function parseCreatedRequest(value: unknown): CreatedPaymentRequest {
  const data = asObject(value);
  return {
    id: requiredString(data.id, 'request ID'),
    service: requiredString(data.service, 'service'),
    amount_minor: requiredNumber(data.amount_minor, 'amount'),
    payment_pin: requiredString(data.payment_pin, 'payment PIN'),
    qr_token: requiredString(data.qr_token, 'QR token'),
    qr_payload: requiredString(data.qr_payload, 'QR payload'),
    status: requiredString(data.status, 'status'),
    created_at: requiredString(data.created_at, 'created time'),
  };
}

function parsePreview(value: unknown): PaymentPreview {
  const data = asObject(value);
  if (typeof data.error === 'string') throw new Error(data.error);
  return {
    id: requiredString(data.id, 'request ID'),
    receiver_name: requiredString(data.receiver_name, 'receiver'),
    service: requiredString(data.service, 'service'),
    amount_minor: requiredNumber(data.amount_minor, 'amount'),
    status: requiredString(data.status, 'status'),
    created_at: requiredString(data.created_at, 'created time'),
  };
}

function parsePaymentResult(value: unknown): PaymentResult {
  const data = asObject(value);
  return {
    transaction_id: requiredString(data.transaction_id, 'transaction ID'),
    status: requiredString(data.status, 'status'),
    request_status: typeof data.request_status === 'string' ? data.request_status : undefined,
    payer_balance_minor: requiredNumber(data.payer_balance_minor, 'payer balance'),
    receiver_balance_minor: requiredNumber(data.receiver_balance_minor, 'receiver balance'),
    duplicate: data.duplicate === true,
  };
}

export function createPaymentIdempotencyKey() {
  let seed = Date.now();
  let performanceSeed = typeof performance !== 'undefined' && Number.isFinite(performance.now()) ? performance.now() * 1000 : 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    let randomValue = Math.random() * 16;
    if (seed > 0) {
      randomValue = (seed + randomValue) % 16;
      seed = Math.floor(seed / 16);
    } else {
      randomValue = (performanceSeed + randomValue) % 16;
      performanceSeed = Math.floor(performanceSeed / 16);
    }
    const nibble = character === 'x' ? Math.floor(randomValue) : (Math.floor(randomValue) & 0x3) | 0x8;
    return nibble.toString(16);
  });
}

export function paymentErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('insufficient_funds')) return 'Your available balance is too low for this payment.';
  if (message.includes('payment_request_unavailable')) return 'This payment request is no longer available.';
  if (message.includes('cannot_pay_own_request')) return 'You cannot pay a request from your own wallet.';
  if (message.includes('payment_pin_rate_limited')) return 'Too many PIN attempts. Wait five minutes and try again.';
  if (message.includes('invalid_payment_pin')) return 'Enter a valid six digit payment PIN.';
  if (message.includes('active_wallet_not_found')) return 'Your active personal wallet could not be found.';
  if (message.includes('network') || message.includes('fetch')) return 'Double Up could not connect. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export async function createPaymentRequest(service: string, amountMinor: number) {
  const { data, error } = await supabase.rpc('create_payment_request', { p_service: service, p_amount_minor: amountMinor });
  if (error) throw error;
  return parseCreatedRequest(data);
}

export async function listMyPaymentRequests(): Promise<PaymentRequest[]> {
  const { data, error } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return data;
}

export async function resolvePaymentRequestQr(payload: string) {
  if (!payload.startsWith(QR_PREFIX)) throw new Error('payment_request_unavailable');
  const token = payload.slice(QR_PREFIX.length).trim();
  if (!UUID_PATTERN.test(token)) throw new Error('payment_request_unavailable');
  const { data, error } = await supabase.rpc('resolve_payment_request_qr', { p_qr_token: token });
  if (error) throw error;
  return parsePreview(data);
}

export async function resolvePaymentRequestPin(pin: string) {
  const { data, error } = await supabase.rpc('resolve_payment_request_pin', { p_payment_pin: pin });
  if (error) throw error;
  return parsePreview(data);
}

export async function confirmPaymentRequest(requestId: string, idempotencyKey = createPaymentIdempotencyKey()) {
  const { data, error } = await supabase.rpc('confirm_payment_request', { p_request_id: requestId, p_idempotency_key: idempotencyKey });
  if (error) throw error;
  return parsePaymentResult(data);
}

export async function setPaymentRequestReuse(requestId: string, additionalCount: number) {
  const { data, error } = await supabase.rpc('set_payment_request_reuse', { p_request_id: requestId, p_additional_count: additionalCount });
  if (error) throw error;
  return asObject(data);
}
