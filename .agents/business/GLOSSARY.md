# Thuật ngữ nghiệp vụ

Từ điển thuật ngữ dùng thống nhất trong toàn bộ mã nguồn và tài liệu. Đọc file này trước
khi làm việc với bất kỳ phần nghiệp vụ nào.

---

| Thuật ngữ | Giải thích ngắn gọn |
|---|---|
| **Marketplace (Chợ tin đăng)** | Phần "chợ" đăng tin – tìm kiếm – liên hệ giữa người thuê và người cho thuê. Miễn phí cho người thuê; chủ trọ đăng tin cũng miễn phí. |
| **SaaS / Workspace (Khu quản lý vận hành)** | Bộ phần mềm quản lý vận hành phía chủ trọ (khu, phòng, người ở, hợp đồng, điện nước, hóa đơn, báo cáo). Trả phí theo gói. |
| **Residency (Khu người ở)** | Phần dành cho người đang thuê: xem phòng/hóa đơn/hợp đồng của mình, báo sự cố, gửi chỉ số. Là module trong domain SaaS; có shell web `/nguoi-o/*` và app mobile riêng. |
| **Domain (bounded context)** | Một *vùng nghiệp vụ* có ranh giới rõ, dữ liệu và quy tắc riêng, hạn chế phụ thuộc chéo. Hệ thống có 2 domain + 1 shared kernel. |
| **Shared Kernel** | Nhóm năng lực **dùng chung** cho cả 2 domain (Auth, Profile, Media, Notification, Messaging). |
| **Shell** | Một khu giao diện riêng trên web, có bố cục và điều hướng riêng: công khai (Marketplace), chủ trọ (Workspace), người ở (Residency). |
| **Zone** | Vùng chức năng bên trong một shell, phân theo điều kiện truy cập (mục 1.6): zone Tin đăng (free) và zone SaaS (gating). |
| **Khách chưa đăng nhập (Guest)** | Chưa có phiên làm việc. Là một **trạng thái**, không phải vai trò. |
| **Vai trò (Role)** | Của một tài khoản: `TENANT` / `LANDLORD` / `STAFF` / `ADMIN`. **Mỗi tài khoản đúng một vai trò, không kế thừa** — quyền chung nằm ở tầng "đã đăng nhập" (mục 1.8, BR-013). |
| **Tenant (người thuê)** | Vai trò mặc định sau đăng ký: người tìm phòng và người đang thuê. |
| **Landlord (chủ trọ)** | Vai trò bên cho thuê — chủ BĐS hoặc người được ủy quyền; nền tảng không môi giới. Đăng tin miễn phí; khu quản lý vận hành cần gói. |
| **Staff (nhân viên vận hành)** | Tài khoản nội bộ: kiểm duyệt tin, xử lý báo cáo. Không quản lý tài khoản/danh mục/gói. |
| **Admin (quản trị viên)** | Tài khoản nội bộ: quyền Staff + quản lý tài khoản, danh mục, gói dịch vụ. |
| **"Trở thành chủ trọ"** | Thao tác nâng cấp `TENANT` → `LANDLORD`. **Một chiều**, không mất dữ liệu đã có; sau đó phải cấp lại phiên (`POST /auth/refresh`). |
| **Bốn tầng quyền** | Đã đăng nhập / Chủ trọ (`LANDLORD`) / Người đang ở (**suy từ dữ liệu**) / Nội bộ (`STAFF`, `ADMIN`). Không tầng nào chồng lấn — xem `ROLES_AND_IDENTITY.md`. |
| **Entity** | Một *bảng dữ liệu* (vd Room, Contract). "Hệ thống lưu cái gì". Entity KHÁC với Role. |
| **Property (Khu trọ)** | Một khu/tòa nhà chứa nhiều phòng — cấp 1 của SaaS. |
| **Room (Phòng)** | Một phòng cụ thể bên trong Property — cấp 2 của SaaS. |
| **Occupancy (Người ở)** | *Bản ghi* "ai đang ở phòng nào" do chủ trọ tạo và quản lý. Có thể gắn tài khoản (`userId`) hoặc chưa gắn (chỉ tên + SĐT). Là **entity, không phải vai trò**. |
| **Liên kết người ở** | Chủ trọ gắn một tài khoản (theo SĐT) vào bản ghi `Occupancy`. **Có hiệu lực ngay**, không có bước xác nhận; người được gắn nhận thông báo `OccupancyLinked` và có nút **"Không phải tôi"** để tự gỡ nếu bị gắn nhầm (BR-029). |
| **`residencyStatus`** | Trạng thái ở trọ của một tài khoản: `NONE` / `ACTIVE` / `PAST`, suy từ `Occupancy` đã liên kết — quyết định vào được Residency hay không. Không phụ thuộc vai trò. |
| **Tin cho thuê (`RentalListing`)** | Tin do chủ trọ đăng để tìm khách thuê. |
| **Tin của người tìm thuê** | Tin do người thuê đăng: tin tìm phòng (`RoomWantedPost`) hoặc tin tìm người ở ghép (`RoommateWantedPost`). |
| **Gating** | Cơ chế *cổng kiểm soát quyền* — quyết định chủ trọ được dùng tính năng nào của khu quản lý dựa trên trạng thái gói (đã mua chưa, còn hạn không). |
| **`subscriptionStatus`** | Trạng thái gói của chủ trọ: `NONE` / `TRIAL` / `ACTIVE` / `READ_ONLY`, suy từ `UserSubscription`. Gói **không phải vai trò**. |
| **TRIAL (dùng thử)** | Trạng thái cho chủ trọ dùng Workspace **miễn phí có thời hạn** (mặc định 1 tháng) trước khi mua. |
| **Read-only (chế độ chỉ xem)** | Khi gói hết hạn: vẫn xem/xuất được dữ liệu nhưng không tạo/sửa/xóa. Dữ liệu được giữ nguyên. |
| **Boost (đẩy tin nổi bật)** | Trả phí để tin đăng được ưu tiên hiển thị. |
| **Verified review (đánh giá xác thực)** | Đánh giá khu trọ *chỉ người từng ở thật* mới viết được — tài khoản đã được liên kết vào phòng của khu, có `Contract`, không phải chủ khu (BR-022) — chống review giả. |
| **Incident** | Báo cáo sự cố do người ở gửi (kèm ảnh), chủ trọ xử lý theo vòng đời trạng thái (BR-035). |
| **Danh mục** | Bảng dữ liệu do Admin quản lý, thêm sửa được mà không phải đổi mã nguồn: loại hình cho thuê (`ListingType`), tiện ích (`Amenity`), gói đẩy tin (`BoostPackage`), gói dịch vụ (`SubscriptionPlan`), từ khóa cấm (`BannedKeyword`). |
| **Mã hành chính** | `provinceCode` + `wardCode` — mã tỉnh và mã phường/xã dùng để **lọc** khi tìm kiếm; tên (`wardName`) dùng để **hiển thị**. Theo mô hình hai cấp áp dụng từ 01/07/2025. |
| **Soft delete (xóa mềm)** | Đánh dấu đã xóa (ẩn khỏi danh sách) nhưng giữ trong DB để khôi phục/đối chiếu. |
| **Webhook** | Cổng thanh toán gọi ngược về server (server-to-server) để báo kết quả giao dịch — nơi *duy nhất* kích hoạt quyền lợi (boost/gói), vì trình duyệt người dùng có thể đóng tab (mục 4.9). |

---
