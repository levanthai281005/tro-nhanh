'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomStatus } from '@tronhanh/schemas';
import {
  PROPERTY_QUERY_KEYS,
  ROOM_QUERY_KEYS,
} from '@/features/workspace/constants/workspaceQueryKeys';
import {
  createRoom,
  deleteRoom,
  getRoomsByProperty,
  setRoomStatus,
  updateRoom,
  type RoomWriteInput,
} from '@/features/workspace/services/roomsService';

/** `staleTime: 0` — cùng lý do đã ghi ở `useProperties`: kho mock nằm trong từng tiến trình. */
// TODO: bỏ `staleTime: 0` khi nối API thật.
export function useRooms(propertyId: string) {
  return useQuery({
    queryKey: ROOM_QUERY_KEYS.byProperty(propertyId),
    queryFn: () => getRoomsByProperty(propertyId),
    staleTime: 0,
  });
}

/**
 * Mọi mutation về phòng đều phải làm mới **cả** danh sách khu: số "x phòng · y trống" trên
 * thẻ khu ở B6 lấy từ chính dữ liệu này. Quên bước đó thì thêm phòng xong quay lại B6 vẫn
 * thấy số cũ, và người dùng tưởng thao tác hỏng.
 *
 * Làm mới **cả nhánh** `ROOM_QUERY_KEYS.all`, không riêng `byProperty`: cùng một phòng còn
 * được đọc qua `detail` và `overview` (B9). Truyền khóa hẹp là cái bẫy im lặng đã gặp ở B11 —
 * sửa phòng ở màn chi tiết xong, màn đó vẫn hiện số cũ mà không có gì báo.
 */
function useRoomMutation<TVariables, TResult>(
  propertyId: string,
  sellerId: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.list(sellerId) });
    },
  });
}

export function useCreateRoom(propertyId: string, sellerId: string) {
  return useRoomMutation(propertyId, sellerId, (input: RoomWriteInput) => createRoom(input));
}

export function useUpdateRoom(propertyId: string, sellerId: string) {
  return useRoomMutation(
    propertyId,
    sellerId,
    (variables: { roomId: string; input: RoomWriteInput }) =>
      updateRoom(variables.roomId, variables.input),
  );
}

export function useSetRoomStatus(propertyId: string, sellerId: string) {
  return useRoomMutation(
    propertyId,
    sellerId,
    (variables: { roomId: string; status: RoomStatus }) =>
      setRoomStatus(variables.roomId, variables.status),
  );
}

export function useDeleteRoom(propertyId: string, sellerId: string) {
  return useRoomMutation(propertyId, sellerId, (roomId: string) => deleteRoom(roomId));
}
