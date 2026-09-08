import { roomSchema } from '@tronhanh/schemas';
import type { RoomWriteInput } from '@/features/workspace/services/roomsService';
import type { RoomFormValues, RoomListItem } from '@/features/workspace/types/room';

/** Lỗi theo từng ô — đặt ngay dưới ô sai thay vì dồn lên một banner ở đầu form. */
export type RoomFormFieldErrors = Partial<Record<'roomCode' | 'floor' | 'area' | 'price', string>>;

export type RoomFormResult =
  { ok: true; input: RoomWriteInput } | { ok: false; errors: RoomFormFieldErrors };

function toNumber(raw: string): number {
  return Number(raw.replace(/\D/g, ''));
}

/**
 * Phân biệt "" (chưa khai, thừa hưởng giá khu) với "0" (miễn phí). Gộp hai ý này làm một là
 * cách chắc chắn nhất để hóa đơn ra sai số.
 */
function toOptionalNumber(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
}

export function toRoomFormValues(propertyId: string, room: RoomListItem | null): RoomFormValues {
  const hasCustomPricing =
    room !== null &&
    (room.electricityPrice !== null || room.waterPrice !== null || room.servicePrice !== null);

  return {
    propertyId,
    roomCode: room?.roomCode ?? '',
    floor: room ? String(room.floor) : '1',
    area: room ? String(room.area) : '',
    price: room ? String(room.price) : '',
    status: room?.status ?? 'Available',
    note: room?.note ?? '',
    amenities: room ? [...room.amenities] : [],
    hasCustomPricing,
    electricityPrice: room?.electricityPrice != null ? String(room.electricityPrice) : '',
    waterPrice: room?.waterPrice != null ? String(room.waterPrice) : '',
    servicePrice: room?.servicePrice != null ? String(room.servicePrice) : '',
  };
}

/**
 * Kiểm dữ liệu form phòng.
 *
 * Hàm thuần, tách khỏi component để đọc được và test được — và vì phần khó nhất của nó không
 * phải gọi `roomSchema` mà là hai điều schema thực thể **không** biểu diễn nổi (xem dưới).
 */
export function validateRoomForm(propertyId: string, values: RoomFormValues): RoomFormResult {
  /*
   * Ô để trống ≠ số 0, và schema thực thể không phân biệt được hai thứ đó.
   *
   * `roomPriceSchema` cố ý cho `price ≥ 0` vì phòng cho người nhà ở nhờ là dữ liệu hợp lệ.
   * Nhưng `Number('')` ra `0`, nên bỏ trống ô giá sẽ **lặng lẽ** lưu phòng giá 0 đ/tháng —
   * đúng thứ chảy thẳng xuống hóa đơn. Ràng buộc "phải khai" thuộc về form, không thuộc về
   * thực thể, nên kiểm ở đây.
   */
  const blankErrors: RoomFormFieldErrors = {};
  if (values.area.trim() === '') blankErrors.area = 'Vui lòng nhập diện tích';
  if (values.price.trim() === '') blankErrors.price = 'Vui lòng nhập giá thuê';

  const parsed = roomSchema.safeParse({
    propertyId,
    roomCode: values.roomCode,
    floor: toNumber(values.floor),
    area: toNumber(values.area),
    price: toNumber(values.price),
    status: values.status,
    note: values.note,
    amenities: values.amenities,
    electricityPrice: values.hasCustomPricing ? toOptionalNumber(values.electricityPrice) : null,
    waterPrice: values.hasCustomPricing ? toOptionalNumber(values.waterPrice) : null,
    servicePrice: values.hasCustomPricing ? toOptionalNumber(values.servicePrice) : null,
  });

  const schemaErrors: RoomFormFieldErrors = parsed.success
    ? {}
    : (() => {
        const flattened = parsed.error.flatten().fieldErrors;
        return {
          roomCode: flattened.roomCode?.[0],
          floor: flattened.floor?.[0],
          area: flattened.area?.[0],
          price: flattened.price?.[0],
        };
      })();

  // Gộp cả hai nguồn rồi mới trả về, thay vì chặn sớm ở nhóm đầu: hiện lần lượt thì người
  // dùng sửa một lỗi, bấm lại, lại gặp lỗi mới — mỗi vòng một lần bấm.
  const errors: RoomFormFieldErrors = { ...schemaErrors, ...blankErrors };
  if (Object.values(errors).some(Boolean) || !parsed.success) {
    return { ok: false, errors };
  }

  return { ok: true, input: { ...parsed.data, note: parsed.data.note ?? '' } };
}
