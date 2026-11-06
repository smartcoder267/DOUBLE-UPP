import React from 'react';
import { RecentActivity } from '../../features/home/RecentActivity';
import type { HomeActivity } from '../../features/home/types';
import { TabScreen } from '../../components/layout/TabScreen';

type ActivityScreenProps = {
  activity: HomeActivity[];
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  onActivity: (activity: HomeActivity) => void;
};

export function ActivityScreen({ activity, loading, error, onRetry, onActivity }: ActivityScreenProps) {
  return (
    <TabScreen eyebrow="WALLET RECORDS" title="Activity" description="Track completed, pending and failed wallet transactions in one place.">
      <RecentActivity title="All activity" showViewAll={false} activity={activity} loading={loading} error={error} onRetry={onRetry} onViewAll={() => undefined} onActivity={onActivity} />
    </TabScreen>
  );
}
