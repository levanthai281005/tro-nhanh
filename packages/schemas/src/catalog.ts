import { z } from 'zod';
import { auditFieldsSchema, catalogCodeSchema, uuidSchema } from './common';

/**
 * Danh mục do quản trị viên quản lý (Module 13): loại hình cho thuê và tiện ích.
 *
 * Đây **không phải enum cố định trong mã nguồn**. Module 3 nói thẳng: thêm một loại hình mới
 * không được phải sửa code. Vì vậy ở đây chỉ khai **hình dạng và định dạng mã**, không khai
 * danh sách giá trị — danh sách nằm trong cơ sở dữ liệu, client lấy qua API danh mục.
 *
 * Kiểm "mã này có thật không" cần tra dữ liệu, nên thuộc service `apps/api`, không thuộc Zod.
 */

export const listingTypeSchema = auditFieldsSchema.extend({
  code: catalogCodeSchema,
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(255).nullable(),
});

export const AMENITY_TYPE_VALUES = ['Room', 'Surrounding'] as const;
export const amenityTypeSchema = z.enum(AMENITY_TYPE_VALUES);

/**
 * Tiện ích.
 *
 * `code` dùng để lọc thay cho `id`: đường dẫn kết quả tìm kiếm là thứ người dùng gửi cho
 * nhau, mà `?tien-ich=8f3a…` thì không đọc được và không sửa tay được. Lọc theo `name` cũng
 * không được — đổi tên tiện ích là mất kết quả lọc, đúng loại hỏng mà BR-043 chặn ở địa chỉ.
 */
export const amenitySchema = auditFieldsSchema.extend({
  code: catalogCodeSchema,
  name: z.string().trim().min(1).max(60),
  icon: z.string().trim().min(1).max(40),
  type: amenityTypeSchema,
});

/** Dạng rút gọn đi kèm tin đăng — thẻ tin và trang chi tiết chỉ cần ngần này. */
export const amenityRefSchema = z.object({
  id: uuidSchema,
  code: catalogCodeSchema,
  name: z.string().trim().min(1).max(60),
  icon: z.string().trim().min(1).max(40),
});

export const listingTypeRefSchema = z.object({
  id: uuidSchema,
  code: catalogCodeSchema,
  name: z.string().trim().min(1).max(60),
});

export type AmenityType = (typeof AMENITY_TYPE_VALUES)[number];
export type ListingTypeInput = z.infer<typeof listingTypeSchema>;
export type AmenityInput = z.infer<typeof amenitySchema>;
export type AmenityRef = z.infer<typeof amenityRefSchema>;
export type ListingTypeRef = z.infer<typeof listingTypeRefSchema>;
