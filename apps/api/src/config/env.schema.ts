import { z } from 'zod';

/**
 * Biến môi trường của ứng dụng, kiểm lúc khởi động: thiếu hoặc sai là dừng ngay, không để lỗi
 * lộ ra ở request đầu tiên chạm tới cơ sở dữ liệu.
 *
 * `DIRECT_URL` không có ở đây vì ứng dụng không dùng — chỉ Prisma CLI dùng khi migrate
 * (`prisma.config.ts`).
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8089),
  // Kiểm scheme thay vì `.url()`: `new URL('localhost:5432')` vẫn hợp lệ (coi `localhost:` là
  // scheme), nên `.url()` để lọt đúng kiểu gõ thiếu hay gặp nhất.
  DATABASE_URL: z
    .string({ required_error: 'Thiếu DATABASE_URL — chép apps/api/.env.example thành .env' })
    .regex(/^postgres(ql)?:\/\/\S+$/, 'DATABASE_URL phải là chuỗi kết nối postgresql://…'),
});

export type Env = z.infer<typeof envSchema>;
