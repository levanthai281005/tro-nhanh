import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Prisma 7 không tự nạp `.env`.
config({ quiet: true });

/**
 * Cấu hình cho **Prisma CLI** (migrate, seed) — không phải cho ứng dụng.
 *
 * Hai chuỗi kết nối, hai việc khác nhau:
 * - `DIRECT_URL` (ở đây): migration cần kết nối trực tiếp — nó giữ khóa và phiên, việc mà bộ
 *   gộp kết nối chế độ transaction của Supabase không làm được.
 * - `DATABASE_URL`: ứng dụng chạy qua bộ gộp kết nối, khai ở `PrismaService`.
 *
 * Không dùng `env()` của Prisma: hàm đó ném lỗi ngay khi nạp file nếu thiếu biến, kể cả với
 * `prisma generate` vốn không cần kết nối — CI và máy mới sẽ không sinh được client.
 */
export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
