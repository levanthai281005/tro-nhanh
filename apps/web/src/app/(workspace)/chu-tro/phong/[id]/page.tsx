import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SurfaceGate } from '@/features/session/components/SurfaceGate';
import { MOCK_USER_ID } from '@/features/session/constants/mockSessionContext';
import { RoomDetailPage } from '@/features/workspace/components/room-detail/RoomDetailPage';
import { ROOM_QUERY_KEYS } from '@/features/workspace/constants/workspaceQueryKeys';
import { getPropertyById } from '@/features/workspace/services/propertiesService';
import { getRoomOverview } from '@/features/workspace/services/roomOverviewService';
import { getRoomById } from '@/features/workspace/services/roomsService';

interface RoomDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomById(id);

  return { title: room ? `Phòng ${room.roomCode}` : 'Chi tiết phòng' };
}

/** B9 — chi tiết phòng. `SCREENS_WORKSPACE.md`, Surface Workspace. */
export default async function RoomDetailRoute({ params }: RoomDetailRouteProps) {
  const { id } = await params;
  // TODO: nối AuthContext khi có; thay mock id bằng user.id từ session đã xác thực.
  const sellerId = MOCK_USER_ID;

  const room = await getRoomById(id);
  const property = room ? await getPropertyById(room.propertyId) : null;
  // BR-007 — quyền sở hữu kiểm qua khu chứa phòng. Route thì gõ thẳng id phòng của người khác
  // vào URL được, nên phải ra 404 chứ không được lộ cả mã phòng.
  if (!room || !property || property.sellerId !== sellerId) notFound();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ROOM_QUERY_KEYS.overview(id),
    queryFn: () => getRoomOverview(id, sellerId),
  });

  return (
    <SurfaceGate surface="workspace">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RoomDetailPage roomId={id} sellerId={sellerId} />
      </HydrationBoundary>
    </SurfaceGate>
  );
}
