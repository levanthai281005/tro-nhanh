# Module backend và quyền sở hữu dữ liệu

Mười bảy module NestJS trong `apps/api`, mỗi module sở hữu phần dữ liệu nào. Frontend đọc
file này để biết một nghiệp vụ thuộc về đâu khi cần tra endpoint hoặc báo lỗi; backend đọc
để biết đặt code vào module nào.

---

> Backend là **một ứng dụng NestJS duy nhất** đặt tại `apps/api`, chia thành các module theo
> ranh giới domain ở `ARCHITECTURE_AND_SHELLS.md`. Hai domain nghiệp vụ **không gọi chéo trực
> tiếp** vào tầng dữ liệu của nhau; mọi trao đổi đi qua service công khai của module.

> Một codebase, một database; mỗi module có ranh giới riêng; giao tiếp qua interface nội bộ. **Danh sách này là chuẩn duy nhất** — tài liệu Kiến trúc và cấu trúc thư mục code theo đây. `TENANT` chỉ dùng làm **giá trị vai trò**; không dùng *Tenant/Tenancy* để đặt tên module, bảng hay khái niệm kỹ thuật vì dễ nhầm với multi-tenant — module quản lý người ở và hợp đồng tên là `OccupancyContractModule`, không phải `TenancyModule`.

**Shared Kernel (5):**
| Module | Trách nhiệm |
|---|---|
| `AuthModule` | Đăng ký/đăng nhập, OTP, token + RefreshToken, vai trò (nâng cấp qua "Trở thành chủ trọ" — `POST /me/become-landlord`; Admin điều chỉnh — BR-013), guard phân quyền |
| `UserProfileModule` | Profile, display settings, xóa tài khoản |
| `MediaModule` | Upload, signed URL, phân quyền file, job dọn media mồ côi |
| `NotificationModule` | Thông báo trong ứng dụng + push cho app; SMS **chỉ** gửi mã xác thực (AS-028), nhắc hạn không đi qua SMS; scheduled jobs (Overdue, Contract Expired, tin Expired, nhắc gói, TRIAL, giao dịch treo) |
| `MessagingModule` | Conversation/Message, chặn, self-contact guard |

**Domain Marketplace (6):**
| Module | Trách nhiệm |
|---|---|
| `ListingModule` | RentalListing: vòng đời (BR-001/003/026), boost, tạo từ phòng, đồng bộ từ Room (BR-027), ẩn khi user Locked (BR-028) |
| `DemandPostModule` | Tin tìm phòng / ở ghép (BR-009/010) |
| `SearchModule` | Tìm kiếm/lọc/sắp xếp/phân trang; hành vi lọc điểm đánh giá; gợi ý phòng |
| `FavoriteModule` | Lưu tin, báo đổi trạng thái |
| `ReviewModule` | Verify điều kiện review (BR-022/023), avgRating, trang khu public |
| `ModerationModule` | Duyệt tin, lọc BannedKeyword, xử lý Report, khóa hội thoại, audit |

**Domain Property Management / SaaS (6):**
| Module | Trách nhiệm |
|---|---|
| `PropertyRoomModule` | Property (+ nhận tiền, cờ public), Room, trạng thái (BR-002/011/031) |
| `OccupancyContractModule` | Occupancy (liên kết tài khoản BR-029, endDate), Contract (BR-006/031), scan (BR-008) |
| `BillingModule` | UtilityReading, Invoice/Item (unique mới), Payment, VietQR (amount + mã HĐ), job Overdue |
| `SubscriptionModule` | Plans (+ plan Trial), UserSubscription, **gating guard 4 trạng thái**, hạn mức/over-limit, `PlatformTransaction` + webhook **PayOS** + idempotency |
| `AnalyticsModule` | Báo cáo kinh doanh cho chủ trọ (BR-012) và quản trị viên; thống kê lượt liên hệ (ContactEvent) |
| `ResidencyModule` | Trải nghiệm người ở: read-view phòng/hợp đồng/hóa đơn của chính mình (BR-034), `Incident` + `IncidentComment` (BR-035), `UtilityReadingSubmission` (BR-033), `DeviceToken` cho push |

> `SubscriptionModule` cung cấp một **guard chạy trước** mà mọi module quản lý vận hành gọi tới trước khi cho ghi dữ liệu, để chặn thao tác khi gói dịch vụ đã hết hạn (`READ_ONLY`).

> `ResidencyModule` cung cấp **residency guard** cho namespace `/residency/*`: xác minh người gọi có bản ghi người ở đã liên kết, và bản ghi đang truy cập đúng là của họ (BR-034). Module này **chỉ đọc** dữ liệu của `PropertyRoomModule`, `OccupancyContractModule`, `BillingModule` qua interface công khai — một chiều, không có chiều ngược lại, nên không sinh phụ thuộc vòng.

---
