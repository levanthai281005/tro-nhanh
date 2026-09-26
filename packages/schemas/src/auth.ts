import { z } from 'zod';
import { isoDateTimeSchema, vnPhoneSchema } from './common';

/**
 * Đăng ký, đăng nhập và khôi phục mật khẩu (Module 1, Mục 7.2).
 *
 * **Định danh tài khoản là số điện thoại.** Không có email — không đăng ký bằng email, không
 * khôi phục mật khẩu qua email, không đăng nhập bằng Google hay mạng xã hội (BR-016).
 *
 * Những thứ **không** nằm ở đây vì cần tra dữ liệu khác, thuộc service `apps/api`:
 * số điện thoại đã tồn tại chưa, mã một lần còn hiệu lực không, tài khoản có đang bị khóa
 * không, đã dùng thử gói chưa.
 */

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu cần ít nhất 8 ký tự')
  .max(72, 'Mật khẩu tối đa 72 ký tự');

/**
 * Mã một lần gửi qua tin nhắn.
 *
 * Đặc tả không nói độ dài mã — **6 chữ số là giả định của bản triển khai này**, chọn theo
 * thông lệ nhà mạng trong nước. Thời hạn hiệu lực của mã là việc của máy chủ, không phải của
 * schema.
 */
export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Mã xác thực gồm 6 chữ số');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Họ tên quá ngắn')
  .max(80, 'Họ tên tối đa 80 ký tự');

/** Chuỗi phiên do máy chủ cấp; client không bao giờ tự sinh. */
const tokenSchema = z.string().min(1, 'Thiếu mã phiên');

/** `POST /auth/register` — tạo tài khoản ở trạng thái *chờ xác thực*. */
export const registerSchema = z.object({
  phoneNumber: vnPhoneSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

/** `POST /auth/verify-otp` — nhập mã để chuyển tài khoản sang *hoạt động*. */
export const verifyOtpSchema = z.object({
  phoneNumber: vnPhoneSchema,
  code: otpCodeSchema,
});

/** `POST /auth/login`. Sai số điện thoại hay sai mật khẩu đều trả **một** thông báo chung —
 * phân biệt hai ca là chỉ ra số nào đã có tài khoản. */
export const loginSchema = z.object({
  phoneNumber: vnPhoneSchema,
  password: passwordSchema,
});

/** `POST /auth/refresh` và `POST /auth/logout` (thu hồi refresh token). */
export const refreshTokenSchema = z.object({
  refreshToken: tokenSchema,
});

/** `POST /auth/forgot-password` — gửi lại mã một lần. */
export const forgotPasswordSchema = z.object({
  phoneNumber: vnPhoneSchema,
});

/** `POST /auth/reset-password` — xác thực lại bằng mã rồi đặt mật khẩu mới. */
export const resetPasswordSchema = z.object({
  phoneNumber: vnPhoneSchema,
  code: otpCodeSchema,
  newPassword: passwordSchema,
});

/** `PUT /me/password` — đổi mật khẩu khi đang đăng nhập. */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

/**
 * Cặp mã phiên trả về sau khi đăng nhập hoặc làm mới.
 *
 * Đặc tả mô tả entity `RefreshToken` và các endpoint, **không mô tả hình dạng response của
 * `/auth/*`** — hình dạng dưới đây là của bản triển khai. `expiresAt` là hạn của access
 * token, để client biết lúc nào cần gọi `refresh` mà không phải giải mã token.
 */
export const authTokensSchema = z.object({
  accessToken: tokenSchema,
  refreshToken: tokenSchema,
  expiresAt: isoDateTimeSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
