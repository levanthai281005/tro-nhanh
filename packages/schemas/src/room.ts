import { z } from 'zod';

/**
 * Ràng buộc thực thể `Room` (phòng) — `VALIDATION_RULES.md`.
 */

/** BR-002 — **đúng bốn** giá trị. Không có `Repairing`, không có `Inactive`. */
export const ROOM_STATUS_VALUES = ['Available', 'Deposited', 'Rented', 'Hidden'] as const;
export type RoomStatus = (typeof ROOM_STATUS_VALUES)[number];

export const roomStatusSchema = z.enum(ROOM_STATUS_VALUES);

/** Unique trong phạm vi một Property — điều kiện unique do backend kiểm, không kiểm được ở đây. */
export const roomCodeSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập mã phòng')
  .max(20, 'Mã phòng tối đa 20 ký tự');

export const roomAreaSchema = z
  .number({ invalid_type_error: 'Diện tích phải là số' })
  .positive('Diện tích phải lớn hơn 0');

/** Giá thuê `≥ 0`: phòng cho người nhà ở nhờ vẫn là dữ liệu hợp lệ. */
export const roomPriceSchema = z
  .number({ invalid_type_error: 'Giá thuê phải là số' })
  .nonnegative('Giá thuê không được âm');

export const roomFloorSchema = z
  .number({ invalid_type_error: 'Số tầng phải là số' })
  .int('Số tầng phải là số nguyên')
  .min(0, 'Số tầng không được âm')
  .max(100, 'Số tầng không hợp lệ');

/**
 * Đơn giá riêng của phòng. `null` = **thừa hưởng giá khu**, khác hẳn `0` = miễn phí.
 * Gộp hai ý này làm một là cách chắc chắn nhất để hóa đơn ra sai số.
 */
const inheritableUnitPriceSchema = z
  .number({ invalid_type_error: 'Đơn giá phải là số' })
  .nonnegative('Đơn giá không được âm')
  .nullable();

/**
 * Tiện ích của phòng — `DATA_ENTITIES.md`: `Room n-n Amenity`.
 *
 * Lưu **nhãn** tiếng Việt lấy từ catalog dùng chung, không lưu `key`. Danh sách rỗng là hợp
 * lệ và có nghĩa thật: phòng thô, không có gì cả.
 */
export const roomAmenitiesSchema = z.array(z.string().trim().min(1)).max(30, 'Quá nhiều tiện ích');

export const roomSchema = z.object({
  propertyId: z.string().min(1, 'Vui lòng chọn khu trọ'),
  roomCode: roomCodeSchema,
  floor: roomFloorSchema,
  area: roomAreaSchema,
  price: roomPriceSchema,
  status: roomStatusSchema,
  note: z.string().trim().max(500).optional(),
  amenities: roomAmenitiesSchema,
  electricityPrice: inheritableUnitPriceSchema,
  waterPrice: inheritableUnitPriceSchema,
  servicePrice: inheritableUnitPriceSchema,
});

export type RoomInput = z.infer<typeof roomSchema>;

/**
 * Chuyển trạng thái hợp lệ theo BR-002: `Available ⇄ Deposited ⇄ Rented`, `Available ⇄ Hidden`.
 *
 * Không cho nhảy thẳng `Hidden → Rented`: phòng đang ẩn khỏi quản lý mà bỗng có người thuê là
 * dấu hiệu chủ trọ bấm nhầm, không phải nghiệp vụ thật.
 */
export const ALLOWED_ROOM_STATUS_TRANSITIONS: Record<RoomStatus, readonly RoomStatus[]> = {
  Available: ['Deposited', 'Rented', 'Hidden'],
  Deposited: ['Available', 'Rented'],
  Rented: ['Available', 'Deposited'],
  Hidden: ['Available'],
};

export function canTransitionRoomStatus(from: RoomStatus, to: RoomStatus): boolean {
  return from === to || ALLOWED_ROOM_STATUS_TRANSITIONS[from].includes(to);
}
