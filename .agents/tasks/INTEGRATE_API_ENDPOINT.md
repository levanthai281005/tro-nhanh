# Nối một endpoint mới

Backend là NestJS nằm cùng monorepo tại `apps/api`. Một endpoint đi trọn từ schema dùng chung
→ module backend → service phía giao diện trong **cùng một lát cắt dọc**; không có bước trao
đổi file contract giữa hai repo.

---

## Bước 1 — Khai schema dùng chung

Khai request/response bằng Zod ở `packages/schemas`. Kiểu dữ liệu suy ra bằng `z.infer`;
**không khai lại DTO hay type riêng** ở `apps/api` lẫn `apps/web`/`apps/mobile`. Ràng buộc
lấy từ `../business/VALIDATION_RULES.md`.

## Bước 2 — Dựng endpoint ở `apps/api`

- Đặt vào **đúng module** theo `../business/BACKEND_SERVICES.md`; module chưa có thì cập nhật
  tài liệu trước.
- Validate đầu vào bằng schema ở Bước 1 qua validation pipe dùng chung.
- Guard theo namespace (Bước 3); endpoint ghi dưới `/management/*` phải đi qua guard của
  `SubscriptionModule`, `/residency/*` qua guard của `ResidencyModule`.
- Response theo `../business/API_RESPONSE_STANDARD.md`; lỗi nghiệp vụ ném kèm `code`.
- Đụng cấu trúc dữ liệu thì tạo migration Prisma có đánh số — không `db push` lên môi trường
  chung.
- Thêm endpoint vào `../business/API_CONTRACT.md` cùng PR.

## Bước 3 — Kiểm tra namespace

Tra `../business/API_CONTRACT.md`. Namespace quyết định guard nào áp dụng:

| Tiền tố | Guard |
|---|---|
| `/public/*` | không cần đăng nhập |
| `/marketplace/*` | cần đăng nhập |
| `/management/*` | đăng nhập + role Landlord + gating theo `subscriptionStatus` |
| `/residency/*` | đăng nhập + residency guard (đã liên kết với phòng) |
| `/admin/*` | đăng nhập + role nội bộ |

Gọi sai tiền tố sẽ bị guard chặn nhầm hoặc lọt guard đáng lẽ phải có.

## Bước 4 — Viết service phía giao diện

Service đặt trong feature tương ứng, bọc quanh client của `@tronhanh/api`. Service chịu
trách nhiệm biến đổi dữ liệu cho hợp với nhu cầu giao diện, không để component tự xử lý dữ
liệu thô.

## Bước 5 — Nối TanStack Query

Server state thuộc TanStack Query, không nhét vào Zustand. Đặt query key nhất quán theo
feature và tài nguyên. Sau mutation, invalidate đúng key liên quan. Mọi thao tác ghi đi qua
`apps/api` — không dùng Server Actions để ghi dữ liệu.

## Bước 6 — Xử lý lỗi theo mã

Xử lý dựa trên `error.code`, **không dựa vào chuỗi message** vì message có thể đổi. Các mã
nghiệp vụ cần xử lý riêng:

- `WORKSPACE_READ_ONLY` — hiện lời mời gia hạn, **không làm mất dữ liệu form đang nhập**
- `RESIDENCY_NOT_LINKED` — hướng dẫn người dùng chờ chủ trọ gắn phòng
- `METER_SUBMISSION_DISABLED` — ẩn chức năng gửi chỉ số
- `REVIEW_NOT_ELIGIBLE` — giải thích điều kiện được đánh giá

## Khi lát cắt backend chưa tới lượt

Dùng dữ liệu mẫu khớp đúng schema ở Bước 1 và đánh dấu `// TODO: nối API thật`. Khi endpoint
thật xong thì chỉ đổi nguồn, không phải viết lại giao diện.
