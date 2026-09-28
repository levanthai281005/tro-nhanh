import { hasDateRangeOverlap } from '@tronhanh/schemas';
import {
  createLocalId,
  findContract,
  findOccupancy,
  findProperty,
  findRoom,
  listContracts,
  listContractsBySeller,
  listRoomsBySeller,
  saveContract,
  saveRoom,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type {
  Contract,
  ContractListItem,
  ContractRoomOption,
  CreateContractInput,
} from '@/features/workspace/types/contract';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysUntil(isoDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return Math.round((Date.parse(isoDate) - Date.parse(today)) / MS_PER_DAY);
}

/** Gộp tên phòng, khu và người đại diện vào một dòng danh sách. */
function toListItem(contract: Contract): ContractListItem | null {
  const room = findRoom(contract.roomId);
  const property = room ? findProperty(room.propertyId) : undefined;
  const occupancy = findOccupancy(contract.occupancyId);
  if (!room || !property) return null;

  return {
    ...contract,
    roomCode: room.roomCode,
    propertyId: property.id,
    propertyName: property.name,
    occupantName: occupancy?.fullName ?? 'Không rõ',
    occupantPhone: occupancy?.phoneNumber ?? '',
    daysRemaining: daysUntil(contract.endDate),
  };
}

// TODO: nối API thật khi có endpoint thật: GET /management/contracts.
export async function getContractsBySeller(
  sellerId: string | undefined,
): Promise<readonly ContractListItem[]> {
  await waitForMockRequest();
  if (!sellerId) return [];

  return listContractsBySeller(sellerId)
    .map(toListItem)
    .filter((item): item is ContractListItem => item !== null);
}

// TODO: nối API thật khi có endpoint thật: GET /management/contracts/{id}.
export async function getContractById(contractId: string): Promise<ContractListItem | null> {
  await waitForMockRequest();
  const contract = findContract(contractId);
  return contract ? toListItem(contract) : null;
}

/**
 * Tạo hợp đồng — BR-006 và BR-031.
 *
 * Hai luật đi liền nhau và **phải cùng một transaction** ở backend:
 * - BR-006: mỗi Room tối đa một hợp đồng `Active`, và không hợp đồng nào được chồng lấn thời
 *   gian với hợp đồng `Active` khác của cùng phòng.
 * - BR-031: hợp đồng `Active` được tạo → Room tự chuyển `Rented`.
 *
 * Kiểm ở đây chỉ để báo lỗi tử tế bằng tiếng Việt. **Biên thật là ràng buộc `EXCLUDE` ở
 * database** — hai request gửi cùng lúc đều đọc thấy "chưa có hợp đồng chồng lấn" rồi cùng ghi.
 */
// TODO: nối API thật khi có endpoint thật: POST /management/rooms/{id}/contracts.
export async function createContract(input: CreateContractInput): Promise<Contract> {
  await waitForMockRequest();

  const room = findRoom(input.roomId);
  if (!room) throw new Error('Không tìm thấy phòng.');

  const occupancy = findOccupancy(input.occupancyId);
  if (!occupancy || occupancy.roomId !== input.roomId) {
    throw new Error('Người đại diện phải là người đang ở chính phòng này.');
  }

  const conflicting = listContracts(input.roomId).find(
    (item) =>
      item.status === 'Active' &&
      hasDateRangeOverlap(item, { startDate: input.startDate, endDate: input.endDate }),
  );
  if (conflicting) {
    throw new Error(
      `Phòng đã có hợp đồng hiệu lực từ ${conflicting.startDate} đến ${conflicting.endDate}. Hãy chấm dứt hợp đồng đó trước, hoặc chọn khoảng thời gian khác.`,
    );
  }

  const timestamp = new Date().toISOString();
  const contract: Contract = {
    id: createLocalId(),
    roomId: input.roomId,
    occupancyId: input.occupancyId,
    startDate: input.startDate,
    endDate: input.endDate,
    rentPrice: input.rentPrice,
    deposit: input.deposit,
    status: 'Active',
    terminateReason: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveContract(contract);

  // BR-031 — cùng transaction ở backend. Phòng đang `Available`/`Deposited` chuyển sang
  // `Rented`; phòng `Hidden` thì không đụng tới, vì chủ trọ đang cố ý ẩn nó.
  if (room.status === 'Available' || room.status === 'Deposited') {
    saveRoom({ ...room, status: 'Rented', hasActiveContract: true, updatedAt: timestamp });
  } else {
    saveRoom({ ...room, hasActiveContract: true, updatedAt: timestamp });
  }

  return contract;
}

/**
 * Gia hạn — dời `endDate`, giữ nguyên người đại diện và toàn bộ hóa đơn cũ.
 *
 * Vẫn phải kiểm chồng lấn: dời hạn về sau có thể đè lên một hợp đồng `Active` khác đã ký
 * trước cho khoảng thời gian đó.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /management/contracts/{id}.
export async function extendContract(contractId: string, newEndDate: string): Promise<Contract> {
  await waitForMockRequest();

  const current = findContract(contractId);
  if (!current) throw new Error('Không tìm thấy hợp đồng.');
  if (current.status !== 'Active') {
    throw new Error('Chỉ gia hạn được hợp đồng đang hiệu lực.');
  }
  if (newEndDate <= current.endDate) {
    throw new Error('Ngày kết thúc mới phải sau ngày kết thúc hiện tại.');
  }

  const conflicting = listContracts(current.roomId).find(
    (item) =>
      item.id !== current.id &&
      item.status === 'Active' &&
      hasDateRangeOverlap(item, { startDate: current.startDate, endDate: newEndDate }),
  );
  if (conflicting) {
    throw new Error('Gia hạn tới ngày này sẽ chồng lấn với một hợp đồng khác của phòng.');
  }

  const updated: Contract = {
    ...current,
    endDate: newEndDate,
    updatedAt: new Date().toISOString(),
  };
  saveContract(updated);
  return updated;
}

/**
 * Chấm dứt sớm — BR-006, kèm BR-031.
 *
 * Room **không** tự về `Available`: chủ trọ có thể đang dọn hoặc sửa phòng. BR-031 yêu cầu
 * đúng một gợi ý một chạm, nên chỗ này chỉ gỡ cờ `hasActiveContract` và để UI mời đổi trạng
 * thái phòng.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /management/contracts/{id}.
export async function terminateContract(
  contractId: string,
  terminateReason: string,
): Promise<Contract> {
  await waitForMockRequest();

  const current = findContract(contractId);
  if (!current) throw new Error('Không tìm thấy hợp đồng.');
  if (current.status !== 'Active') {
    throw new Error('Chỉ chấm dứt được hợp đồng đang hiệu lực.');
  }
  if (terminateReason.trim() === '') {
    throw new Error('Vui lòng ghi lý do chấm dứt hợp đồng.');
  }

  const updated: Contract = {
    ...current,
    status: 'Terminated',
    terminateReason: terminateReason.trim(),
    updatedAt: new Date().toISOString(),
  };
  saveContract(updated);

  const room = findRoom(current.roomId);
  if (room) {
    const stillHasActive = listContracts(current.roomId).some(
      (item) => item.id !== current.id && item.status === 'Active',
    );
    saveRoom({ ...room, hasActiveContract: stillHasActive });
  }

  return updated;
}

/**
 * Danh sách phòng để chọn khi tạo hợp đồng, kèm người ở đang hoạt động của từng phòng.
 *
 * Trả về **cả phòng đã có hợp đồng Active** thay vì lọc bỏ: chủ trọ cần thấy phòng đó và
 * hiểu vì sao chưa chọn được (BR-006), chứ không phải tự hỏi tại sao phòng biến mất.
 */
// TODO: nối API thật khi có endpoint thật — backend gộp sẵn trong GET rooms.
export async function getContractRoomOptions(
  sellerId: string,
): Promise<readonly ContractRoomOption[]> {
  await waitForMockRequest();

  return listRoomsBySeller(sellerId).map((room) => {
    const property = findProperty(room.propertyId);
    return {
      roomId: room.id,
      roomCode: room.roomCode,
      propertyId: room.propertyId,
      propertyName: property?.name ?? '',
      defaultRentPrice: room.price,
      hasActiveContract: listContracts(room.id).some((item) => item.status === 'Active'),
      occupants: room.occupants.map((occupant) => ({
        occupancyId: occupant.id,
        fullName: occupant.fullName,
        phoneNumber: occupant.phoneNumber,
        isContractRepresentative: occupant.isContractRepresentative,
      })),
    };
  });
}
