import { utilityReadingSchema, type UtilityType } from '@tronhanh/schemas';
import {
  createLocalId,
  findOccupancy,
  findPreviousUtilityReading,
  findRoom,
  findUtilityReading,
  listContracts,
  listRooms,
  findProperty,
  saveUtilityReading,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type {
  SaveUtilityReadingsInput,
  UtilityReadingCell,
  UtilityReadingRow,
} from '@/features/workspace/types/utilityReading';

/**
 * Đơn giá áp cho một phòng — **ba tầng**, `DATABASE_DESIGN.md` §10.2.
 *
 * `null` ở phòng nghĩa là *thừa hưởng giá khu*, khác hẳn `0` nghĩa là *miễn phí*. Gộp hai ý
 * này bằng `||` là cách chắc chắn nhất để phòng miễn phí điện bị tính theo giá khu.
 */
function resolveUnitPrice(roomPrice: number | null, propertyPrice: number): number {
  return roomPrice ?? propertyPrice;
}

function toCell(
  roomId: string,
  type: UtilityType,
  period: string,
  unitPrice: number,
): UtilityReadingCell {
  const current = findUtilityReading(roomId, type, period);
  const previous = findPreviousUtilityReading(roomId, type, period);

  return {
    previousReading: current?.previousReading ?? previous?.currentReading ?? 0,
    currentReading: current?.currentReading ?? null,
    // Bản ghi đã có thì giữ đơn giá **đã chốt** của nó; chưa có thì lấy giá hiện hành.
    unitPrice: current?.unitPrice ?? unitPrice,
    invoicedAt: current?.invoiceId ? period : null,
  };
}

/**
 * Bảng ghi chỉ số của một khu trong một kỳ.
 *
 * Chỉ liệt kê phòng **có hợp đồng Active**: hóa đơn bắt buộc gắn hợp đồng (unique
 * `contractId + period`), nên ghi chỉ số cho phòng trống là ghi vào chỗ không bao giờ dùng tới.
 */
// TODO: nối API thật khi có endpoint thật: GET /management/rooms/{id}/utility-readings.
export async function getUtilityReadingRows(
  propertyId: string,
  period: string,
): Promise<readonly UtilityReadingRow[]> {
  await waitForMockRequest();

  const property = findProperty(propertyId);
  if (!property) return [];

  return listRooms(propertyId)
    .map((room) => {
      const contract = listContracts(room.id).find((item) => item.status === 'Active');
      if (!contract) return null;

      const occupancy = findOccupancy(contract.occupancyId);
      const electricityPrice = resolveUnitPrice(room.electricityPrice, property.electricityPrice);
      const waterPrice = resolveUnitPrice(room.waterPrice, property.waterPrice);

      return {
        roomId: room.id,
        roomCode: room.roomCode,
        propertyId,
        contractId: contract.id,
        occupantName: occupancy?.fullName ?? 'Không rõ',
        electricity: toCell(room.id, 'Electricity', period, electricityPrice),
        water: toCell(room.id, 'Water', period, waterPrice),
      } satisfies UtilityReadingRow;
    })
    .filter((row): row is UtilityReadingRow => row !== null)
    .sort((left, right) => left.roomCode.localeCompare(right.roomCode, 'vi'));
}

/**
 * Lưu cả bảng trong một lần bấm.
 *
 * Trả về **toàn bộ** bảng sau khi lưu chứ không trả từng bản ghi: một lần lưu chạm nhiều dòng,
 * và ghi lẻ từng bản ghi vào cache là cách đã từng làm màn hợp đồng hiện *hai người cùng làm
 * đại diện*. Nơi gọi `setQueryData` một lần với kết quả này.
 *
 * Ở backend thật đây là **một transaction**: nửa bảng lưu được, nửa còn lại lỗi thì chủ trọ
 * không có cách nào biết dòng nào đã vào.
 */
// TODO: nối API thật khi có endpoint thật: POST /management/rooms/{id}/utility-readings.
export async function saveUtilityReadings(
  propertyId: string,
  input: SaveUtilityReadingsInput,
): Promise<readonly UtilityReadingRow[]> {
  await waitForMockRequest();

  const property = findProperty(propertyId);
  if (!property) throw new Error('Không tìm thấy khu trọ.');

  for (const draft of input.drafts) {
    const room = findRoom(draft.roomId);
    if (!room) throw new Error('Không tìm thấy phòng.');

    const existing = findUtilityReading(draft.roomId, draft.type, input.period);

    // Chỉ số đã lên hóa đơn thì bất biến. Sửa được sẽ làm tổng trên hóa đơn và tổng suy từ
    // chỉ số lệch nhau vĩnh viễn, mà không màn nào phát hiện ra.
    if (existing?.invoiceId) {
      throw new Error(
        `Chỉ số ${draft.type === 'Electricity' ? 'điện' : 'nước'} của phòng ${room.roomCode} kỳ ${input.period} đã lên hóa đơn, không sửa được.`,
      );
    }

    const previous = findPreviousUtilityReading(draft.roomId, draft.type, input.period);
    const previousReading = existing?.previousReading ?? previous?.currentReading ?? 0;
    const unitPrice =
      existing?.unitPrice ??
      resolveUnitPrice(
        draft.type === 'Electricity' ? room.electricityPrice : room.waterPrice,
        draft.type === 'Electricity' ? property.electricityPrice : property.waterPrice,
      );

    const parsed = utilityReadingSchema.safeParse({
      roomId: draft.roomId,
      type: draft.type,
      period: input.period,
      previousReading,
      currentReading: draft.currentReading,
      unitPrice,
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Chỉ số chưa hợp lệ.';
      throw new Error(`Phòng ${room.roomCode}: ${message.toLowerCase()}.`);
    }

    saveUtilityReading({
      id: existing?.id ?? createLocalId(),
      roomId: draft.roomId,
      type: draft.type,
      period: input.period,
      previousReading,
      currentReading: draft.currentReading,
      unitPrice,
      invoiceId: null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
  }

  return getUtilityReadingRows(propertyId, input.period);
}
