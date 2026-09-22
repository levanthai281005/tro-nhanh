# Trọ Nhanh

Monorepo cho nền tảng Trọ Nhanh: website (khu công khai, workspace chủ trọ, khu người ở),
ứng dụng mobile cho người ở và backend API — cùng một hệ TypeScript.

## Công nghệ chính

- Node.js `22.14.x`, pnpm `9.15.0` và Turborepo.
- Web: Next.js `16.3.0`, React 19, TypeScript, Tailwind CSS `3.4.17` và shadcn/ui.
- Mobile: Expo SDK 57, Expo Router, React Native và NativeWind 4.
- Backend: NestJS (TypeScript, Node 22), Prisma; cổng thanh toán PayOS.
- Dùng chung: Axios, TanStack Query, Zustand, React Hook Form, Zod và date-fns. Định nghĩa dữ
  liệu dùng chung là Zod schema ở `packages/schemas` — cả ba ứng dụng cùng dùng.

Tailwind phải giữ đúng phiên bản `3.4.17` để web và NativeWind tiếp tục dùng chung preset.

## Cấu trúc workspace

```text
tro-nhanh/
├── .agents/
│   ├── business/                 # Tài liệu nghiệp vụ theo domain
│   ├── rules/                    # Coding standards và naming conventions
│   ├── AGENTS.md                 # Workspace guidelines cho agent
│   └── CLAUDE.md
├── apps/
│   ├── web/                      # Next.js App Router
│   ├── mobile/                   # Expo Router
│   └── api/                      # NestJS + Prisma (chưa dựng)
├── packages/
│   ├── api/                      # Axios client dùng chung
│   ├── schemas/                  # Zod schema dùng chung
│   ├── types/                    # Type dùng chung không suy từ schema
│   ├── constants/                # Constant nghiệp vụ dùng chung
│   ├── utils/                    # Hàm thuần dùng chung
│   └── config/                   # TypeScript và Tailwind preset dùng chung
├── docs/spec/                    # Đặc tả kỹ thuật — nguồn chân lý nghiệp vụ
├── AGENTS.md                     # Hướng dẫn cho agent (Claude Code và Codex đọc chung)
├── HELP.md                       # Liên kết tài liệu cần đọc
└── turbo.json
```

### Cấu trúc web

```text
apps/web/src/
├── app/                          # Route và route group
│   ├── (public)/
│   ├── (workspace)/
│   └── (residency)/
├── features/                     # Module theo nghiệp vụ
├── components/                   # Component dùng chung trong web
├── hooks/                        # Hook dùng chung trong web
├── lib/                          # Cấu hình/adapter SDK bên thứ ba
├── services/                     # Điều phối API dùng chung cấp ứng dụng
├── utils/                        # Hàm thuần, ví dụ cn.ts
├── constants/                    # Constant riêng của web
└── types/                        # View model và UI type riêng của web
```

Một feature chỉ tạo các phần thực sự cần dùng:

```text
features/auth/
├── components/
├── hooks/
├── schemas/
├── server/
├── services/
├── types/
└── constants/
```

Mobile áp dụng cùng cách tổ chức feature nhưng không tạo `server/`, vì ứng dụng Expo thực
hiện mutation qua backend API thay vì Server Actions:

```text
apps/mobile/src/features/residency/
├── components/
├── hooks/
├── schemas/
├── services/
├── types/
└── constants/
```

Không import trực tiếp giữa `marketplace`, `workspace` và `residency`. Logic thật sự dùng
chung phải được chuyển đến thư mục hoặc package chung phù hợp.

## Phân chia trách nhiệm

| Vị trí                | Trách nhiệm                                        |
| --------------------- | -------------------------------------------------- |
| `packages/api`        | HTTP client thô và interceptor dùng chung          |
| `apps/*/src/services` | Điều phối API theo nhu cầu của từng ứng dụng       |
| `packages/schemas`    | Zod schema — nguồn định nghĩa dữ liệu, `z.infer`   |
| `packages/types`      | Type dùng chung không suy được từ schema           |
| `apps/*/src/types`    | Props, view model và type chỉ phục vụ UI           |
| `components`          | Thành phần dùng lại qua nhiều feature              |
| `features`            | Mã nguồn thuộc sở hữu của một feature              |
| `lib`                 | Instance, cấu hình hoặc adapter của SDK bên thứ ba |
| `utils`               | Hàm thuần, không giữ trạng thái                    |

## Bắt đầu

Yêu cầu:

- Node.js `22.14.x`
- pnpm `9.15.0`

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile
pnpm dev:web
```

Chạy mobile:

```bash
pnpm dev:mobile
```

## Biến môi trường

Web:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8089
```

Mobile:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.10:8089
```

Chỉ biến thực sự công khai mới được dùng tiền tố `NEXT_PUBLIC_`. Secret không được import
vào Client Component.

## Docker development

```bash
pnpm docker:dev
pnpm docker:mobile
pnpm docker:check
pnpm docker:down
```

- Next.js: `http://localhost:3000`
- Expo/Metro: `http://localhost:8081`
- API `apps/api`: `http://localhost:8089` (cổng chốt khi dựng)

Khi lockfile hoặc dependency thay đổi, xóa volume dependency rồi build lại container:

```bash
docker compose down --volumes
pnpm docker:dev
```

## Định nghĩa dữ liệu dùng chung

Không có bước sinh mã từ tài liệu API. Định nghĩa dữ liệu khai **một lần** bằng Zod ở
`packages/schemas`: backend `apps/api` dùng để kiểm tra đầu vào, web và mobile dùng cho biểu
mẫu, kiểu dữ liệu suy ra bằng `z.infer`. Sửa một trường là cả ba ứng dụng báo lỗi biên dịch.

Cấu trúc cơ sở dữ liệu chỉ thay đổi qua migration Prisma có đánh số trong `apps/api`; không
sửa tay DB. Lệnh chạy API và migration bổ sung vào đây khi dựng `apps/api`.

## Quy chuẩn quan trọng

- Ưu tiên Server Component; Client Component chỉ nằm tại boundary cần tương tác.
- Data fetching mặc định thực hiện trên server với chiến lược cache được khai báo rõ.
- Mọi thao tác ghi đi qua `apps/api`; Server Actions chỉ cho việc thuần server của web (cookie
  phiên, revalidate), không ghi thẳng DB.
- Dùng `next/image` và `next/link`; web tải Google Font `Be Vietnam Pro` trong
  `globals.css` theo shared Tailwind preset.
- Dùng absolute import `@/*`, TypeScript strict và không dùng explicit `any`.
- Server state thuộc TanStack Query; Zustand chỉ dành cho client/UI state.
- Internal dependency phải dùng `workspace:*`.
- Giữ code có trạng thái hoặc SDK integration trong `lib`; giữ hàm thuần trong `utils`.

Đọc đầy đủ [SOURCE_CODE_GUIDELINES.md](./SOURCE_CODE_GUIDELINES.md),
[.agents/AGENTS.md](./.agents/AGENTS.md),
[CODING_STANDARDS](./.agents/rules/CODING_STANDARDS.md),
[NAMING_CONVENTIONS](./.agents/rules/NAMING_CONVENTIONS.md) và [HELP.md](./HELP.md)
trước khi triển khai feature.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm format:check
```

GitHub Actions chạy install, lint, typecheck và build. Khi thay dependency, luôn commit thay
đổi tương ứng trong `pnpm-lock.yaml`.

## Routes hiện có

- Marketplace công khai: `/`
- Workspace chủ trọ: `/chu-tro`
- Không gian người ở: `/nguoi-o`

Các màn hình hiện tại mới là khung nền; feature nghiệp vụ sẽ được phát triển trong
`apps/web/src/features/<feature>` theo cấu trúc ở trên.
