import type { UtilityType } from '@tronhanh/schemas';
import { getContractsBySeller } from '@/features/workspace/services/contractsService';
import { getInvoicesByRoom } from '@/features/workspace/services/invoicesService';
import {
  findProperty,
  findRoom,
  listUtilityReadings,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type {
  ResolvedUnitPrice,
  RoomOverview,
  RoomReadingEntry,
  RoomReadingPeriod,
} from '@/features/workspace/types/roomOverview';
import {
  ROOM_OVERVIEW_INVOICE_LIMIT,
  ROOM_OVERVIEW_READING_LIMIT,
} from '@/features/workspace/types/roomOverview';

/**
 * Giải đơn giá ba tầng và **giữ lại nguồn** của nó.
 *
 * `??` chứ không `||`: phòng khai `0` (chủ bao điện) là dữ liệu hợp lệ, mà `0 || 3500` ra
 * `3500` — phòng miễn phí bị tính tiền điện, và không có lỗi nào hiện ra.
 */
function resolveUnitPrice(roomPrice: number | null, propertyPrice: number): ResolvedUnitPrice {
  return roomPrice === null
    ? { value: propertyPrice, source: 'property' }
    : { value: roomPrice, source: 'room' };
}

function toReadingEntry(reading: {
  previousReading: number;
  currentReading: number;
  unitPrice: number;
  invoiceId: string | null;
}): RoomReadingEntry {
  const consumption = reading.currentReading - reading.previousReading;

  return {
    previousReading: reading.previousReading,
    currentReading: reading.currentReading,
    consumption,
    unitPrice: reading.unitPrice,
    amount: consumption * reading.unitPrice,
    isInvoiced: reading.invoiceId !== null,
  };
}

/**
 * Gộp toàn bộ dữ liệu màn chi tiết phòng trong một lần gọi.
 *
 * Backend thật sẽ trả nguyên khối này ở `GET /management/rooms/{id}`; ở mock thì gộp tại đây
 * để component không phải tự tra năm bảng rồi ghép — cách chắc chắn để sinh N+1 và để hai
 * khối trên cùng màn lệch nhau.
 */
// TODO: nối API thật khi packages/types sinh xong: GET /management/rooms/{id}.
export async function getRoomOverview(
  roomId: string,
  sellerId: string,
): Promise<RoomOverview | null> {
  await waitForMockRequest();

  const room = findRoom(roomId);
  if (!room) return null;

  const property = findProperty(room.propertyId);
  if (!property) return null;

  const [contracts, invoices] = await Promise.all([
    getContractsBySeller(sellerId),
    getInvoicesByRoom(roomId),
  ]);

  const roomContracts = contracts.filter((item) => item.roomId === roomId);
  const activeContract = roomContracts.find((item) => item.status === 'Active') ?? null;

  // Chỉ đếm hóa đơn **còn thiếu tiền**, không đếm mọi hóa đơn: câu hỏi chủ trọ mang tới màn
  // này là "phòng này còn nợ bao nhiêu, qua mấy kỳ".
  const unpaid = invoices.filter((item) => item.remainingAmount > 0);

  const readings = listUtilityReadings(roomId);
  const periods = [...new Set(readings.map((item) => item.period))]
    .sort((left, right) => right.localeCompare(left))
    .slice(0, ROOM_OVERVIEW_READING_LIMIT);

  const recentReadings: RoomReadingPeriod[] = periods.map((period) => {
    const ofPeriod = readings.filter((item) => item.period === period);
    const electricity = ofPeriod.find((item) => item.type === 'Electricity');
    const water = ofPeriod.find((item) => item.type === 'Water');

    return {
      period,
      electricity: electricity ? toReadingEntry(electricity) : null,
      water: water ? toReadingEntry(water) : null,
    };
  });

  const lastReadingPeriod = (['Electricity', 'Water'] as const).reduce(
    (accumulator, type) => {
      // `listUtilityReadings` đã sắp kỳ mới nhất trước, nên `find` đầu tiên là kỳ gần nhất.
      accumulator[type] = readings.find((item) => item.type === type)?.period ?? null;
      return accumulator;
    },
    {} as Record<UtilityType, string | null>,
  );

  return {
    room,
    propertyId: property.id,
    propertyName: property.name,
    pricing: {
      electricity: resolveUnitPrice(room.electricityPrice, property.electricityPrice),
      water: resolveUnitPrice(room.waterPrice, property.waterPrice),
      service: resolveUnitPrice(room.servicePrice, property.servicePrice),
    },
    lastReadingPeriod,
    activeContract,
    pastContractCount: roomContracts.length - (activeContract ? 1 : 0),
    recentInvoices: invoices.slice(0, ROOM_OVERVIEW_INVOICE_LIMIT),
    outstandingAmount: unpaid.reduce((sum, item) => sum + item.remainingAmount, 0),
    outstandingCount: unpaid.length,
    recentReadings,
  };
}
