# Dựng dự án trên máy mới

Danh sách những thứ **thật sự cần** để chạy được repo này, kiểm chứng từ `.nvmrc`,
`package.json`, `.env.example` và `.github/workflows/ci.yml` — không phải liệt kê theo trí nhớ.

`README.md` mô tả đầy đủ kiến trúc và quy chuẩn code. File này chỉ trả lời đúng một câu hỏi:
**cần cài gì để máy mới không lỗi.**

---

## 1. Bắt buộc — thiếu là lỗi ngay

| Thứ              | Phiên bản      | Vì sao đúng con số này                          |
| ---------------- | -------------- | ----------------------------------------------- |
| Node.js          | **22.14.x**    | `.nvmrc` ghi `22.14.0`, `engines` ghi `22.14.x` |
| pnpm             | **9.15.0**     | Trường `packageManager`. Bật qua corepack       |
| Git              | bản mới bất kỳ | —                                               |
| Đăng nhập GitHub | —              | Chưa đăng nhập là push thất bại                 |

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

## 3. KHÔNG cần — khỏi mất công đi tìm

- **File `.env`.** Repo hiện không có file `.env` nào mà vẫn chạy. `packages/api` có tạo axios
  client đọc `NEXT_PUBLIC_API_URL`, nhưng `apiClient` **chưa được gọi ở bất kỳ đâu** — toàn bộ
  màn hình đang chạy mock data. Khi nối API thật mới cần.
- **Backend.** Chưa nối. Sẽ là NestJS đặt **trong cùng repo này** (repo đã đổi tên từ
  `tro-nhanh-fe` sang `tro-nhanh` ngày 21/09/2026 để chứa cả hai). Chưa dựng nên chưa cần chạy.
- **`pnpm api:gen`.** `packages/types/src/api.ts` còn là stub rỗng vì backend chưa sinh
  `openapi.json` thật.
- **Docker.** Có sẵn `compose.yaml` nhưng chạy `pnpm dev:web` trực tiếp là đủ.

`.env.example` chỉ có đúng một biến `EXPO_HOST_IP`, và nó chỉ dùng khi mở Expo trên điện thoại
thật qua Docker.

---

## 4. Tùy chọn theo nhu cầu

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

## 5. Kiểm tra máy mới đã ổn chưa

Chạy đúng bộ mà GitHub Actions chạy (`.github/workflows/ci.yml`):

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Mốc để đối chiếu: `pnpm test` phải ra **29 test pass** ở `@tronhanh/utils` (22 của `vietqr`,
7 của `invoiceNote`) và **26 test** ở `@tronhanh/access`.

Xanh hết là máy mới dựng đúng.

---

## 6. Cạm bẫy dễ dính trên máy mới

**Cổng 3000 bị chiếm.** Dev server cũ chưa tắt thì Next tự nhảy sang 3001, rồi mở nhầm cổng và
tưởng code không ăn. Luôn tắt dev server sau khi kiểm xong.

**Cài Node "bản mới nhất" thay vì 22.14.x.** Xem lại mục 1.

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
