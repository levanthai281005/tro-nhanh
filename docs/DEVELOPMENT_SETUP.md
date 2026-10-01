# Dựng dự án trên máy mới

Danh sách những thứ **thật sự cần** để chạy được repo này, kiểm chứng từ `.nvmrc`,
`package.json`, `compose.yaml`, `apps/api/.env.example` và `.github/workflows/ci.yml` — không
phải liệt kê theo trí nhớ.

`README.md` mô tả đầy đủ kiến trúc và quy chuẩn code. File này chỉ trả lời đúng một câu hỏi:
**cần cài gì để máy mới không lỗi.**

---

## 1. Bắt buộc — thiếu là lỗi ngay

| Thứ              | Phiên bản      | Vì sao đúng con số này                                       |
| ---------------- | -------------- | ------------------------------------------------------------ |
| Node.js          | **22.14.x**    | `.nvmrc` ghi `22.14.0`, `engines` ghi `22.14.x`              |
| pnpm             | **9.15.0**     | Trường `packageManager`. Bật qua corepack                    |
| Git              | bản mới bất kỳ | —                                                            |
| Đăng nhập GitHub | —              | Chưa đăng nhập là push thất bại                              |
| Docker Desktop   | bản mới bất kỳ | Chạy PostgreSQL cho backend. Chỉ làm web/mobile thì chưa cần |

**Không dùng `npm install` hay `yarn`.** Đây là pnpm workspace; dùng sai trình quản lý gói sẽ
hỏng `node_modules` của cả monorepo.

Node sai bản là nguồn của loại lỗi "máy tôi chạy được" — mỗi người một phiên bản thì kết quả
build khác nhau mà không ai giải thích được.

---

## 2. Các bước dựng lại

```bash
git clone https://github.com/levanthai281005/tro-nhanh.git
cd tro-nhanh
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile
git checkout feat/rebuild
pnpm dev:web
```

Mở `http://localhost:3000`.

**Nhánh làm việc là `feat/rebuild`, không phải `dev`.** Mọi nhánh tính năng tách từ và PR về
`feat/rebuild`; chỉ khi cả đợt rebuild xong mới có một PR `feat/rebuild → dev`.

⚠️ Dùng `--frozen-lockfile`. Cài thường có thể làm trôi lockfile, mà **Tailwind phải giữ đúng
`3.4.17`** — lệch bản là NativeWind không dùng chung preset với web được nữa.

Nếu máy có `nvm`, chạy `nvm use` trong repo để nó tự đọc `.nvmrc`.

---

## 3. Chạy backend `apps/api`

```bash
cp apps/api/.env.example apps/api/.env
pnpm docker:db                       # PostgreSQL 17 trong Docker, cổng 5432
pnpm dev:api                         # sinh Prisma Client, build, chạy, tự chạy lại khi sửa code
curl http://localhost:8089/api/v1/health
```

`/health` trả `{"status":"ok","database":"up"}` là xong. Trả `503` nghĩa là API chạy nhưng không
kết nối được cơ sở dữ liệu — xem lại `DATABASE_URL` trong `apps/api/.env`.

Chạy cả API lẫn cơ sở dữ liệu trong Docker thay vì trên máy: `pnpm docker:api` (không cần
`apps/api/.env`, compose tự đặt chuỗi kết nối).

Các lệnh cơ sở dữ liệu — chạy trong `apps/api` hoặc thêm `pnpm --filter api` ở gốc repo:

| Lệnh               | Làm gì                                                                    |
| ------------------ | ------------------------------------------------------------------------- |
| `pnpm db:generate` | Sinh Prisma Client vào `src/generated/` (không commit)                    |
| `pnpm db:migrate`  | Sinh migration mới từ `prisma/schema/` và áp vào DB local — **chỉ local** |
| `pnpm db:deploy`   | Áp các migration có sẵn, không sinh mới — dùng cho Supabase               |
| `pnpm db:reset`    | Xóa sạch DB local rồi chạy lại toàn bộ migration — **chỉ local**          |

Quy trình viết migration: `.agents/tasks/ADD_DB_MIGRATION.md`.

---

## 4. Cơ sở dữ liệu: local và Supabase

Hệ thống chạy trên **Supabase — chỉ dùng PostgreSQL và lưu trữ tệp**, không dùng phần đăng nhập
của Supabase (AS-029). Máy dev dùng PostgreSQL trong Docker, vì `prisma migrate dev` cần tạo một
shadow database mà Supabase không cho tạo. Migration viết ở local, áp lên Supabase bằng
`pnpm db:deploy`.

### Hai chuỗi kết nối

| Biến           | Ai dùng                         | Trên Supabase                                                                         |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Ứng dụng (`PrismaService`)      | Bộ gộp kết nối Supavisor, chế độ transaction, cổng **6543**                           |
| `DIRECT_URL`   | Prisma CLI (`prisma.config.ts`) | Kết nối trực tiếp, cổng **5432** — mạng chỉ có IPv4 thì dùng session pooler cổng 5432 |

Migration phải đi đường trực tiếp: nó giữ khóa và phiên, việc mà bộ gộp chế độ transaction không
làm được. Kết nối trực tiếp của Supabase chỉ chạy trên IPv6 (trừ khi mua IPv4 add-on), nên mạng
nhà chỉ có IPv4 thì `DIRECT_URL` dùng session pooler.

Ở máy local không có bộ gộp nên hai biến trùng nhau.

### ⚠️ Migration và ứng dụng PHẢI dùng cùng một user cơ sở dữ liệu

Mọi bảng bật RLS (Row Level Security) mà **không có policy nào**. Supabase mở bảng `public` qua
Data API bằng anon key — khóa này vốn công khai — nên RLS không policy là thứ chặn đường vào đó.
Ứng dụng không bị chặn chỉ vì một lẽ: **chủ sở hữu bảng vượt qua RLS**, và user chạy migration
tạo bảng nên sở hữu bảng.

Nếu migration chạy bằng user quản trị còn ứng dụng dùng một user khác, ứng dụng không phải chủ
bảng: **mọi truy vấn đọc trả về rỗng mà không báo lỗi**, mọi lệnh ghi bị từ chối. Trông y như
"cơ sở dữ liệu chưa có gì", rất khó lần ra nguyên nhân.

Vì vậy `DATABASE_URL` và `DIRECT_URL` khác đường đi nhưng **cùng user**.

PostgreSQL local dùng user `tronhanh` là superuser nên vượt RLS kể cả khi cấu hình sai — **máy
local không lộ được lỗi này**. Kiểm kỹ ở môi trường Supabase.

### Dựng một project Supabase mới

1. Tạo user riêng cho ứng dụng (Supabase khuyên, xem
   [Prisma với Supabase](https://supabase.com/docs/guides/database/prisma)) — đặt cả hai chuỗi
   kết nối bằng user này.
2. **Tắt Data API** trong Project Settings → API. Dự án không dùng Data API; để bật là mở thêm
   một đường vào dữ liệu nằm ngoài NestJS. RLS là lớp chặn thứ hai, không thay cho bước này.
3. Chạy `pnpm --filter api db:deploy` với `DIRECT_URL` của project đó.

---

## 5. KHÔNG cần — khỏi mất công đi tìm

- **File `.env` ở gốc repo.** Chỉ `apps/api` cần `.env` (bước 3). `.env.example` ở gốc chỉ có
  `EXPO_HOST_IP`, dùng khi mở Expo trên điện thoại thật qua Docker.
- **`NEXT_PUBLIC_API_URL`.** Web vẫn chạy mock data; `apiClient` ở `packages/api` chưa được gọi ở
  đâu. Khi nối API thật mới cần.
- **Docker để chạy web.** Có sẵn `compose.yaml` nhưng chạy `pnpm dev:web` trực tiếp là đủ.

---

## 6. Tùy chọn theo nhu cầu

### Prototype để đối chiếu giao diện

Repo riêng, **CHỈ ĐỌC** — không bao giờ sửa, không tạo file trong đó.

```bash
git clone https://github.com/phuc220204/TroNhanh_Prototype.git prototype
```

Phải đặt **đúng thư mục anh em**, vì tài liệu trong `.agents/` tham chiếu đường dẫn
`../prototype/`:

```text
rebuild_tronhanh-fe/
├── tro-nhanh/        ← repo này (thư mục máy cũ vẫn tên tro-nhanh-fe, không sao)
└── prototype/        ← bản demo cũ, chạy được để đối chiếu
```

### GitHub CLI

Chỉ cần khi tạo PR bằng lệnh. Trên máy cũ `gh` không nằm trong PATH của shell nên phải gọi
đường dẫn đầy đủ:

```bash
"C:\Program Files\GitHub CLI\gh.exe" pr create --base feat/rebuild --head <nhánh> --title ... --body-file ...
```

Base **luôn** là `feat/rebuild`. GitHub hay tự nhớ base của lần tạo PR gần nhất chứ không phải
nhánh vừa mở compare tới — từng khiến một PR merge nhầm thẳng vào `dev`. Nhìn kỹ dòng `base:`
trước khi bấm tạo.

### App mobile

```bash
pnpm dev:mobile
```

Chưa dựng màn nào nên chưa cần.

---

## 7. Kiểm tra máy mới đã ổn chưa

Chạy đúng bộ mà GitHub Actions chạy (`.github/workflows/ci.yml`):

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Mốc để đối chiếu: `pnpm test` phải ra **29 test pass** ở `@tronhanh/utils`, **15** ở
`@tronhanh/schemas`, **26** ở `@tronhanh/access` và **7** ở `api`.

Xanh hết là máy mới dựng đúng.

---

## 8. Cạm bẫy dễ dính trên máy mới

**Cổng 3000 bị chiếm.** Dev server cũ chưa tắt thì Next tự nhảy sang 3001, rồi mở nhầm cổng và
tưởng code không ăn. Luôn tắt dev server sau khi kiểm xong. API giữ cổng 8089 — cũng tắt sau khi
kiểm.

**Cổng 5432 bị chiếm.** Máy đã có PostgreSQL khác (cài thẳng, hoặc container của dự án khác) thì
`pnpm docker:db` báo `port is already allocated`. Chạy trên cổng khác rồi sửa hai chuỗi kết nối
trong `apps/api/.env` theo:

```bash
POSTGRES_PORT=5433 docker compose up -d postgres
```

**Cài Node "bản mới nhất" thay vì 22.14.x.** Xem lại mục 1.

**Repo không dùng được lệnh tạo khung của NestJS, và hướng dẫn build trong tài liệu chính thức
không áp dụng.**

- **Không dùng:** `nest new`, `nest generate` (`nest g module …`), `nest build`, `nest start`. Phần
  tài liệu NestJS hướng dẫn build và chạy bằng các lệnh này, hay cấu hình `nest-cli.json`, bỏ qua.
  Phần chạy của NestJS — module, decorator, DI, guard — vẫn dùng bình thường; chỉ bộ công cụ
  dòng lệnh là không.
- **Lý do:** Nest CLI 12 nạp `@angular-devkit`, gói này `require()` một gói ESM nằm trong vòng
  import (`ERR_REQUIRE_CYCLE_MODULE`) — chỉ Node ≥ 22.22.3 xử lý được. Repo ghim Node 22.14.0 nên
  CLI sập ngay khi khởi động, **kể cả `nest build`**, dù hướng dẫn nâng cấp của NestJS chỉ nói
  `nest new` và `nest generate` cần Node mới.
- **Làm thay:** build bằng `pnpm --filter api build` (Rspack, cấu hình ở `apps/api/rspack.config.js`),
  chạy dev bằng `pnpm dev:api`. Module mới tạo tay theo `.agents/tasks/CREATE_API_MODULE.md`.
- **Cách gỡ nếu cần:** nâng Node lên ≥ 22.22.3 **ở mọi chỗ cùng lúc** — `.nvmrc`, `engines` trong
  `package.json` gốc, dòng `FROM` của `Dockerfile.dev` (CI đọc `.nvmrc` nên tự theo) — rồi cài
  `@nestjs/cli` vào `apps/api`. Build vẫn nên giữ Rspack: kể cả khi dùng Nest CLI, cấu hình Rspack
  riêng vẫn cần để gói `@tronhanh/*` vào bundle. Đổi phiên bản Node là quyết định riêng, không
  làm lẻ trong một PR tính năng.

**Class Tailwind sai tên không gây lỗi build.** Tailwind lặng lẽ không sinh CSS, typecheck vẫn
xanh, giao diện sai âm thầm. `pnpm lint` là hàng rào duy nhất — đừng bỏ qua nó. Nghi ngờ thì
viết thử một class bịa rồi chạy lint, phải thấy báo lỗi.

**Kho dữ liệu mock nằm trong bộ nhớ từng tiến trình.** Kiểm thao tác ghi phải điều hướng bằng
link trong app; full reload là reset sạch, không kết luận được gì.

Xuống dòng CRLF/LF đã có `.gitattributes` lo, không phải chỉnh gì.

---

## Đọc tiếp

- [`README.md`](../README.md) — kiến trúc, cấu trúc thư mục, quy chuẩn code
- [`.agents/PROJECT_STATE.md`](../.agents/PROJECT_STATE.md) — **đang ở đâu, làm gì tiếp theo**
- [`HELP.md`](../HELP.md) — liên kết tài liệu framework đúng phiên bản
