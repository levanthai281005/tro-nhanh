# Luồng nghiệp vụ chi tiết

Các luồng nhiều bước từ đầu đến cuối. Đọc luồng tương ứng trước khi dựng bất kỳ màn hình
nào thuộc luồng đó, để không bỏ sót bước hoặc làm sai thứ tự.

---

## Guest tìm kiếm & xem chi tiết tin
1. Trang chủ → tìm theo khu vực/từ khóa → lọc → kết quả (boost trước, BR-005).
2. Chi tiết tin: gallery, chi phí, tiện ích, giờ giấc, thời điểm đăng/cập nhật, badge điểm khu (nếu tin gắn Property), khối liên hệ (SĐT che một phần + mời đăng nhập kèm `?redirect=`), nút Báo cáo tin.
- **Ngoại lệ:** không có kết quả → gợi ý nới bộ lọc.

## Tenant liên hệ & nhắn tin với người đăng
1. Đăng nhập → "Nhắn tin" (in-app) hoặc "Gọi" (hiện SĐT đầy đủ).
2. Kiểm tra: tin không Expired/Rented/Hidden (BR-019); **không phải tin của chính mình** (BR-030) → tạo/mở `Conversation` → gửi `Message` → Notification → polling → đã đọc. Ghi `ContactEvent`.
3. Chặn/báo cáo tin nhắn (BR-020).

## Landlord đăng tin cho thuê (gồm "Trở thành chủ trọ" nếu đang là Tenant)
1. Từ header public "Đăng tin → Tin cho thuê" → `/dang-tin-cho-thue` (zone Tin đăng, **miễn phí, không cần gói dịch vụ**, nhưng **cần role `LANDLORD`**).
2. Người đang là `TENANT` bấm vào sẽ thấy màn mời **"Trở thành chủ trọ"** (giữ `?redirect=` để quay lại đúng chỗ). Đồng ý → `POST /me/become-landlord` (đổi role thành `LANDLORD`, một chiều) → FE gọi `POST /auth/refresh` để lấy phiên mới mang role mới → quay lại biểu mẫu đăng tin (BR-013).
3. Form nhiều bước: (1) cơ bản → (2) tiện ích & mô tả → (3) ảnh ≥ 3 → (4) chi phí → (5) tiện ích xung quanh → (6) giờ giấc → (7) *[chỉ hiện khi Landlord có Property]* chọn khu trọ (tùy chọn, gắn `propertyId`).
4. Gửi → validate + lọc `BannedKeyword` → `PendingApproval` → Staff duyệt → `Active` (đặt `expireAt = approvedAt + 60 ngày`, BR-026) / `Rejected` (kèm lý do) → Notification.
5. (Tùy chọn) boost → luồng 4.9 → `boostExpireAt = now + boostDays`.
6. Sau khi gửi từ luồng "tạo tin từ phòng" → quay về B4 (Quản lý tin).

## Chủ trọ mở Workspace lần đầu & dùng thử
1. Chủ trọ (role `LANDLORD`) bấm "Quản lý khu trọ"/"Dashboard chủ trọ" → B1 với **2 lối**: "Đăng tin (miễn phí)" / "Dùng thử bộ quản lý". Tenant bấm vào đây sẽ được mời "Trở thành chủ trọ" trước (xem luồng đăng tin ở trên) — không có cơ chế nâng cấp ngầm.
2. Chọn dùng thử → tạo `UserSubscription` (`Trial`, `expireDate = now + trialDays` của plan Trial) → wizard 3 bước → Dashboard.
3. Muốn dùng tiếp → mua gói (4.9) → `ACTIVE`. Hết hạn → job chuyển `READ_ONLY`.
- **Ngoại lệ:** đã dùng TRIAL → chỉ còn lối mua gói; chạm hạn mức → chặn tạo mới + gợi ý gói lớn hơn.

## Landlord quản lý người ở (Occupancy) — liên kết có hiệu lực ngay
1. Chi tiết Room → "+ Thêm người ở" → nhập SĐT → tra tài khoản:
   - **Có tài khoản:** hệ thống hiện tên để Landlord đối chiếu → bấm gắn → liên kết **có hiệu lực ngay** (`userId` gắn vào Occupancy; mở "Phòng của tôi" + quyền review cho Tenant) → Notification `OccupancyLinked` cho Tenant kèm nút **"Không phải tôi"**; Tenant bấm nút đó → gỡ liên kết, Occupancy quay về dạng chỉ có tên + SĐT (`userId` null), dữ liệu quản lý của Landlord không mất (BR-029). Không có bước chờ Tenant đồng ý.
   - **Chưa có:** nhập tên + SĐT (fallback, `userId` null); khi người đó đăng ký bằng đúng SĐT ấy, Landlord liên kết lại — cũng có hiệu lực ngay và gửi thông báo như trên.
2. Bổ sung ngày bắt đầu, số người, ghi chú → Lưu. Một phòng có thể nhiều Occupancy Active (ở ghép).
3. Rời đi → "Kết thúc ở" → set `endDate`, `isActive=false` → lịch sử; nếu Contract gắn Occupancy này kết thúc → gợi ý đổi RoomStatus (BR-031).

## Landlord ghi điện nước → hóa đơn → ghi nhận thu (luồng cốt lõi)
1. Người ở gửi chỉ số qua kênh ngoài (thủ công).
2. Nhập `UtilityReading` cho từng Room có Contract Active (chặn trùng theo unique roomId+type+period; chỉ số mới ≥ cũ). **Nước theo cách tính của khu (BR-042):** theo khối thì nhập chỉ số như điện; theo đầu người hoặc khoán thì **không nhập chỉ số** — bản ghi chốt `pricingMethod` + `occupantCount` (tổng nhân khẩu người ở đang ở phòng) + đơn giá.
3. Tạo `Invoice` (unique theo contractId+period) + `InvoiceItem`; reading dùng cho hóa đơn được đánh dấu `invoiceId`.
4. Xuất PDF/ảnh kèm STK + **VietQR nhúng amount + mã hóa đơn** → gửi in-app (khi Occupancy đã liên kết tài khoản) hoặc tải về gửi ngoài.
5. Nhận tiền ngoài nền tảng → bấm "Đã thu" (đủ/một phần) → ghi `Payment` → **status Invoice suy tự động** từ ΣPayment: đủ → `Paid`; một phần trước hạn → `PartiallyPaid`; qua `dueDate` chưa đủ → job set `Overdue` (thu tiếp một phần vẫn `Overdue`, thu đủ → `Paid`).

## Tenant viết đánh giá khu trọ (V1)
1. Entry: "Phòng của tôi" (đang ở) **hoặc tab "Lịch sử ở trọ"** (từng ở) → mục "Đánh giá khu".
2. Điều kiện (BR-022 mới): tài khoản đã được liên kết vào phòng thuộc khu (`Occupancy.userId`); có Contract tại Property; **không phải chủ khu**; Contract ≥ 30 ngày tuổi hoặc có ≥ 1 Payment; đợt ở này chưa review (BR-023).
3. Chọn sao + nội dung → lưu `Review` (`Visible`) → cập nhật `avgRating`, `reviewCount` của Property.
4. Hiển thị: trang khu public + badge trên tin gắn `propertyId` — **chỉ khi khu đang bật public** (BR-024). Khu chưa bật → review vẫn lưu, chờ chủ bật.
- **Ngoại lệ:** đã review đợt này → chặn; sửa được trong 7 ngày.

## Admin/Staff kiểm duyệt
- **Duyệt tin:** hàng đợi 3 loại tin → duyệt/từ chối (lý do) → Notification. Tin sửa trường quan trọng quay lại hàng đợi (đang ẩn tạm — BR-003).
- **Xử lý báo cáo:** hàng đợi Report (tin / tin nhắn / đánh giá) → giữ/ẩn/khóa hội thoại/khóa user (khóa user → tin tự Hidden, BR-028) → phản hồi + audit.

## Thanh toán phí nền tảng (boost & gói SaaS) — MỚI
1. Landlord bấm mua (boost hoặc gói) → BE tạo `PlatformTransaction` (`Pending`, kèm `idempotencyKey`) → trả URL thanh toán PayOS (AS-026).
2. Landlord thanh toán trên cổng PayOS → cổng gọi **`POST /payments/webhook`** (server-to-server, không qua auth guard — xác thực bằng chữ ký) → BE verify chữ ký → set `Success`/`Failed`. **Chỉ webhook mới kích hoạt quyền lợi** (set `boostExpireAt` hoặc tạo/gia hạn `UserSubscription`) — return URL trên trình duyệt chỉ để hiển thị kết quả, vì user có thể đóng tab.
3. Giao dịch treo (`Pending` quá 15 phút không có webhook) → job đánh `Failed`; Landlord thấy trạng thái ở màn gói/tin của mình, bấm thử lại (idempotencyKey mới).

## Người ở báo cáo sự cố
1. Người ở (`residencyStatus=ACTIVE`) mở app/Residency shell → "Báo sự cố" → nhập tiêu đề, mô tả, mức ưu tiên, đính kèm ảnh → gửi.
2. Tạo `Incident` trạng thái `Open`, gắn `roomId` + `occupancyId` → Notification cho Landlord sở hữu khu.
3. Chủ trọ mở hộp thư sự cố trong Workspace → `Acknowledged` → `InProgress`; trao đổi qua `IncidentComment` (hai chiều, có Notification).
4. Xử lý xong → `Resolved` → người ở xác nhận → `Closed`; nếu chưa ổn, người ở mở lại về `InProgress`.
- **Ngoại lệ:** chủ trọ đang `READ_ONLY` → người ở không tạo mới được, UI báo rõ lý do (BR-034).

## Người ở gửi chỉ số điện nước (tùy chọn, chủ trọ duyệt)
1. Chủ trọ bật `allowOccupantMeterSubmission` cho khu (mặc định tắt).
2. Cuối kỳ, người ở chụp ảnh đồng hồ + nhập số → tạo `UtilityReadingSubmission` trạng thái `Pending` → Notification cho chủ trọ.
3. Chủ trọ mở màn duyệt: xem ảnh, đối chiếu chỉ số cũ → **Xác nhận** (sinh `UtilityReading` chính thức) hoặc **Sửa số rồi xác nhận** (lưu cả số gốc người ở gửi) hoặc **Từ chối** kèm lý do.
4. Sau khi có `UtilityReading`, luồng hóa đơn chạy như 4.6.
- **Bất biến:** người ở **không bao giờ** tạo trực tiếp `UtilityReading`; quyền quyết định cuối luôn thuộc chủ trọ (BR-033).

---
