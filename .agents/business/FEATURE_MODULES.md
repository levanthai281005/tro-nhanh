# Danh sách module chức năng

Mười chín module nghiệp vụ, mỗi module ghi rõ thuộc domain nào. Dùng để xác định code mới
thuộc feature folder nào trong `apps/web/src/features`.

---

> `[SK]` = Shared Kernel, `[MKT]` = Marketplace, `[SaaS]` = Property Management.

## Module 1 — Authentication & User Management `[SK]`
- **Mục đích:** đăng ký, đăng nhập, quản lý phiên và vai trò.
- **Chức năng con:** đăng ký bằng **SĐT** + OTP (email chỉ thêm tùy chọn ở Profile, không dùng để đăng ký); đăng nhập/đăng xuất (đăng xuất **thu hồi refresh token**); refresh token; quên mật khẩu (OTP); **đổi mật khẩu khi đã đăng nhập**; **yêu cầu xóa tài khoản** (right to erasure — soft delete User, ẩn tin, gỡ `userId` khỏi Occupancy nhưng giữ dữ liệu vận hành của Seller khác); khóa/mở khóa (Admin); tự kích hoạt role Seller (1.8) + Admin gán/gỡ thủ công; `GET /me`.
- **Rule:** SĐT duy nhất (BR-016); tài khoản Locked không đăng nhập được, **mọi tin Active của user Locked tự chuyển Hidden** (BR-028); dữ liệu SaaS giữ nguyên.

## Module 2 — Profile Management `[SK]`
- **Chức năng con:** cập nhật tên, avatar, SĐT liên hệ, email (tùy chọn); cài đặt hiển thị dashboard (BR-012). Thông tin nhận tiền đặt theo Property (Module 5), không ở Profile. `contactPhone` chưa đặt → prefill bằng `phoneNumber` tài khoản.

## Module 3 — Rental Listing Management `[MKT]`
- **Chức năng con:** tạo tin nhiều bước (cơ bản; tiện ích & mô tả; ảnh ≥ 3; chi phí; giờ giấc; **[nếu Seller có Property] bước tùy chọn "Tin này thuộc khu trọ nào?"** — gắn `propertyId` để tin nhận badge đánh giá khu); lưu Draft; gửi duyệt; sửa/ẩn/xóa (xóa mềm); **gia hạn** (BR-026); boost (BR-005, cấu hình boost do Admin đặt: `boostPrice`, `boostDays`; chỉ boost tin Active); tạo tin từ Room trống (prefill, gắn sẵn `roomId` + `propertyId`); xem tin của tôi.
- **Rule:** vòng đời BR-001; thời hạn hiển thị & gia hạn BR-026; sửa trường quan trọng phải duyệt lại — **tin ẩn tạm trong lúc chờ duyệt lại, UI cảnh báo trước khi lưu** (BR-003); đồng bộ với Room (BR-027); validation `propertyId`/`roomId` phải thuộc chính `sellerId`.

## Module 4 — Demand Posts — Tin của người tìm thuê `[MKT]`
- **Chức năng con:** tạo/sửa/ẩn/xóa, gia hạn; tin tìm phòng (khu vực, giá, loại hình, diện tích tối thiểu, tiện ích, thời điểm dọn vào); tin ở ghép (vị trí, giá chia sẻ, số người, yêu cầu, ảnh); **báo cáo tin nhu cầu** (qua Module 14).
- **Rule:** hiển thị 30 ngày → tự `Expired`, gia hạn +30 ngày **không cần duyệt lại nếu không sửa** (BR-009); tối đa 2 tin Active mỗi loại (BR-010); qua kiểm duyệt như tin cho thuê (BR-001).

## Module 5 — Property/Khu trọ Management `[SaaS]`
- **Chức năng con:** tạo/sửa/xóa Property; cấu hình nhận tiền (ngân hàng, STK, tên chủ TK → VietQR); bật/tắt hồ sơ khu public (`isPublicProfileEnabled`, opt-in); danh sách Property kèm tổng phòng & phòng trống.
- **Rule:** không xóa Property còn Room Rented/Deposited hoặc Contract Active (BR-011); hạn mức theo gói (BR-015); gating (BR-013). Tắt public/xóa mềm Property → trang khu và badge **ẩn**, review **giữ trong DB** (bật lại thì hiện lại) — BR-024.

## Module 6 — Room Management `[SaaS]`
- **Chức năng con:** thêm/sửa/xóa Room (mã phòng, tầng, diện tích, giá, tiện ích, giờ giấc, ghi chú); đổi trạng thái; lọc; "Tạo tin đăng" cho Room Available (Room đang có tin Active gắn với nó → hiện badge "Có tin đang chạy", **chặn tạo tin thứ hai** từ cùng Room).
- **Rule:** trạng thái BR-002 + đồng bộ với Contract (BR-031) và Listing (BR-027); `roomCode` unique trong Property; xóa Room chỉ khi không có Contract Active.

## Module 7 — Occupancy Management (Quản lý người ở) `[SaaS]`
- **Chức năng con:**
  - Thêm người ở theo **SĐT**: SĐT đã có tài khoản Renter → gợi ý gắn (`userId`, `linkStatus=Pending`) → **Renter nhận Notification `OccupancyLinked` và Chấp nhận/Từ chối** (BR-029); chưa có tài khoản → thêm bằng tên + SĐT (*fallback*, `userId` null), gắn sau khi người đó đăng ký (cũng qua xác nhận).
  - Một Room có thể có **nhiều Occupancy Active đồng thời** (bạn cùng phòng); Contract gắn **một Occupancy đại diện**. Kết thúc ở → set `endDate`, `isActive=false` → vào lịch sử.
  - Liên kết `Confirmed` làm `residencyStatus` của Renter chuyển `ACTIVE` → mở Residency shell/app (Module 19). Kết thúc ở → `PAST`, vẫn xem được lịch sử và viết đánh giá khu từng ở.
- **Rule:** dữ liệu riêng tư của Seller (BR-007); `userId` nullable; liên kết cần xác nhận (BR-029).

## Module 8 — Contract Management `[SaaS]`
- **Chức năng con:** tạo Contract (phòng, Occupancy đại diện, ngày, tiền thuê, cọc); upload scan (tự nguyện); xem/tải (signed URL); nhắc sắp hết hạn (BR-022 nhắc tại `max(startDate, endDate − 30 ngày)`); chấm dứt sớm; yêu cầu xóa scan.
- **Rule:** trạng thái BR-006 (gồm: **mỗi Room ≤ 1 Contract Active; chặn chồng lấn thời gian; job tự chuyển Expired khi qua `endDate`**); KHÔNG ký điện tử; scan phân quyền (BR-008); đồng bộ RoomStatus (BR-031). Contract là bằng chứng mở quyền đánh giá (BR-022 mới).

## Module 9 — Payment/Invoice/Utility Tracking `[SaaS]`
- **Luồng chuẩn:** người ở gửi chỉ số qua kênh ngoài (thủ công — AS-009) → chủ trọ nhập `UtilityReading` → hệ thống tính tiền (điện = (mới − cũ) × đơn giá) → `Invoice` + `InvoiceItem` → xuất (ảnh/PDF) kèm STK + **VietQR nhúng số tiền + mã hóa đơn** → gửi (in-app nếu người ở linked Confirmed + Notification `InvoiceReceived`; hoặc tải về gửi ngoài) → chủ trọ bấm "Đã thu" → ghi `Payment`.
- **Luồng tùy chọn — người ở gửi chỉ số trong app:** nếu khu bật `Property.allowOccupantMeterSubmission` (mặc định **tắt**), người ở gửi số kèm **ảnh đồng hồ** → tạo `UtilityReadingSubmission` (trạng thái `Pending`) → chủ trọ xem ảnh rồi **xác nhận hoặc sửa số** → chỉ khi xác nhận mới sinh `UtilityReading` chính thức và luồng hóa đơn chạy tiếp như trên. Số người ở gửi được lưu lại kể cả khi chủ sửa, để đối chiếu khi tranh chấp (BR-033).
- **Rule:** trạng thái Invoice BR-004 (trạng thái **suy tự động từ Σ Payment so với `totalAmount`**; đường ra khỏi Overdue: thu đủ → `Paid`, thu một phần → vẫn `Overdue`); unique **`Invoice(contractId, period)`** — cho phép 2 hóa đơn cùng phòng cùng tháng khi đổi người giữa kỳ; unique **`UtilityReading(roomId, type, period)`** + field `invoiceId` đánh dấu đã lên hóa đơn nào; quá hạn → job Overdue + Notification. **Tiền cọc** (`Contract.deposit`) ghi nhận như một `InvoiceItem` `type=Deposit` trong hóa đơn kỳ đầu — nền tảng chỉ ghi nhận, không giữ tiền (AS-002). Nền tảng không xử lý dòng tiền (AS-002).

## Module 10 — Notification & Reminder `[SK]`
- **Chức năng con:** báo duyệt/từ chối tin; báo tin nhắn mới; **báo được gắn vào phòng (`OccupancyLinked`)**; **báo tin tự chuyển Rented (`ListingAutoRented`)**; **báo có hóa đơn (`InvoiceReceived`)**; nhắc Contract sắp hết hạn; nhắc Invoice đến hạn/quá hạn; nhắc gia hạn gói (6/2/1 tháng — BR-017); nhắc TRIAL sắp hết; báo kết quả xử lý đánh giá; báo tin đã lưu đổi trạng thái; đánh dấu đã đọc.

## Module 11 — Favorite/Saved Posts `[MKT]`
- **Chức năng con:** lưu/bỏ lưu `RentalListing`; danh sách đã lưu; báo khi tin đã lưu đổi trạng thái (qua Module 10).

## Module 12 — Search & Filter `[MKT]`
- **Chức năng con:** tìm theo từ khóa/khu vực; lọc giá, loại hình, diện tích, tiện ích, giờ giấc; sắp xếp; phân trang; gợi ý phòng theo nhu cầu Renter; lọc/sắp xếp theo điểm đánh giá khu.
- **Rule:** chỉ trả tin Active; boost xếp trước (BR-005). **Lọc theo điểm đánh giá chỉ áp cho tin có review, kèm toggle "gồm tin chưa có đánh giá" (mặc định BẬT)**; sort theo điểm đẩy tin chưa có điểm xuống cuối thay vì loại bỏ.

## Module 13 — Admin Management `[MKT]/[SK]`
- **Chức năng con:** quản lý user; hàng đợi duyệt tin (3 loại); hàng đợi kiểm duyệt đánh giá; danh mục (loại phòng, Amenity, khu vực, khoảng giá, `SubscriptionPlan` + plan Trial, **danh sách từ khóa cấm `BannedKeyword`**, **cấu hình boost**); dashboard hệ thống.
- **Rule:** mọi hành động duyệt/từ chối/khóa ghi lý do (audit).

## Module 14 — Report/Complaint Management `[MKT]`
- **Chức năng con:** báo cáo **tin cho thuê / tin nhu cầu / tin nhắn / đánh giá**; hàng đợi xử lý; hành động (giữ/ẩn/từ chối, **khóa hội thoại**, khóa user, ẩn review); phản hồi người báo cáo.
- **Rule:** tin ≥ 3 report chưa xử lý tự chuyển PendingApproval và tạm ẩn (BR-018).

## Module 15 — SaaS Subscription Management `[SaaS]`
- **Chức năng con:** xem bảng gói; kích hoạt TRIAL (1 lần/Seller); mua gói (~600.000đ/3 năm — tham khảo); gia hạn ưu đãi (**đổi gói khi gia hạn được; V1 không nâng gói giữa kỳ**); xem hạn; nhắc hạn; Admin CRUD `SubscriptionPlan`, xem/hủy (`Cancelled` — chỉ Admin thao tác khi xử lý khiếu nại/hoàn tiền) `UserSubscription`.
- **Rule:** BR-015 (gồm over-limit ở 1.7); thanh toán qua `PlatformTransaction` + webhook (4.9).

## Module 16 — Dashboard & Analytics `[SaaS]`
- **Chức năng con (Seller):** số phòng trống (luôn hiện); tỷ lệ lấp đầy; **doanh thu thu được theo kỳ, tổng số phòng, số khách đang ở — cả ba theo toggle, mặc định TẮT** (BR-012); phòng sắp hết hạn HĐ; phòng chưa thanh toán.
- **Chức năng con (Admin):** tổng user/tin/doanh thu phí nền tảng theo thời gian.
- **Chức năng con (hệ thống):** ghi `ContactEvent` (nhắn tin/gọi) phục vụ thống kê tương tác tin.
- **Rule:** dashboard Seller riêng tư tuyệt đối (BR-007).

## Module 17 — Messaging/Chat (in-app) `[SK]`
- **Phạm vi:** UI từ MVP; nghiệp vụ đầy đủ V1; realtime polling → WebSocket (AS-011).
- **Chức năng con:** hội thoại 1-1 gắn một tin (cho thuê hoặc nhu cầu); gửi/nhận text; đã đọc; danh sách hội thoại; chặn; báo cáo tin nhắn.
- **Rule:** chỉ user đăng nhập (BR-019); không tạo hội thoại với tin Expired/Rented/Hidden; **không tạo hội thoại với tin của chính mình** (BR-030); chặn theo phạm vi **Conversation** (block user toàn cục = V2); mỗi cặp (người khởi tạo, tin) chỉ có một Conversation — mở lại hội thoại cũ.

## Module 18 — Review/Đánh giá khu trọ `[MKT]`
- **Mục đích:** người ở thật đánh giá **Property** để người thuê yên tâm trước khi cọc.
- **Phạm vi:** V1 (phụ thuộc Occupancy linked Confirmed + Contract).
- **Chức năng con:** viết đánh giá (sao 1–5 + nội dung ≤ 1.000 ký tự); mỗi đợt ở (`contractId`) một review, sửa trong **7 ngày**; hiển thị badge điểm trên tin của khu + trang khu public `/khu-tro/{slug}`; báo cáo/ẩn review (Module 14); Seller xem đánh giá khu mình (phản hồi = V2).
- **Rule (BR-022/023/024 bản mới):** verified-only; **cấm chủ khu tự review khu mình**; điều kiện mở: Contract tồn tại ≥ 30 ngày HOẶC đã có ≥ 1 Payment; viết & lưu được bất kể khu bật public hay chưa — **chỉ hiển thị khi khu bật public**.

## Module 19 — Residency (Trải nghiệm người ở) `[SaaS]`
- **Mục đích:** cho người ở đã xác nhận liên kết theo dõi việc thuê của mình và phản hồi lại chủ trọ — tăng tính thực dụng của bộ SaaS. Phục vụ **Residency shell (web) và app mobile người ở**.
- **Actor:** Renter có `residencyStatus ∈ {ACTIVE, PAST}`; Seller (phía xử lý).
- **Chức năng con:**
  - **Tổng quan phòng:** thông tin phòng đang ở, khu trọ, chủ trọ liên hệ, hợp đồng hiện tại (ngày bắt đầu/kết thúc, tiền thuê, cọc), lịch sử ở trọ.
  - **Hóa đơn của tôi:** danh sách + chi tiết hóa đơn, các dòng chi phí, **STK + VietQR để thanh toán**, trạng thái đã/chưa thu, lịch sử thanh toán.
  - **Xác nhận liên kết phòng:** Chấp nhận/Từ chối lời mời gắn vào phòng (BR-029).
  - **Báo cáo sự cố:** tạo `Incident` (tiêu đề, mô tả, mức ưu tiên, **ảnh đính kèm**), theo dõi trạng thái, trao đổi qua `IncidentComment`; chủ trọ nhận và xử lý trong Workspace.
  - **Gửi chỉ số điện nước:** (chỉ khi khu bật `allowOccupantMeterSubmission`) gửi số + ảnh đồng hồ → chờ chủ trọ duyệt (Module 9).
  - **Thông báo:** nhận push (mobile) và in-app cho hóa đơn mới, nhắc hạn, cập nhật sự cố, lời mời liên kết.
  - **Đánh giá khu đã ở:** lối vào Module 18 từ lịch sử ở trọ.
- **Vòng đời Incident:** `Open → Acknowledged → InProgress → Resolved → Closed`; chủ trọ chuyển trạng thái, người ở xác nhận đóng hoặc mở lại.
- **Dữ liệu:** `Incident`, `IncidentComment`, `UtilityReadingSubmission`, `DeviceToken` (push mobile).
- **Rule:** người ở chỉ thấy dữ liệu phòng của chính mình (BR-034); khi chủ trọ `READ_ONLY` thì người ở **vẫn xem được** dữ liệu đã phát hành nhưng **không tạo mới** sự cố/đề xuất chỉ số (BR-034); người ở **không bao giờ tự sinh** `UtilityReading` chính thức (BR-033).

---
