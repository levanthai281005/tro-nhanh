# Source Code Guidelines

Tài liệu này mô tả cách đọc, sử dụng và mở rộng source code của Trọ Nhanh (web, mobile và api).
Hãy đọc cùng
`README.md`, `HELP.md` và các quy tắc trong `.agents/rules/` trước khi triển khai feature.

## 1. Tổng quan kiến trúc

Dự án là monorepo TypeScript dùng pnpm workspace và Turborepo:

```text
tro-nhanh/
├── apps/
│   ├── web/                  # Next.js App Router
│   ├── mobile/               # Expo Router
│   └── api/                  # NestJS + Prisma (chưa dựng)
├── packages/
│   ├── api/                  # HTTP client dùng chung
│   ├── config/               # TypeScript và Tailwind config dùng chung
│   ├── constants/            # Constant nghiệp vụ dùng chung
│   ├── schemas/              # Zod schema — nguồn định nghĩa dữ liệu chung
│   ├── types/                # Type dùng chung không suy từ schema
│   └── utils/                # Hàm thuần dùng chung
├── .agents/                  # Hướng dẫn dành cho coding agent
├── docs/spec/                # Đặc tả kỹ thuật — nguồn chân lý nghiệp vụ
├── docker/                   # Entrypoint cho môi trường development
└── turbo.json                # Task graph của monorepo
```

Ba miền nghiệp vụ chính (áp dụng cho cả `features/*` phía giao diện lẫn module phía api):

- `marketplace`: trải nghiệm công khai và tìm phòng.
- `workspace`: công cụ vận hành dành cho chủ trọ.
- `residency`: trải nghiệm người ở trên web và mobile.

Không import trực tiếp giữa ba miền này. Code thật sự dùng chung phải được chuyển vào vị trí dùng
chung phù hợp.

## 2. Thư mục và file ở root

| Đường dẫn             | Chức năng                                                               |
| --------------------- | ----------------------------------------------------------------------- |
| `package.json`        | Script dùng chung, phiên bản Node/pnpm và dev dependency cấp workspace. |
| `pnpm-workspace.yaml` | Khai báo `apps/*` và `packages/*` là workspace package.                 |
| `pnpm-lock.yaml`      | Khóa phiên bản dependency; phải cập nhật cùng mọi thay đổi dependency.  |
| `turbo.json`          | Quan hệ phụ thuộc và cache của build, lint, typecheck, dev.             |
| `tsconfig.json`       | Project references cấp root.                                            |
| `eslint.config.mjs`   | Quy tắc TypeScript, Tailwind và boundary giữa các domain.               |
| `compose.yaml`        | Web, mobile và quality-check services cho development.                  |
| `Dockerfile.dev`      | Image Node/pnpm dùng trong development.                                 |
| `README.md`           | Cài đặt, lệnh chạy và giới thiệu nhanh dự án.                           |
| `HELP.md`             | Liên kết tới tài liệu framework đúng phiên bản.                         |

Không có bước sinh mã từ tài liệu API. Định nghĩa dữ liệu dùng chung khai một lần bằng Zod ở
`packages/schemas`; khi backend đổi một trường, cả ba ứng dụng báo lỗi typecheck ngay. Cấu trúc
cơ sở dữ liệu chỉ thay đổi qua migration Prisma có đánh số trong `apps/api`.

## 3. Web application

`apps/web` dùng Next.js App Router. Source code nằm trong `apps/web/src`:

```text
src/
├── app/                      # Route, layout, loading/error boundary
├── features/                 # Code thuộc sở hữu của từng feature
├── components/               # UI dùng lại qua nhiều feature
├── hooks/                    # Hook dùng chung trong web
├── lib/                      # SDK instance, provider và adapter thư viện
├── services/                 # Điều phối API cấp ứng dụng
├── constants/                # Constant chỉ dùng cho web
├── types/                    # Props/view model chỉ dùng cho web
└── utils/                    # Hàm thuần, không giữ state
```

Các route group hiện tại:

- `(public)`: marketplace công khai, hiện có `/`.
- `(workspace)`: khu vực chủ trọ, hiện có `/chu-tro`.
- `(residency)`: khu vực người ở, hiện có `/nguoi-o`.

Page và layout mặc định là Server Component. Chỉ tạo Client Component khi cần hook, event hoặc
browser API, và giữ client boundary nhỏ nhất có thể. Không đặt `'use client'` trực tiếp trong
`page.tsx`.

Server Component lấy dữ liệu gần nơi sử dụng và khai báo cache/revalidation rõ ràng. Mọi thao tác
ghi đi qua `apps/api` (service của feature → TanStack Query mutation); Server Actions chỉ dành cho
việc thuần server của web như cookie phiên hoặc revalidate, và vẫn phải tự xác thực người dùng.

## 4. Mobile application

`apps/mobile` dùng Expo Router. Source code nằm trong `apps/mobile/src`:

```text
src/
├── app/                      # File-based route và screen composition
├── features/                 # UI và logic nghiệp vụ theo feature
├── components/               # Component dùng lại qua nhiều feature
├── hooks/                    # Hook dùng chung trong mobile
├── lib/                      # Adapter/cấu hình SDK
├── providers/                # Provider cấp ứng dụng
├── services/                 # API orchestration và device services
├── constants/                # Constant chỉ dùng cho mobile
├── types/                    # Type chỉ phục vụ mobile UI
└── utils/                    # Hàm thuần
```

File trong `src/app` chỉ giữ navigation và composition cấp cao. UI/logic nghiệp vụ phải nằm trong
feature tương ứng. Mobile không dùng Server Action và không tạo thư mục `server/` trong feature.

`AppProviders` tạo TanStack Query client. `services/auth-token.ts` lưu access token bằng Expo
SecureStore và đăng ký token getter cho shared Axios client.

Biến `EXPO_PUBLIC_*` được nhúng vào bundle và luôn được xem là công khai. Truy cập bằng dot notation
tĩnh; không lưu secret trong các biến này.

## 5. API application

`apps/api` là backend NestJS duy nhất của hệ thống (chưa dựng — việc kế tiếp theo
`.agents/PROJECT_STATE.md`). Những điều đã chốt, chi tiết ở
`.agents/rules/CODING_STANDARDS.md` mục NestJS:

- Chia 17 module theo hai domain + Shared Kernel, danh sách chuẩn ở
  `.agents/business/BACKEND_SERVICES.md`. Hai domain không truy vấn thẳng bảng của nhau; đi qua
  service công khai của module sở hữu.
- Truy cập dữ liệu qua Prisma; migration có đánh số là nguồn chân lý về cấu trúc, không sửa tay DB.
- Kiểm tra đầu vào bằng Zod schema từ `@tronhanh/schemas` qua một validation pipe dùng chung.
- Response và mã lỗi theo `.agents/business/API_RESPONSE_STANDARD.md`, áp bằng interceptor và
  exception filter dùng chung.
- Guard mount theo tiền tố namespace (`.agents/business/API_CONTRACT.md`): `/management/*` qua
  gating của `SubscriptionModule`, `/residency/*` qua residency guard.
- Cổng thanh toán PayOS; webhook là nơi duy nhất kích hoạt quyền lợi sau thanh toán. SMS chỉ gửi
  mã xác thực.

Cấu trúc thư mục bên trong `apps/api` và lệnh chạy local sẽ bổ sung vào đây khi dựng.

## 6. Shared packages

- `@tronhanh/api`: Axios instance, base URL, timeout và interceptor dùng chung. Không đặt logic UI
  hoặc query key tại đây.
- `@tronhanh/schemas`: Zod schema — nguồn định nghĩa dữ liệu duy nhất, cả web, mobile và api cùng
  dùng; kiểu suy ra bằng `z.infer`.
- `@tronhanh/types`: type dùng chung không suy được từ schema. UI model không thuộc package này.
- `@tronhanh/constants`: trạng thái, giới hạn và constant nghiệp vụ dùng chung.
- `@tronhanh/utils`: hàm thuần, không side effect và không phụ thuộc framework UI.
- `@tronhanh/config`: TypeScript base config và Tailwind design preset.

Dependency nội bộ luôn dùng phiên bản `workspace:*`.

## 7. Cấu trúc một feature

Chỉ tạo thư mục khi có nhu cầu thực tế:

```text
features/<feature-name>/
├── components/
├── hooks/
├── schemas/
├── server/                   # Chỉ có trên web
├── services/
├── types/
└── constants/
```

Component điều phối hiển thị; service gọi API và chuẩn hóa lỗi; hook nối service với state/query;
schema kiểm tra input; type mô tả UI model. Không tạo file `common`, `helper` hoặc abstraction chung
chung khi chưa có trách nhiệm cụ thể.

## 8. Data, state và API

- TanStack Query quản lý server state: cache, loading, retry, refetch và mutation.
- Zustand chỉ quản lý client/UI state không có nguồn gốc từ server.
- Mọi request-facing UI phải có loading, empty và error state phù hợp.
- Query key ổn định và thuộc feature sở hữu dữ liệu.
- Sau mutation, revalidate hoặc invalidate đúng dữ liệu liên quan.
- Component không chứa Axios orchestration phức tạp.

Web đọc API URL từ `NEXT_PUBLIC_API_URL`; mobile đọc từ `EXPO_PUBLIC_API_URL`. Shared API client
dùng timeout 15 giây và tự gắn bearer token khi token getter trả về giá trị.

## 9. Styling và assets

Tailwind phải giữ ở phiên bản `3.4.17` trên toàn workspace. Web và NativeWind dùng chung token từ
`packages/config/tailwind-preset.js`.

- Web dùng `next/image` cho ảnh và `next/link` cho internal navigation.
- Mobile ưu tiên `expo-image` cho ảnh cần cache/placeholder/transition.
- Asset tĩnh phải có tên có nghĩa; mobile dùng static import hoặc `require` để Metro bundle asset.
- Không hardcode màu mới nếu design token hiện có đã diễn tả đúng ý nghĩa.

## 10. Quy trình phát triển

```bash
pnpm install --frozen-lockfile
pnpm dev:web
pnpm dev:mobile
```

Trước khi bàn giao thay đổi, chạy:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm format:check
```

Khi thêm dependency, dùng đúng workspace/package đích và commit thay đổi tương ứng trong
`pnpm-lock.yaml`. Không reset hoặc ghi đè thay đổi không thuộc phạm vi công việc hiện tại.

## 11. File cá nhân không đưa lên Git

Repo hiện dùng `.git/info/exclude` để Git bỏ qua các file cá nhân mà không thay đổi `.gitignore` được chia sẻ.

Nếu tạo clone mới, thêm lại các dòng file cá nhân vào `.git/info/exclude` của clone đó:

Vd:

```gitignore
.agents/skills/
memory.md
```

Nếu file đã từng được Git track, quy tắc exclude không có tác dụng cho đến khi bỏ file khỏi index
bằng `git rm --cached <path>` và commit thay đổi đó. Không dùng `assume-unchanged` hoặc
`skip-worktree` như cơ chế ignore lâu dài vì chúng khó phát hiện và dễ gây nhầm lẫn khi đồng bộ.
