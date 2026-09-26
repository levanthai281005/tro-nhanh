import { z } from 'zod';

/**
 * Mảnh dùng lại cho mọi schema khác: định danh, số điện thoại, tiền, thời gian, phân trang.
 *
 * Quy ước chung của package (`shared-schema-validation/SKILL.md`):
 * - Thông báo lỗi viết tiếng Việt ngay tại schema — biểu mẫu hiện thẳng chuỗi này, backend
 *   trả về cũng chuỗi này.
 * - Tiền là **số nguyên đồng** (BR-041), không phải chuỗi có dấu phân cách.
 * - Ngày giờ truyền dạng chuỗi ISO, không truyền `Date` qua JSON.
 */

export const uuidSchema = z.string().uuid('Định danh không hợp lệ');

/** SĐT Việt Nam: bắt đầu bằng 0, tổng 10 số. Là mã định danh tài khoản (BR-016). */
export const vnPhoneSchema = z
  .string()
  .trim()
  .regex(/^0\d{9}$/, 'Số điện thoại chưa hợp lệ (10 số, bắt đầu bằng 0)');

/** Giờ trong ngày dạng `HH:mm`, 00:00–23:59. */
export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ không hợp lệ (định dạng HH:mm)');

export const isoDateTimeSchema = z.string().datetime({ message: 'Thời điểm không hợp lệ' });

/**
 * Tiền: **số nguyên đồng**, không âm (BR-041). Số 0 là giá trị hợp lệ và có nghĩa —
 * "miễn phí" khác "chưa cấu hình", chỗ sau dùng `null` (BR-036).
 */
export const moneySchema = z
  .number({ invalid_type_error: 'Số tiền phải là số' })
  .int('Số tiền phải là số nguyên đồng')
  .nonnegative('Số tiền không được âm');

/** Tiền bắt buộc lớn hơn 0 — dùng cho giá thuê, số tiền một lần thu. */
export const positiveMoneySchema = z
  .number({ invalid_type_error: 'Số tiền phải là số' })
  .int('Số tiền phải là số nguyên đồng')
  .positive('Số tiền phải lớn hơn 0');

/**
 * Mã của một danh mục do quản trị viên quản lý (`ListingType`, `Amenity` — Module 13).
 *
 * Chữ thường, số và dấu gạch ngang: mã đi thẳng vào đường dẫn bộ lọc
 * (`/tim-phong?loai=phong-tro&tien-ich=may-lanh`), nên phải đọc được và gửi cho nhau được.
 * Đây là lý do danh mục dùng `code` chứ không dùng `id` để lọc — cùng lý do với mã hành
 * chính ở BR-043.
 */
export const catalogCodeSchema = z
  .string()
  .trim()
  .min(2, 'Mã danh mục quá ngắn')
  .max(40, 'Mã danh mục tối đa 40 ký tự')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Mã danh mục chỉ gồm chữ thường, số và dấu gạch ngang');

/**
 * Cách tính tiền nước (BR-042). Dùng ở ba chỗ: cài đặt của khu (`Property` — nguồn chính),
 * bản sao để hiển thị trên tin đăng (`ListingCost`), và bản chốt cứng lúc ghi chỉ số
 * (`UtilityReading`). Khai ở đây vì cả ba entity cùng dùng, không entity nào sở hữu.
 */
export const WATER_PRICING_METHOD_VALUES = ['PerCubicMeter', 'PerPerson', 'FlatRate'] as const;

export const waterPricingMethodSchema = z.enum(WATER_PRICING_METHOD_VALUES, {
  message: 'Cách tính tiền nước không hợp lệ',
});

export type WaterPricingMethod = (typeof WATER_PRICING_METHOD_VALUES)[number];

/**
 * Bộ cột kiểm toán có ở mọi entity (Mục 6). Chỉ dùng cho schema **đọc** — client không bao
 * giờ gửi lên các trường này.
 *
 * `isDeleted` là xóa mềm; không có `deletedAt`. API công khai không trả bản ghi đã xóa, cột
 * này có mặt để phần quản trị dùng.
 */
export const auditFieldsSchema = z.object({
  id: uuidSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  isDeleted: z.boolean(),
});

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Tham số phân trang (Mục 7.7). `z.coerce` vì query string luôn là chuỗi — `?page=2` tới
 * server là `'2'`.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Response danh sách theo chuẩn duy nhất của dự án: `{ data, meta }`, không có cờ `success`
 * (Mục 7.7). Dùng làm hàm thay vì viết tay từng chỗ để không nơi nào tự đặt tên khác.
 */
export function paginatedSchema<TItem extends z.ZodTypeAny>(itemSchema: TItem) {
  return z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}
