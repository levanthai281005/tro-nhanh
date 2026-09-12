'use client';

import { useQuery } from '@tanstack/react-query';
import { ROOM_QUERY_KEYS } from '@/features/workspace/constants/workspaceQueryKeys';
import { getRoomOverview } from '@/features/workspace/services/roomOverviewService';

/** `staleTime: 0` — cùng lý do đã ghi ở `useProperties`: kho mock nằm trong từng tiến trình. */
// TODO: bỏ `staleTime: 0` khi nối API thật.
export function useRoomOverview(roomId: string, sellerId: string) {
  return useQuery({
    queryKey: ROOM_QUERY_KEYS.overview(roomId),
    queryFn: () => getRoomOverview(roomId, sellerId),
    staleTime: 0,
  });
}
