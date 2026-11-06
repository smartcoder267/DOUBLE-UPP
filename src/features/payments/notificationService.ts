import { supabase } from '../../services/supabase/client';
import type { InAppNotification } from './types';

export function subscribeToInAppNotifications(userId: string, onNotification: (notification: InAppNotification) => void) {
  const channel = supabase
    .channel(`user-notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${userId}` },
      (payload) => onNotification(payload.new as InAppNotification),
    )
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}
