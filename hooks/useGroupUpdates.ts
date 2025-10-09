import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseGroupUpdatesOptions {
  tripIds: string[];
  enabled?: boolean;
}

export function useGroupUpdates({ tripIds, enabled = true }: UseGroupUpdatesOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const utils = trpc.useContext();
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || tripIds.length === 0) return;

    const channels: RealtimeChannel[] = [];

    // Subscribe to groups table changes
    const groupsChannel = supabase
      .channel('groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'groups',
          filter: `trip_id=in.(${tripIds.join(',')})`,
        },
        (payload) => {
          console.log('Groups change:', payload);
          // Invalidate trips query to refetch with new data
          utils.trips.list.invalidate();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channels.push(groupsChannel);

    // Subscribe to group_memberships table changes
    const membershipsChannel = supabase
      .channel('memberships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_memberships',
        },
        (payload) => {
          console.log('Memberships change:', payload);
          // Invalidate trips query to refetch
          utils.trips.list.invalidate();
        }
      )
      .subscribe();

    channels.push(membershipsChannel);

    // Cleanup on unmount
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [enabled, tripIds.join(','), supabase, utils]);

  return { isConnected };
}
