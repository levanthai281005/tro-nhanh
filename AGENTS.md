# Trọ Nhanh — Hướng dẫn cho agent

Đọc theo thứ tự trước khi làm bất cứ việc gì:

1. `.agents/PROJECT_STATE.md` — **đang ở đâu, vừa làm gì, tiếp theo làm gì** (đọc đầu tiên)
2. `.agents/AGENTS.md` — nguyên tắc chung và bản đồ tài liệu
3. `.agents/rules/` — quy ước viết code và đặt tên (luôn đọc trước khi code)
4. `.agents/business/README.md` — mục lục nghiệp vụ, đọc đúng file cần thay vì đọc tất cả
5. `.agents/tasks/` — quy trình cho từng loại công việc
6. `.agents/skills/` — kỹ năng chuyên biệt kèm bảng tra
7. `.agents/REBUILD_PLAN.md` — lộ trình rebuild và bảng ánh xạ trang

Đặc tả gốc là `docs/spec/dac-ta-ky-thuat.md`. Khi `.agents/` lệch với đặc tả thì đặc tả
thắng — báo lại, không tự sửa đặc tả.

## Bối cảnh nhanh

Đây là monorepo `tro-nhanh` (pnpm workspace + Turborepo) chứa **cả ba ứng dụng**: `apps/web`
(Next.js App Router), `apps/mobile` (Expo — app người ở) và `apps/api` (NestJS trên TypeScript,
Node 22 LTS). Frontend đang được **rebuild từ một prototype cũ** ở thư mục anh em
`../prototype/` (Vite + react-router + Supabase + inline style) — **CHỈ ĐỌC**, không bao giờ
sửa, không tạo file trong đó. Nó vẫn chạy được để đối chiếu giao diện.

Backend `apps/api` truy cập dữ liệu qua **Prisma**; **migration có đánh số là nguồn chân lý**
về cấu trúc dữ liệu. Không có `openapi.json` làm cầu nối: web, mobile và backend dùng chung
**Zod schema ở `packages/schemas`** — backend kiểm tra đầu vào, web/mobile dựng biểu mẫu, kiểu
dữ liệu suy ra từ chính schema.

## Nguyên tắc bất di bất dịch

- **Không inline style.** Mọi styling qua Tailwind class; màu chỉ lấy từ preset.
- **Tailwind phải là v3** — NativeWind bản ổn định không chạy với v4.
- **Định nghĩa dữ liệu khai một lần** ở `packages/schemas`; không khai lại DTO/type riêng ở
  từng app.
- **Không sửa tay cơ sở dữ liệu** — mọi thay đổi cấu trúc đi qua migration Prisma có đánh số.
- **Không import chéo** giữa `features/marketplace`, `features/workspace`, `features/residency`;
  ở backend hai domain không gọi chéo tầng dữ liệu của nhau — đi qua service công khai của
  module.
- **Lập kế hoạch trước, chờ duyệt, rồi mới viết code.**

Trước khi bàn giao: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` và đối chiếu
`.agents/tasks/PRE_HANDOFF_CHECKLIST.md`.
