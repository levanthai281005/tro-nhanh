# Backend services và quyền sở hữu dữ liệu

Mười bảy service của backend, mỗi service sở hữu phần dữ liệu nào. Frontend đọc file này
để biết một nghiệp vụ thuộc về đâu khi cần tra endpoint hoặc báo lỗi.

---

> Một codebase, một database; mỗi service là một module có ranh giới; giao tiếp qua interface nội bộ. **Danh sách này là chuẩn duy nhất** — tài liệu Kiến trúc và cấu trúc thư mục code theo đây. Không dùng từ "Tenant/Tenancy" trong bất kỳ định danh nào.

**Shared Kernel (5):**
| Service | Trách nhiệm |
|---|---|
| `AuthService` | Đăng ký/đăng nhập, OTP, token + RefreshToken, role (tự kích hoạt + Admin), RBAC middleware |
| `UserProfileService` | Profile, display settings, xóa tài khoản |
| `MediaService` | Upload, signed URL, phân quyền file, job dọn media mồ côi |
| `NotificationService` | Thông báo in-app + SMS/Email; scheduled jobs (Overdue, Contract Expired, tin Expired, nhắc gói, TRIAL, giao dịch treo) |
| `MessagingService` | Conversation/Message, chặn, self-contact guard |

**Domain Marketplace (6):**
| Service | Trách nhiệm |
|---|---|
| `ListingService` | RentalListing: vòng đời (BR-001/003/026), boost, tạo từ phòng, đồng bộ từ Room (BR-027), ẩn khi user Locked (BR-028) |
| `DemandPostService` | Tin tìm phòng / ở ghép (BR-009/010) |
| `SearchService` | Tìm kiếm/lọc/sắp xếp/phân trang; hành vi lọc điểm đánh giá; gợi ý phòng |
| `FavoriteService` | Lưu tin, báo đổi trạng thái |
| `ReviewService` | Verify điều kiện review (BR-022/023), avgRating, trang khu public |
| `ModerationService` | Duyệt tin, lọc BannedKeyword, xử lý Report, khóa hội thoại, audit |

**Domain Property Management / SaaS (6):**
| Service | Trách nhiệm |
|---|---|
| `PropertyRoomService` | Property (+ nhận tiền, cờ public), Room, trạng thái (BR-002/011/031) |
| `OccupancyContractService` | Occupancy (link/consent BR-029, endDate), Contract (BR-006/031), scan (BR-008) |
| `BillingService` | UtilityReading, Invoice/Item (unique mới), Payment, VietQR (amount + mã HĐ), job Overdue |
| `SubscriptionService` | Plans (+ plan Trial), UserSubscription, **gating guard 4 trạng thái**, hạn mức/over-limit, `PlatformTransaction` + webhook + idempotency |
| `AnalyticsService` | Dashboard Seller (BR-012) & Admin, ContactEvent |
| `ResidencyService` | Trải nghiệm người ở: read-view phòng/hợp đồng/hóa đơn của chính mình (BR-034), `Incident` + `IncidentComment` (BR-035), `UtilityReadingSubmission` (BR-033), `DeviceToken` cho push |

> `SubscriptionService` cung cấp **gating guard/middleware** mà mọi service SaaS gọi trước khi cho ghi. *(Middleware = lớp trung gian chạy trước handler, ở đây để chặn thao tác ghi khi `READ_ONLY`.)*

> `ResidencyService` cung cấp **residency guard** cho namespace `/residency/*`: xác minh người gọi có `Occupancy` `Confirmed` và bản ghi truy cập thuộc đúng đợt ở của họ (BR-034). Service này **chỉ đọc** dữ liệu của `PropertyRoomService`, `OccupancyContractService`, `BillingService` qua interface — một chiều, không có chiều ngược lại, nên không sinh phụ thuộc vòng.

---
