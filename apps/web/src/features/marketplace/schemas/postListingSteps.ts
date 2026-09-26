import { z } from 'zod';
import {
  ACCESS_POLICY_VALUES,
  LISTING_MIN_PHOTOS,
  listingAreaSchema,
  listingPriceSchema,
  listingTitleSchema,
  vnPhoneSchema,
} from '@tronhanh/schemas';

/**
 * TODO(B5): loại hình cho thuê nay là **danh mục do quản trị viên quản lý** (`ListingType`,
 * Module 3) — tin mang `typeId`, bộ lọc đi bằng `code`. Ba giá trị dưới đây là bản tạm để màn
 * đăng tin còn chạy được với dữ liệu mock; khi nối API danh mục thì bỏ hẳn, không đưa trở lại
 * `@tronhanh/schemas`.
 */
const LEGACY_PROPERTY_TYPE_VALUES = ['BoardingRoom', 'ServicedApartment', 'Apartment'] as const;

/**
 * TODO(B5): tin đăng thật gắn ảnh bằng `mediaIds` (ảnh upload trước qua `POST /media/upload`),
 * xem `listingMediaIdsSchema`. Form đang giữ đường dẫn ảnh mock nên kiểm theo đường dẫn, chỉ
 * dùng chung **số ảnh tối thiểu**.
 */
const photoUrlsSchema = z
  .array(z.string().min(1))
  .min(LISTING_MIN_PHOTOS, `Cần ít nhất ${LISTING_MIN_PHOTOS} ảnh của phòng`);

/**
 * Schema theo từng bước của form đăng tin.
 *
 * Ràng buộc **dữ liệu** (tiêu đề 10–120, giá > 0, ảnh ≥ 3…) nằm ở `@tronhanh/schemas` vì đó
 * là hợp đồng với backend. Ở đây chỉ ghép chúng lại theo cách form chia bước — chia bước là
 * quyết định giao diện, backend không cần biết.
 *
 * Số tiền và diện tích ở form là chuỗi (người dùng gõ "3.500.000"), nên mỗi bước tự làm sạch
 * rồi mới đưa vào schema số.
 */

/** "3.500.000" → 3500000. Chuỗi rỗng → null để phân biệt "chưa nhập" với số 0. */
export function parseAmount(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return Number(digits);
}

/** Diện tích cho phép số thập phân: "25,5" hoặc "25.5". */
export function parseArea(value: string): number | null {
  const normalized = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const requiredAmount = (message: string) =>
  z
    .string()
    .transform(parseAmount)
    .pipe(z.number({ invalid_type_error: message }).positive(message));

export const locationStepSchema = z.object({
  propertyType: z.enum(LEGACY_PROPERTY_TYPE_VALUES, { message: 'Vui lòng chọn loại hình' }),
  wardCode: z.string().min(1, 'Vui lòng chọn khu vực'),
  district: z.string().min(1, 'Vui lòng chọn khu vực'),
  address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ cụ thể'),
});

export const roomStepSchema = z
  .object({
    area: z.string().transform(parseArea).pipe(listingAreaSchema),
    price: z.string().transform(parseAmount).pipe(listingPriceSchema),
    maxOccupants: z.string().optional(),
    accessPolicy: z.enum(ACCESS_POLICY_VALUES),
    accessOpenTime: z.string(),
    accessCloseTime: z.string(),
  })
  .refine(
    (value) => value.accessPolicy === 'Free' || (!!value.accessOpenTime && !!value.accessCloseTime),
    { message: 'Vui lòng nhập cả giờ mở và giờ đóng cửa', path: ['accessOpenTime'] },
  );

export const mediaStepSchema = z.object({
  title: listingTitleSchema,
  photoUrls: photoUrlsSchema,
  description: z.string().trim().min(10, 'Mô tả cần ít nhất 10 ký tự'),
});

/**
 * Điện và nước bắt buộc phải nói rõ, nhưng có hai cách nói: nhập số tiền cụ thể, hoặc chọn
 * "theo giá nhà nước"/"theo hóa đơn". Bắt nhập số cứng sẽ khiến người chưa chốt giá điền
 * bừa — với người đi thuê thì số bịa còn tệ hơn là không có số.
 */
export const costsStepSchema = z
  .object({
    electricityMode: z.enum(['Fixed', 'Official']),
    electricityPrice: z.string(),
    waterMode: z.enum(['Fixed', 'Official']),
    waterPrice: z.string(),
    waterPricingUnit: z.enum(['PerPerson', 'PerCubicMeter']),
    deposit: z.string().optional(),
    contactPhone: vnPhoneSchema,
  })
  .superRefine((value, ctx) => {
    if (value.electricityMode === 'Fixed' && !parseAmount(value.electricityPrice)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['electricityPrice'],
        message: 'Nhập giá điện, hoặc chọn "Theo giá nhà nước"',
      });
    }
    if (value.waterMode === 'Fixed' && !parseAmount(value.waterPrice)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['waterPrice'],
        message: 'Nhập giá nước, hoặc chọn "Theo hóa đơn"',
      });
    }
  });

export const postListingStepSchemas = [
  locationStepSchema,
  roomStepSchema,
  mediaStepSchema,
  costsStepSchema,
] as const;

export { requiredAmount };
