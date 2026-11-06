import type { NavigationItem, PersonalTabId } from '../types';

export const personalNavigation: readonly NavigationItem<PersonalTabId>[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'pay', label: 'Pay', icon: 'maximize' },
  { id: 'requests', label: 'Requests', icon: 'inbox' },
  { id: 'activity', label: 'Activity', icon: 'clock' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];
