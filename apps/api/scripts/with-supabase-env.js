import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

/**
 * Chạy một lệnh với chuỗi kết nối Supabase lấy từ `.env.supabase.local`:
 *   node scripts/with-supabase-env.js <lệnh> [tham số…]
 *
 * Giá trị trong file **đè** biến đang có, rồi `prisma.config.ts` và `ConfigModule` nạp `.env`
 * (Postgres ở máy) mà không đè lại — nên lệnh chắc chắn chạy trên Supabase.
 *
 * Thiếu file thì dừng hẳn thay vì chạy tiếp: chạy tiếp sẽ âm thầm dùng `.env` và báo "thành công"
 * trên Postgres ở máy, trong khi người chạy tưởng đã áp lên Supabase.
 *
 * Không in giá trị nào ra màn hình — file chứa mật khẩu.
 */
const ENV_FILE = '.env.supabase.local';
const REQUIRED = ['DATABASE_URL', 'DIRECT_URL'];

if (!existsSync(ENV_FILE)) {
  console.error(
    `Thiếu apps/api/${ENV_FILE} — chép từ .env.supabase.example rồi điền (docs/DEVELOPMENT_SETUP.md mục 4).`,
  );
  process.exit(1);
}

const supabaseEnv = parseEnv(readFileSync(ENV_FILE, 'utf8'));
const missing = REQUIRED.filter((name) => !supabaseEnv[name]);

if (missing.length > 0) {
  console.error(`apps/api/${ENV_FILE} còn để trống: ${missing.join(', ')}.`);
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Cách dùng: node scripts/with-supabase-env.js <lệnh> [tham số…]');
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  // Windows cần shell để tìm `prisma`/`node` qua PATH mà pnpm dựng cho script.
  shell: process.platform === 'win32',
  env: { ...process.env, ...supabaseEnv },
});

process.exit(result.status ?? 1);
