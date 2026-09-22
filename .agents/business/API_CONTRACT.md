# Hợp đồng API và namespace

Quy ước namespace theo domain và toàn bộ endpoint. Namespace quyết định middleware nào áp
dụng, nên gọi sai tiền tố sẽ bị guard chặn nhầm.

---

> Prefix `/api/v1`. Namespace tách theo domain (mục 7.1) để middleware không chặn nhầm. **Chuẩn response/error/pagination ở mục 7.7** (một chuẩn duy nhất cho toàn dự án).

## Quy ước namespace — mỗi domain một tiền tố

Middleware **mount theo tiền tố**, nên không thể chặn nhầm route của domain khác. Đây là cách gỡ tận gốc xung đột kiểu "route công khai bị guard của Workspace chặn".

| Tiền tố | Thuộc về | Middleware áp dụng |
|---|---|---|
| `/api/v1/auth/*`, `/me/*`, `/notifications/*`, `/conversations/*`, `/media/*` | Shared Kernel | auth (trừ `/auth/*` công khai) |
| `/api/v1/public/*` | Marketplace — không cần đăng nhập | không |
| `/api/v1/marketplace/*` | Marketplace — cần đăng nhập | auth |
| `/api/v1/management/*` | SaaS — chủ trọ | auth + role Landlord + **gating guard** |
| `/api/v1/residency/*` | Người ở | auth + **residency guard** (đã liên kết với phòng) |
| `/api/v1/admin/*` | Admin / Staff | auth + role nội bộ |

## Shared Kernel
```
POST /auth/register           POST /auth/verify-otp         POST /auth/login
POST /auth/refresh            POST /auth/logout             (thu hồi refresh token)
POST /auth/forgot-password    POST /auth/reset-password
GET  /me                      (user, profile, role, subscriptionStatus, residencyStatus, limits)
POST /me/become-landlord      (TENANT → LANDLORD, một chiều; FE gọi POST /auth/refresh ngay sau — BR-013)
PUT  /me/password             POST /me/delete-request
GET  /me/profile              PUT /me/profile               PUT /me/display-settings
POST /me/device-tokens        DELETE /me/device-tokens/{id} (push cho app mobile)
GET  /notifications           PATCH /notifications/{id}/read   PATCH /notifications/read-all
GET  /conversations           POST /conversations           (chặn self-contact BR-030)
GET  /conversations/{id}/messages    POST /conversations/{id}/messages
PATCH /conversations/{id}/read       POST /conversations/{id}/block   POST /conversations/{id}/report
POST /media/upload            DELETE /media/{id}
```

> `GET /me/context` (cũ) đã gộp vào `GET /me`. `packages/access` còn gọi tên cũ và còn mô hình
> `roles[]`/`workspaceStatus` — xem mục Tồn đọng trong `../PROJECT_STATE.md`.

## Marketplace
```
## Công khai — không cần đăng nhập
GET  /public/listings                 GET  /public/listings/{id}
GET  /public/search/listings          GET  /public/amenities
GET  /public/khu-tro/{slug}           (trang khu public + review)
GET  /public/properties/{id}/reviews
GET  /public/room-wanted-posts        GET /public/roommate-wanted-posts
## Cần đăng nhập
POST /marketplace/listings            (cần role LANDLORD; không tự gán vai trò — BR-013)
PUT  /marketplace/listings/{id}       PATCH /marketplace/listings/{id}/status
DELETE /marketplace/listings/{id}     (xóa mềm)
PATCH /marketplace/listings/{id}/renew    (gia hạn +60d, BR-026)
POST /marketplace/listings/{id}/boost     (tạo PlatformTransaction → URL thanh toán)
POST /marketplace/listings/{id}/favorite  DELETE /marketplace/listings/{id}/favorite
GET  /marketplace/me/listings         GET /marketplace/me/favorites
GET  /marketplace/search/suggest-rooms
POST /marketplace/room-wanted-posts       PUT/PATCH/DELETE …/{id}
POST /marketplace/roommate-wanted-posts   PUT/PATCH/DELETE …/{id}
POST /marketplace/reviews             (body: propertyId, contractId, rating, content — BR-022)
PUT  /marketplace/reviews/{id}
POST /marketplace/reports             (body: targetType, targetId, reason — BR-032, bắt buộc đăng nhập)
```

## Property Management (SaaS) — chịu gating
```
## Subscription & thanh toán phí nền tảng
GET  /management/subscription/plans        GET  /management/me/subscription
POST /management/me/subscription/trial     POST /management/me/subscription/purchase
POST /management/me/subscription/renew
GET  /management/platform-transactions/{id}
POST /payments/webhook                     (PayOS gọi máy chủ, KHÔNG qua auth guard — xác thực bằng chữ ký; idempotent — AS-026)
## Property & Room (chặn ghi nếu READ_ONLY, lỗi mã WORKSPACE_READ_ONLY)
GET/POST /management/properties            GET/PUT/DELETE /management/properties/{id}
PATCH /management/properties/{id}/public
PATCH /management/properties/{id}/settings (bật/tắt allowOccupantMeterSubmission)
GET/POST /management/properties/{id}/rooms GET/PUT/DELETE /management/rooms/{id}
PATCH /management/rooms/{id}/status        POST /management/rooms/{id}/create-listing
## Occupancy & Contract
GET/POST /management/rooms/{id}/occupancies    PUT/PATCH /management/occupancies/{id}
GET  /management/occupancies/lookup?phone=…
GET/POST /management/rooms/{id}/contracts      GET/PUT/PATCH /management/contracts/{id}
## Invoice / Utility / Payment
POST /management/rooms/{id}/utility-readings   GET /management/rooms/{id}/utility-readings
GET  /management/utility-submissions           (hàng đợi đề xuất chỉ số từ người ở)
PATCH /management/utility-submissions/{id}/approve|reject
GET/POST /management/rooms/{id}/invoices       GET /management/invoices/{id}
PATCH /management/invoices/{id}/send           POST /management/invoices/{id}/payments
## Sự cố (phía chủ trọ xử lý)
GET  /management/incidents                     GET /management/incidents/{id}
PATCH /management/incidents/{id}/status        POST /management/incidents/{id}/comments
## Báo cáo kinh doanh
GET  /management/dashboard
```

## Residency — người ở (web shell + app mobile)
```
GET  /residency/me/occupancies              (đợt ở hiện tại + lịch sử)
PATCH /residency/me/occupancies/{id}/confirm    PATCH …/reject    PATCH …/unlink  (BR-029)
GET  /residency/me/room                     (tổng quan phòng đang ở)
GET  /residency/me/contracts                GET /residency/me/contracts/{id}
GET  /residency/me/invoices                 GET /residency/me/invoices/{id}  (kèm STK + VietQR)
POST /residency/incidents                   (tạo báo cáo sự cố + ảnh)
GET  /residency/incidents                   GET /residency/incidents/{id}
POST /residency/incidents/{id}/comments     PATCH /residency/incidents/{id}/close|reopen
POST /residency/utility-submissions         (gửi chỉ số + ảnh đồng hồ — chỉ khi khu bật, BR-033)
GET  /residency/utility-submissions
```

## Admin & Moderation
```
GET  /admin/users             PATCH /admin/users/{id}/lock   PATCH /admin/users/{id}/roles
GET  /admin/moderation/listings       PATCH /admin/listings/{id}/approve|reject
GET  /admin/reports           PATCH /admin/reports/{id}/resolve
GET  /admin/moderation/reviews        PATCH /admin/conversations/{id}/block
GET/POST/PUT /admin/plans     GET/POST/PUT /admin/amenities
GET/POST/PUT /admin/banned-keywords   PUT /admin/boost-config   (boostPrice, boostDays)
GET  /admin/subscriptions     PATCH /admin/subscriptions/{id}/cancel
GET  /admin/dashboard
```
