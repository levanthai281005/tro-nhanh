import type { UtilityType } from '@tronhanh/schemas';
import {
  findOccupancy,
  findProperty,
  findUtilityReading,
  listContracts,
  listInvoicesByContract,
  listRoomsBySeller,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type { InvoiceRoomOption, InvoiceUtilitySnapshot } from '@/features/workspace/types/invoice';

/**
 * Dữ liệu điền sẵn cho form tạo hóa đơn của **một kỳ**.
 *
 * Tách khỏi `invoicesService` vì đây là dữ liệu phục vụ form, không phải vòng đời hóa đơn —
 * và vì nó phụ thuộc `period`, thứ mà các hàm CRUD kia không cần biết.
 */

function toSnapshot(
  roomId: string,
  type: UtilityType,
  period: string,
): InvoiceUtilitySnapshot | null {
  const reading = findUtilityReading(roomId, type, period);
  if (!reading) return null;

  const consumption = reading.currentReading - reading.previousReading;

  return {
    readingId: reading.id,
    previousReading: reading.previousReading,
    currentReading: reading.currentReading,
    unitPrice: reading.unitPrice,
    consumption,
    amount: consumption * reading.unitPrice,
    isInvoiced: reading.invoiceId !== null,
  };
}

/**
 * Phòng có thể xuất hóa đơn cho kỳ đang chọn.
 *
 * Trả về **cả phòng đã có hóa đơn kỳ này** thay vì lọc bỏ, cùng lý do với màn hợp đồng: chủ
 * trọ cần thấy phòng đó và hiểu vì sao chưa chọn được, chứ không phải tự hỏi tại sao phòng
 * biến mất khỏi danh sách.
 *
 * Tiền thuê lấy từ **hợp đồng**, không lấy `Room.price`. Prototype lấy giá phòng — với phòng
 * đã tăng giá sau ngày ký, hóa đơn ra số tiền chủ trọ không có quyền thu.
 */
// TODO: nối API thật khi có endpoint thật — backend gộp sẵn trong GET rooms.
export async function getInvoiceRoomOptions(
  sellerId: string | undefined,
  period: string,
): Promise<readonly InvoiceRoomOption[]> {
  await waitForMockRequest();
  if (!sellerId) return [];

  return listRoomsBySeller(sellerId)
    .map((room) => {
      const contract = listContracts(room.id).find((item) => item.status === 'Active');
      if (!contract) return null;

      const property = findProperty(room.propertyId);
      if (!property) return null;

      const occupancy = findOccupancy(contract.occupancyId);

      return {
        roomId: room.id,
        roomCode: room.roomCode,
        propertyId: room.propertyId,
        propertyName: property.name,
        contractId: contract.id,
        occupantName: occupancy?.fullName ?? 'Không rõ',
        rentPrice: contract.rentPrice,
        // `null` ở phòng = thừa hưởng giá khu, khác `0` = miễn phí. Dùng `??` chứ không `||`.
        servicePrice: room.servicePrice ?? property.servicePrice,
        hasInvoiceForPeriod: listInvoicesByContract(contract.id).some(
          (item) => item.period === period,
        ),
        electricity: toSnapshot(room.id, 'Electricity', period),
        water: toSnapshot(room.id, 'Water', period),
      } satisfies InvoiceRoomOption;
    })
    .filter((item): item is InvoiceRoomOption => item !== null)
    .sort(
      (left, right) =>
        left.propertyName.localeCompare(right.propertyName, 'vi') ||
        left.roomCode.localeCompare(right.roomCode, 'vi'),
    );
}
