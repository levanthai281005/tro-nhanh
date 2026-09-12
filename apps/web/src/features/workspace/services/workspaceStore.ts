import type { Contract } from '@/features/workspace/types/contract';
import type { Invoice, Payment } from '@/features/workspace/types/invoice';
import type { Occupancy } from '@/features/workspace/types/occupancy';
import { isActiveOccupancy } from '@/features/workspace/types/occupancy';
import type { Property } from '@/features/workspace/types/property';
import type { Room, RoomListItem } from '@/features/workspace/types/room';
import type { UtilityReading } from '@/features/workspace/types/utilityReading';
import { MOCK_CONTRACTS } from '@/features/workspace/constants/mockContracts';
import { MOCK_INVOICES, MOCK_PAYMENTS } from '@/features/workspace/constants/mockInvoices';
import { MOCK_OCCUPANCIES } from '@/features/workspace/constants/mockOccupancies';
import { MOCK_UTILITY_READINGS } from '@/features/workspace/constants/mockUtilityReadings';
import { MOCK_PROPERTIES, MOCK_ROOMS } from '@/features/workspace/constants/mockWorkspaceData';

/**
 * Kho dữ liệu tạm cho phiên demo, để mutation có hiệu lực thật mà không phải sửa file mock.
 *
 * Khi nối API thật thì **bỏ hẳn** file này — service gọi thẳng backend. Đặt riêng thay vì nhét
 * vào từng service vì cả khu trọ lẫn phòng cùng đọc/ghi một trạng thái (thêm phòng phải làm
 * đổi số liệu trên thẻ khu).
 */

interface StoredRoom extends Room {
  hasActiveListing: boolean;
  hasActiveContract: boolean;
}

const properties = new Map<string, Property>(MOCK_PROPERTIES.map((item) => [item.id, item]));
const rooms = new Map<string, StoredRoom>(MOCK_ROOMS.map((item) => [item.id, item]));
const occupancies = new Map<string, Occupancy>(MOCK_OCCUPANCIES.map((item) => [item.id, item]));
const contracts = new Map<string, Contract>(MOCK_CONTRACTS.map((item) => [item.id, item]));
const utilityReadings = new Map<string, UtilityReading>(
  MOCK_UTILITY_READINGS.map((item) => [item.id, item]),
);
const invoices = new Map<string, Invoice>(MOCK_INVOICES.map((item) => [item.id, item]));
const payments = new Map<string, Payment>(MOCK_PAYMENTS.map((item) => [item.id, item]));

/**
 * Ghép người ở đang hoạt động vào phòng.
 *
 * `Occupancy` là bảng riêng — cùng hình dạng với DB thật, và là điều kiện để B10 sửa được
 * người ở mà không phải lôi cả bản ghi phòng ra ghi lại.
 */
function toRoomListItem(room: StoredRoom): RoomListItem {
  return { ...room, occupants: listActiveOccupancies(room.id) };
}

const MOCK_REQUEST_DELAY_MS = 180;

export function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

export function listProperties(sellerId: string): Property[] {
  return [...properties.values()]
    .filter((item) => item.sellerId === sellerId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function findProperty(propertyId: string): Property | undefined {
  return properties.get(propertyId);
}

export function saveProperty(property: Property): void {
  properties.set(property.id, property);
}

/**
 * Xóa khu khỏi danh sách quản lý.
 *
 * Backend thật là **xóa mềm** (`deletedAt`) — hóa đơn, hợp đồng và đánh giá cũ phải còn
 * nguyên. Ở kho mock chưa có khái niệm cột nên bỏ khỏi Map; phòng thuộc khu cũng được gỡ để
 * số liệu tổng không đếm nhầm.
 */
export function removeProperty(propertyId: string): void {
  properties.delete(propertyId);
  for (const room of listRooms(propertyId)) {
    rooms.delete(room.id);
  }
}

export function listRooms(propertyId: string): RoomListItem[] {
  return [...rooms.values()].filter((item) => item.propertyId === propertyId).map(toRoomListItem);
}

export function listRoomsBySeller(sellerId: string): RoomListItem[] {
  const ownedIds = new Set(listProperties(sellerId).map((item) => item.id));
  return [...rooms.values()].filter((item) => ownedIds.has(item.propertyId)).map(toRoomListItem);
}

export function findRoom(roomId: string): RoomListItem | undefined {
  const room = rooms.get(roomId);
  return room ? toRoomListItem(room) : undefined;
}

export function saveRoom(room: RoomListItem): void {
  // Chép tường minh các cột của phòng: `occupants` là dữ liệu ghép lúc đọc chứ không phải cột,
  // lưu kèm thì có hai bản của cùng một sự thật và chúng sẽ lệch nhau.
  rooms.set(room.id, {
    id: room.id,
    propertyId: room.propertyId,
    roomCode: room.roomCode,
    floor: room.floor,
    area: room.area,
    price: room.price,
    status: room.status,
    note: room.note,
    amenities: room.amenities,
    electricityPrice: room.electricityPrice,
    waterPrice: room.waterPrice,
    servicePrice: room.servicePrice,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    hasActiveListing: room.hasActiveListing,
    hasActiveContract: room.hasActiveContract,
  });
}

export function removeRoom(roomId: string): void {
  rooms.delete(roomId);
  for (const item of listOccupancies(roomId)) {
    occupancies.delete(item.id);
  }
}

// ── Occupancy ───────────────────────────────────────────────────────────────────────────

/** Mọi bản ghi của phòng, kể cả đã kết thúc. Mới nhất trước. */
export function listOccupancies(roomId: string): Occupancy[] {
  return [...occupancies.values()]
    .filter((item) => item.roomId === roomId)
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
}

/** Chỉ người đang ở — dùng để ghép vào phòng và đếm số khách. */
export function listActiveOccupancies(roomId: string): Occupancy[] {
  return listOccupancies(roomId).filter((item) => isActiveOccupancy(item));
}

export function findOccupancy(occupancyId: string): Occupancy | undefined {
  return occupancies.get(occupancyId);
}

export function saveOccupancy(occupancy: Occupancy): void {
  occupancies.set(occupancy.id, occupancy);
}

/** Id tạm cho bản ghi tạo trong phiên demo. Backend thật sinh uuid của nó. */
export function createLocalId(): string {
  return crypto.randomUUID();
}

// ── Contract ────────────────────────────────────────────────────────────────────────────

/** Mọi hợp đồng của phòng, mới nhất trước. */
export function listContracts(roomId: string): Contract[] {
  return [...contracts.values()]
    .filter((item) => item.roomId === roomId)
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
}

/** Hợp đồng của toàn bộ khu thuộc một seller — nguồn cho màn danh sách B11. */
export function listContractsBySeller(sellerId: string): Contract[] {
  const ownedRoomIds = new Set(listRoomsBySeller(sellerId).map((room) => room.id));
  return [...contracts.values()]
    .filter((item) => ownedRoomIds.has(item.roomId))
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
}

export function findContract(contractId: string): Contract | undefined {
  return contracts.get(contractId);
}

export function saveContract(contract: Contract): void {
  contracts.set(contract.id, contract);
}

// ── UtilityReading ──────────────────────────────────────────────────────────────────────

/** Mọi chỉ số của một phòng, kỳ mới nhất trước. */
export function listUtilityReadings(roomId: string): UtilityReading[] {
  return [...utilityReadings.values()]
    .filter((item) => item.roomId === roomId)
    .sort((left, right) => right.period.localeCompare(left.period));
}

export function findUtilityReading(
  roomId: string,
  type: UtilityReading['type'],
  period: string,
): UtilityReading | undefined {
  return [...utilityReadings.values()].find(
    (item) => item.roomId === roomId && item.type === type && item.period === period,
  );
}

/**
 * Chỉ số cuối của **kỳ liền trước**, không phải bản ghi tạo gần nhất.
 *
 * Prototype lấy `order by created_at desc limit 1`. Chỉ cần ghi bù một kỳ cũ sau khi đã ghi kỳ
 * mới là "chỉ số cũ" trả về số của tương lai, và số tiêu thụ ra âm — mà chẳng có lỗi nào hiện
 * lên. Kỳ là chuỗi `YYYY-MM` nên so sánh chuỗi là so sánh đúng thứ tự thời gian.
 */
export function findPreviousUtilityReading(
  roomId: string,
  type: UtilityReading['type'],
  period: string,
): UtilityReading | undefined {
  return listUtilityReadings(roomId)
    .filter((item) => item.type === type && item.period < period)
    .at(0);
}

export function saveUtilityReading(reading: UtilityReading): void {
  utilityReadings.set(reading.id, reading);
}

// ── Invoice · Payment ───────────────────────────────────────────────────────────────────

export function listInvoicesBySeller(sellerId: string): Invoice[] {
  const ownedRoomIds = new Set(listRoomsBySeller(sellerId).map((room) => room.id));
  return [...invoices.values()]
    .filter((item) => ownedRoomIds.has(item.roomId))
    .sort(
      (left, right) =>
        right.period.localeCompare(left.period) || right.createdAt.localeCompare(left.createdAt),
    );
}

/** Hóa đơn của một phòng, kỳ mới nhất trước — nguồn cho màn chi tiết phòng (B9). */
export function listInvoicesByRoom(roomId: string): Invoice[] {
  return [...invoices.values()]
    .filter((item) => item.roomId === roomId)
    .sort(
      (left, right) =>
        right.period.localeCompare(left.period) || right.createdAt.localeCompare(left.createdAt),
    );
}

/** Hóa đơn của một hợp đồng — nguồn kiểm unique (contractId, period). */
export function listInvoicesByContract(contractId: string): Invoice[] {
  return [...invoices.values()].filter((item) => item.contractId === contractId);
}

export function findInvoice(invoiceId: string): Invoice | undefined {
  return invoices.get(invoiceId);
}

export function saveInvoice(invoice: Invoice): void {
  invoices.set(invoice.id, invoice);
}

export function listPayments(invoiceId: string): Payment[] {
  return [...payments.values()]
    .filter((item) => item.invoiceId === invoiceId)
    .sort((left, right) => left.paidAt.localeCompare(right.paidAt));
}

export function savePayment(payment: Payment): void {
  payments.set(payment.id, payment);
}
