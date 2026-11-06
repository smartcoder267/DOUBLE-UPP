import type { Tables } from '../../types/supabase';

export type PaymentRequest = Tables<'payment_requests'>;

export type CreatedPaymentRequest = {
  id: string;
  service: string;
  amount_minor: number;
  payment_pin: string;
  qr_token: string;
  qr_payload: string;
  status: string;
  created_at: string;
};

export type PaymentPreview = {
  id: string;
  receiver_name: string;
  service: string;
  amount_minor: number;
  status: string;
  created_at: string;
};

export type PaymentResult = {
  transaction_id: string;
  status: string;
  request_status?: string;
  payer_balance_minor: number;
  receiver_balance_minor: number;
  duplicate: boolean;
};

export type InAppNotification = Tables<'user_notifications'>;
