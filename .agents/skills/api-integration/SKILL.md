---
name: api-integration
description: Nối endpoint của apps/api tới giao diện — khai Zod schema dùng chung, viết service, dùng TanStack Query, xử lý lỗi theo mã. Dùng khi cần lấy hoặc gửi dữ liệu tới backend.
---

# Nối API từ backend tới giao diện

Backend là NestJS nằm cùng monorepo tại `apps/api`. Cầu nối giữa backend và giao diện là
**Zod schema ở `packages/schemas`**: backend dùng để kiểm tra đầu vào, web và mobile dùng cho
biểu mẫu, kiểu dữ liệu suy ra từ chính schema (`z.infer`). Không có bước sinh mã.

## Luồng dữ liệu

```text
packages/schemas ─┬─► apps/api (validate + trả về đúng shape)
                  └─► packages/api (HTTP client) → services/ → TanStack Query → UI
```

Mỗi mắt xích có một trách nhiệm; không nhảy cóc, ví dụ không gọi thẳng axios trong component.

## Bước 1 — Schema trước

Endpoint cần kiểu dữ liệu nào thì khai request/response bằng Zod ở `packages/schemas` và
**dùng cùng schema đó ở cả hai đầu**. Client không viết type tay cho dữ liệu backend trả về.

Nếu dữ liệu backend trả về khác với hình dạng giao diện cần, vấn đề nằm ở schema hoặc ở
backend — không được "chữa" bằng cách ép kiểu ở client. Ràng buộc chỉ thuộc về form (bắt buộc
khai, chuỗi rỗng khác số 0) đặt trong feature, không đưa vào schema thực thể.

## Bước 2 — Chọn đúng namespace

Namespace quyết định guard nào áp dụng — tra `../../business/API_CONTRACT.md`:

| Tiền tố | Guard |
|---|---|
| `/public/*` | không cần đăng nhập |
| `/marketplace/*` | cần đăng nhập |
| `/management/*` | đăng nhập + role Landlord + gating theo `subscriptionStatus` |
| `/residency/*` | đăng nhập + residency guard (đã liên kết với phòng) |
| `/admin/*` | đăng nhập + role nội bộ |

## Bước 3 — Viết service

Service đặt trong feature, bọc quanh client của `@tronhanh/api`. Service chịu trách nhiệm
biến đổi dữ liệu cho hợp nhu cầu giao diện — component không xử lý dữ liệu thô.

## Bước 4 — TanStack Query

Server state thuộc TanStack Query; **Zustand chỉ dành cho state client/UI** không có nguồn
gốc từ server. Đặt query key nhất quán theo feature và tài nguyên; sau mutation thì
invalidate đúng key liên quan.

Ở web, ưu tiên lấy dữ liệu trực tiếp trong Server Component khi không cần tương tác; dùng
TanStack Query cho phần client cần cache và refetch. **Mọi thao tác ghi đi qua `apps/api`**;
Server Actions chỉ dành cho việc thuần server của web (cookie phiên, revalidate).

## Bước 5 — Xử lý lỗi theo mã, không theo message

Backend trả `{ error: { code, message, details } }`. Xử lý dựa trên `error.code` vì message
có thể đổi bất cứ lúc nào. Các mã cần xử lý riêng:

| Mã | Cách xử lý |
|---|---|
| `WORKSPACE_READ_ONLY` | Mời gia hạn, **không làm mất dữ liệu form đang nhập** |
| `RESIDENCY_NOT_LINKED` | Hướng dẫn chờ chủ trọ gắn phòng |
| `METER_SUBMISSION_DISABLED` | Ẩn chức năng gửi chỉ số |
| `REVIEW_NOT_ELIGIBLE` | Giải thích điều kiện được đánh giá |
| `SELF_CONTACT_FORBIDDEN` | Ẩn nút nhắn tin với tin của chính mình |
| `TRIAL_ALREADY_USED` | Chuyển thẳng sang màn mua gói |

HTTP 422 là lỗi validation ngữ nghĩa — map `details` về đúng field trong form.

## Bước 6 — Ba trạng thái bắt buộc

Mọi request phải có **loading, empty và error** phù hợp với trải nghiệm nền tảng. Empty state
nói rõ người dùng làm gì tiếp theo, không chỉ hiện "Không có dữ liệu".

## Khi endpoint chưa có ở `apps/api`

Backend cùng repo nên ưu tiên dựng endpoint luôn theo lát cắt dọc (xem
`../../tasks/INTEGRATE_API_ENDPOINT.md`). Nếu lát đó chưa tới lượt, dùng dữ liệu mẫu khớp
đúng schema trong `packages/schemas`, đánh dấu `// TODO: nối API thật`. Khi endpoint thật xong
chỉ đổi nguồn, không phải viết lại giao diện.
