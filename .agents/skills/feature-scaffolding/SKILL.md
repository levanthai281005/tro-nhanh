---
name: feature-scaffolding
description: Dựng thư mục và file cho một feature mới đúng cấu trúc workspace — xác định domain, tạo khung component/hook/schema/service, đặt tên theo quy ước. Dùng khi bắt đầu một phần chức năng mới.
---

# Dựng feature mới đúng cấu trúc

## Bước 1 — Xác định domain

Ba domain, **cấm import chéo** giữa chúng:

| Domain | Thư mục web | Route group | Phục vụ ai |
|---|---|---|---|
| `marketplace` | `apps/web/src/features/marketplace/` | `app/(public)/` | Guest, Tenant |
| `workspace` | `apps/web/src/features/workspace/` | `app/(workspace)/chu-tro/` | Landlord |
| `residency` | `apps/web/src/features/residency/` | `app/(residency)/nguoi-o/` | Người ở |

Tra `../../business/FEATURE_MODULES.md` để biết chức năng thuộc module nào, rồi suy ra domain.
Phía backend, module NestJS tương ứng tra `../../business/BACKEND_SERVICES.md`.

## Bước 2 — Cấu trúc một feature

Mỗi feature **tự sở hữu** component, hook, schema, service, type và constant của nó:

```
features/<domain>/<ten-feature>/
  components/          # component chỉ dùng trong feature này
  hooks/               # logic tách khỏi component
  schemas/             # Zod schema riêng của feature
  server/              # server action, chỉ có ở web
  services/            # gọi API, bọc quanh @tronhanh/api
  types/               # type cục bộ của feature
  constants.ts
```

Thư mục feature đặt tên **kebab-case** và phản ánh đúng domain nghiệp vụ, ví dụ
`room-management/`, `invoice-detail/`. Tránh tên mơ hồ như `common/` hay `helper/`.

## Bước 3 — Biết đặt gì ở đâu

| Loại code | Nơi đặt |
|---|---|
| Chỉ feature này dùng | trong thư mục feature |
| Nhiều feature trong cùng app dùng | `apps/<app>/src/components`, `hooks`, `utils` |
| Cả web, mobile và api dùng | `packages/*` (schema thực thể luôn ở `packages/schemas`) |
| Cấu hình hoặc adapter SDK bên thứ ba | `apps/<app>/src/lib` |
| Hàm thuần, không giữ trạng thái | `apps/<app>/src/utils` |

Nếu hai domain cần chung một component, **không copy** — chuyển lên tầng dùng chung phù hợp.

## Bước 4 — Quy ước đặt tên

Theo `../../rules/NAMING_CONVENTIONS.md`: component và type dùng PascalCase; hook dùng
camelCase với tiền tố `use`; service và utility dùng camelCase; constant export dùng
UPPER_SNAKE_CASE; thư mục feature dùng kebab-case.

## Bước 5 — Khác biệt của mobile

Feature mobile **không tạo thư mục `server/`**. Route file trong `apps/mobile/src/app` chỉ
giữ navigation và composition cấp cao; mã nghiệp vụ nằm trong feature tương ứng.
