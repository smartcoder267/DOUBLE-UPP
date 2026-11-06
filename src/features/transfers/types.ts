export type RecipientPreview = { recipient_name: string };

export type TransferResult = {
  transaction_id: string;
  status: string;
  recipient_name: string;
  sender_balance_minor: number;
  recipient_balance_minor: number;
  duplicate: boolean;
};
