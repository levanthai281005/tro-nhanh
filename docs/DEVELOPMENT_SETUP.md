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

| Lệnh                      | Làm gì                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| `pnpm db:generate`        | Sinh Prisma Client vào `src/generated/` (không commit)                    |
| `pnpm db:migrate`         | Sinh migration mới từ `prisma/schema/` và áp vào DB local — **chỉ local** |
| `pnpm db:deploy`          | Áp các migration có sẵn, không sinh mới — vào DB trong `.env`             |
| `pnpm db:reset`           | Xóa sạch DB local rồi chạy lại toàn bộ migration — **chỉ local**          |
| `pnpm db:deploy:supabase` | Như `db:deploy` nhưng vào Supabase, đọc `.env.supabase.local` (mục 4)     |
| `pnpm start:supabase`     | Chạy bản đã build, kết nối Supabase qua bộ gộp — để kiểm (mục 4)          |

Quy trình viết migration: `.agents/tasks/ADD_DB_MIGRATION.md`.

---

## 4. Cơ sở dữ liệu: local và Supabase

Hệ thống chạy trên **Supabase — chỉ dùng PostgreSQL và lưu trữ tệp**, không dùng phần đăng nhập
của Supabase (AS-029). Máy dev dùng PostgreSQL trong Docker, vì `prisma migrate dev` cần tạo một
shadow database mà Supabase không cho tạo. Migration viết ở local, áp lên Supabase bằng
`pnpm db:deploy:supabase`.

Hai file biến môi trường trong `apps/api`, **cả hai bị git bỏ qua**:

| File                  | Trỏ tới                 | Ai đọc                                                       |
| --------------------- | ----------------------- | ------------------------------------------------------------ |
| `.env`                | PostgreSQL Docker ở máy | Mọi lệnh thường: `dev:api`, `db:migrate`, `db:deploy`, test… |
| `.env.supabase.local` | Project Supabase thật   | Chỉ `pnpm db:deploy:supabase` và `pnpm start:supabase`       |

Bản mẫu được commit là `.env.example` và `.env.supabase.example` — chỉ có tên biến, không có giá
trị thật (`.env.example` có sẵn chuỗi tới Postgres Docker, trùng `compose.yaml`, không phải bí
mật). Hai lệnh `:supabase` đọc file `.local` bằng `scripts/with-supabase-env.js`: **thiếu file
hoặc để trống thì dừng hẳn**, không lặng lẽ chạy trên Postgres ở máy.

### Hai chuỗi kết nối

| Biến           | Ai dùng                         | Trên Supabase (gói miễn phí)                            | User                   |
| -------------- | ------------------------------- | ------------------------------------------------------- | ---------------------- |
| `DATABASE_URL` | Ứng dụng (`PrismaService`)      | Bộ gộp Supavisor, chế độ **transaction**, cổng **6543** | `prisma.<project-ref>` |
| `DIRECT_URL`   | Prisma CLI (`prisma.config.ts`) | Bộ gộp Supavisor, chế độ **session**, cổng **5432**     | `prisma.<project-ref>` |

- **Qua bộ gộp, tên user luôn có hậu tố mã project**: `prisma.<project-ref>` — bộ gộp dùng chung
  nhiều project nên cần biết bạn thuộc project nào. **Kết nối trực tiếp** (`db.<project-ref>.supabase.co`)
  thì không có hậu tố: user là `prisma`.
- Migration không đi qua chế độ transaction được — nó giữ khóa và phiên. Ở gói miễn phí, kết nối
  trực tiếp **chỉ chạy trên IPv6**, nên `DIRECT_URL` dùng **session pooler** (chạy IPv4 lẫn IPv6).
  Chỉ dùng kết nối trực tiếp khi chắc mạng có IPv6 hoặc đã mua IPv4 add-on.
- Chế độ transaction không hỗ trợ prepared statement có tên. `@prisma/adapter-pg` chỉ đặt tên khi
  truyền `statementNameGenerator` — **đừng thêm tùy chọn đó** vào `PrismaService`.
- Host bộ gộp **chép từ nút Connect**, không tự ghép từ tên vùng: trong host có chỉ số cụm
  (`aws-0-…`, `aws-1-…`) mà một vùng có thể có nhiều cụm.

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

Mật khẩu và chuỗi kết nối **không bao giờ** dán vào chat, issue, PR hay commit.

**Bước 1 — Sinh mật khẩu cho user `prisma`** ngay trên máy mình:

```bash
node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"
```

Ra 48 ký tự `0-9a-f` — đủ mạnh, và không chứa ký tự nào phải mã hóa khi đưa vào chuỗi kết nối
(`@ : / ? # %` mà lọt vào là chuỗi kết nối hỏng một cách khó hiểu). Cất vào trình quản lý mật
khẩu.

**Bước 2 — Tạo user `prisma`.** Mở SQL Editor của Supabase (chạy bằng quyền `postgres` mặc định),
dán đoạn dưới, thay `<MẬT_KHẨU>` bằng mật khẩu ở bước 1, chạy **một lần**:

```sql
-- User duy nhất mà CẢ migration LẪN ứng dụng dùng. Nó tạo bảng nên sở hữu bảng,
-- và chủ sở hữu bảng vượt qua RLS.
create role prisma with login password '<MẬT_KHẨU>';

-- Tài khoản quản trị của dashboard (postgres) vẫn quản lý được bảng do prisma sở hữu.
grant prisma to postgres;

-- Quyền tạo bảng trong schema public — thiếu thì migration đầu tiên báo không đủ quyền.
grant usage, create on schema public to prisma;
```

Đoạn này **cố ý khác** mẫu trong
[hướng dẫn Prisma của Supabase](https://supabase.com/docs/guides/database/prisma) ở ba chỗ:

- **Không `bypassrls`.** Vượt RLS nhờ sở hữu bảng là đủ. `bypassrls` vượt RLS ở mọi bảng, mọi
  lúc, không tắt được theo từng bảng — nếu sau này thêm policy thật làm lớp cô lập dữ liệu giữa các
  chủ trọ, nó vô hiệu hóa policy đó mà không ai thấy. Vượt RLS nhờ sở hữu thì vẫn tắt được cho
  từng bảng bằng `FORCE ROW LEVEL SECURITY`.
- **Không `createdb`.** `prisma migrate dev` cần tạo shadow database nên chỉ chạy ở máy local,
  không bao giờ chạy trên Supabase.
- **Không cấp quyền trên bảng, hàm, sequence do `postgres` sở hữu.** Schema `public` của dự án chỉ
  chứa bảng do `prisma` tạo; bảng nào do `postgres` sở hữu là đang sai — bước 6 kiểm điều này.

Chạy xong thì **xóa câu lệnh vừa chạy khỏi SQL Editor** (snippet / lịch sử): nó đang chứa mật khẩu
ở dạng chữ thường.

**Bước 3 — Tắt Data API** trong Project Settings → API. Dự án không dùng Data API; để bật là mở
thêm một đường vào dữ liệu nằm ngoài NestJS. RLS là lớp chặn thứ hai, không thay cho bước này.

**Bước 4 — Điền chuỗi kết nối vào `apps/api/.env.supabase.local`.**

```bash
cp apps/api/.env.supabase.example apps/api/.env.supabase.local
```

Bấm **Connect** trên dashboard, chọn mục pooler, lấy hai thứ: **host bộ gộp** và **mã project**
(phần sau `postgres.` trong tên user mẫu — cũng là Reference ID ở Project Settings → General). Chuỗi
mẫu trong Connect dùng user `postgres` và mật khẩu của project — **đổi cả hai** thành của `prisma`:

```dotenv
DATABASE_URL=postgresql://prisma.<project-ref>:<MẬT_KHẨU>@<host-bộ-gộp>:6543/postgres
DIRECT_URL=postgresql://prisma.<project-ref>:<MẬT_KHẨU>@<host-bộ-gộp>:5432/postgres
```

Hai chuỗi chung host, khác cổng (6543 / 5432), **cùng user**. Chỉ khi mạng có IPv6 (hoặc đã mua
IPv4 add-on) mới có thể đổi `DIRECT_URL` sang kết nối trực tiếp — lúc đó user **không** có hậu
tố: `postgresql://prisma:<MẬT_KHẨU>@db.<project-ref>.supabase.co:5432/postgres`.

Kiểm: `git status` **không** được thấy `.env.supabase.local`.

**Bước 5 — Kiểm đường ứng dụng qua bộ gộp.** Chạy được ngay, chưa cần migration — `/health` chỉ
chạy `SELECT 1`:

```bash
pnpm --filter api build
pnpm --filter api start:supabase
curl http://localhost:8089/api/v1/health      # {"status":"ok","database":"up"}
```

Trả 503 thì log của API ghi lý do (sai mật khẩu, sai tên user, sai host) — đọc log, không cần
in chuỗi kết nối ra. Tắt API sau khi kiểm.

**Bước 6 — Áp migration rồi kiểm** (khi đã có migration):

```bash
pnpm --filter api db:deploy:supabase
```

Chạy hai truy vấn dưới trong SQL Editor — **cả hai phải ra 0 dòng**:

```sql
-- Bảng không do prisma sở hữu: ứng dụng sẽ đọc rỗng ở bảng đó mà không báo lỗi.
select tablename, tableowner from pg_tables
where schemaname = 'public' and tableowner <> 'prisma';

-- Bảng chưa bật RLS: lộ ra Data API nếu ai đó bật lại nó.
select c.relname from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
```

Chạy lại bước 5 để chắc ứng dụng vẫn truy vấn được sau khi có bảng.

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
