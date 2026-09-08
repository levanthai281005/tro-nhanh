import { canTransitionRoomStatus, type RoomStatus } from '@tronhanh/schemas';
import type { RoomListItem, RoomsResult } from '@/features/workspace/types/room';
import {
  createLocalId,
  findRoom,
  listRooms,
  removeRoom,
  saveRoom,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';

export interface RoomWriteInput {
  propertyId: string;
  roomCode: string;
  floor: number;
  area: number;
  price: number;
  status: RoomStatus;
  note: string;
  amenities: readonly string[];
  electricityPrice: number | null;
  waterPrice: number | null;
  servicePrice: number | null;
}

function toCounts(rooms: readonly RoomListItem[]): RoomsResult['counts'] {
  return {
    all: rooms.length,
    Available: rooms.filter((room) => room.status === 'Available').length,
    Deposited: rooms.filter((room) => room.status === 'Deposited').length,
    Rented: rooms.filter((room) => room.status === 'Rented').length,
    Hidden: rooms.filter((room) => room.status === 'Hidden').length,
  };
}

// TODO: nối API thật khi packages/types sinh xong: GET /management/properties/{id}/rooms.
export async function getRoomsByProperty(propertyId: string): Promise<RoomsResult> {
  await waitForMockRequest();

  const items = listRooms(propertyId).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );

  return { items, counts: toCounts(items) };
}

// TODO: nối API thật khi packages/types sinh xong: GET /management/rooms/{id}.
export async function getRoomById(roomId: string): Promise<RoomListItem | null> {
  await waitForMockRequest();
  return findRoom(roomId) ?? null;
}

/**
 * `roomCode` phải unique trong phạm vi một khu (VALIDATION_RULES).
 *
 * Kiểm ở đây là để báo lỗi tử tế bằng tiếng Việt; **biên thật vẫn là ràng buộc unique ở
 * database** — hai tab mở song song vẫn có thể lách qua phép kiểm phía client này.
 */
function assertRoomCodeAvailable(propertyId: string, roomCode: string, exceptRoomId?: string) {
  const normalized = roomCode.trim().toLowerCase();
  const duplicated = listRooms(propertyId).some(
    (room) => room.id !== exceptRoomId && room.roomCode.trim().toLowerCase() === normalized,
  );
  if (duplicated) {
    throw new Error(`Mã phòng "${roomCode.trim()}" đã tồn tại trong khu này.`);
  }
}

// TODO: nối API thật khi packages/types sinh xong: POST /management/properties/{id}/rooms.
export async function createRoom(input: RoomWriteInput): Promise<RoomListItem> {
  await waitForMockRequest();
  assertRoomCodeAvailable(input.propertyId, input.roomCode);

  const timestamp = new Date().toISOString();
  const room: RoomListItem = {
    id: createLocalId(),
    propertyId: input.propertyId,
    roomCode: input.roomCode.trim(),
    floor: input.floor,
    area: input.area,
    price: input.price,
    status: input.status,
    note: input.note.trim() || null,
    amenities: [...input.amenities],
    electricityPrice: input.electricityPrice,
    waterPrice: input.waterPrice,
    servicePrice: input.servicePrice,
    createdAt: timestamp,
    updatedAt: timestamp,
    occupants: [],
    hasActiveListing: false,
    hasActiveContract: false,
  };

  saveRoom(room);
  return room;
}

// TODO: nối API thật khi packages/types sinh xong: PUT /management/rooms/{id}.
export async function updateRoom(roomId: string, input: RoomWriteInput): Promise<RoomListItem> {
  await waitForMockRequest();

  const current = findRoom(roomId);
  if (!current) throw new Error('Không tìm thấy phòng.');
  assertRoomCodeAvailable(current.propertyId, input.roomCode, roomId);

  const updated: RoomListItem = {
    ...current,
    roomCode: input.roomCode.trim(),
    floor: input.floor,
    area: input.area,
    price: input.price,
    status: input.status,
    note: input.note.trim() || null,
    amenities: [...input.amenities],
    electricityPrice: input.electricityPrice,
    waterPrice: input.waterPrice,
    servicePrice: input.servicePrice,
    updatedAt: new Date().toISOString(),
  };

  saveRoom(updated);
  return updated;
}

/**
 * Đổi trạng thái phòng — BR-002 cho chuyển hợp lệ, BR-027 cho hệ quả lên tin đăng.
 *
 * Chuyển sang `Rented` khi phòng còn tin đang chạy thì backend sẽ tự chuyển tin sang `Rented`
 * trong **cùng transaction** và bắn Notification `ListingAutoRented`. Client chỉ cảnh báo
 * trước, không tự sửa tin — `RentalListing` thuộc Surface khác.
 */
// TODO: nối API thật khi packages/types sinh xong: PATCH /management/rooms/{id}/status.
export async function setRoomStatus(roomId: string, status: RoomStatus): Promise<RoomListItem> {
  await waitForMockRequest();

  const current = findRoom(roomId);
  if (!current) throw new Error('Không tìm thấy phòng.');
  if (!canTransitionRoomStatus(current.status, status)) {
    throw new Error('Không chuyển trực tiếp giữa hai trạng thái này được.');
  }

  const updated: RoomListItem = {
    ...current,
    status,
    // BR-027: phòng chuyển `Rented` thì tin gắn với nó cũng chuyển `Rented`, hết "đang chạy".
    hasActiveListing: status === 'Rented' ? false : current.hasActiveListing,
    updatedAt: new Date().toISOString(),
  };

  saveRoom(updated);
  return updated;
}

/** Xóa phòng chỉ được khi không còn hợp đồng `Active` (Module 6, BR-006). */
// TODO: nối API thật khi packages/types sinh xong: DELETE /management/rooms/{id}.
export async function deleteRoom(roomId: string): Promise<void> {
  await waitForMockRequest();

  const current = findRoom(roomId);
  if (!current) throw new Error('Không tìm thấy phòng.');
  if (current.hasActiveContract) {
    throw new Error('Phòng đang có hợp đồng hiệu lực nên chưa xóa được.');
  }

  removeRoom(roomId);
}
