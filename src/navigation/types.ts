import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type PersonalTabId = 'home' | 'pay' | 'requests' | 'activity' | 'profile';

export type NavigationItem<TId extends string = string> = {
  id: TId;
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
};
