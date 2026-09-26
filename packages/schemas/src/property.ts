import { z } from 'zod';
import { provinceCodeSchema, wardCodeSchema } from './address';

/**
 * Ràng buộc thực thể `Property` (khu trọ) — `VALIDATION_RULES.md`.
 *
 * Chỉ chứa luật thuộc về **dữ liệu**. Việc form chia mấy bước, modal hay trang riêng là chuyện
 * của feature, backend không biết tới.
 */

export const propertyNameSchema = z
  .string()
  .trim()
  .min(2, 'Tên khu trọ cần ít nhất 2 ký tự')
  .max(120, 'Tên khu trọ tối đa 120 ký tự');

export const propertyAddressSchema = z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự');

/** Số tài khoản VietQR chỉ gồm chữ số. */
export const bankAccountNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{6,20}$/, 'Số tài khoản chỉ gồm chữ số, từ 6 đến 20 số');

/**
 * Tên chủ tài khoản phải IN HOA không dấu thì mã VietQR mới hợp lệ. Đây là ràng buộc của
 * chuẩn VietQR, không phải sở thích hiển thị.
 */
export const bankAccountNameSchema = z
  .string()
  .trim()
  .regex(/^[A-Z\s]+$/, 'Tên chủ tài khoản phải IN HOA, không dấu');

export const propertySchema = z.object({
  name: propertyNameSchema,
  address: propertyAddressSchema,
  district: z.string().trim().max(120),
  provinceCode: provinceCodeSchema.nullable(),
  wardCode: wardCodeSchema.nullable(),
  note: z.string().trim().max(500).optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/**
 * Bật hồ sơ khu public đòi thêm điều kiện so với tạo khu: phải có `name` và `district`
 * (VALIDATION_RULES). Tách schema riêng thay vì bắt buộc `district` ngay từ lúc tạo — người
 * dùng tạo khu đầu tiên chỉ muốn qua bước đó cho nhanh.
 */
export const publicPropertyProfileSchema = propertySchema.extend({
  district: z.string().trim().min(1, 'Cần chọn khu vực trước khi bật hồ sơ công khai'),
});
