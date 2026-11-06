import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type HomeActionId = 'send' | 'pay' | 'receive' | 'deposit' | 'withdraw';

export type HomeAction = {
  id: HomeActionId;
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
};

export type HomeActivity = {
  id: string;
  title: string;
  description: string;
  amount: number;
  direction: 'credit' | 'debit';
  timestampLabel: string;
  status: 'completed' | 'pending' | 'failed';
};
