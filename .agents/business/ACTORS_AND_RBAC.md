# Actor và ma trận phân quyền

Bốn vai trò của hệ thống (cộng trạng thái Khách), quyền hạn từng vai trò và pipeline kiểm tra
quyền ở tầng API. Dùng khi quyết định ẩn/hiện chức năng và khi xử lý lỗi 403.

---

> Chỉ có **4 vai trò** (`TENANT` / `LANDLORD` / `STAFF` / `ADMIN`), mỗi tài khoản **đúng một**.
> **Khách** là trạng thái chưa có phiên, không phải vai trò. **"Người ở trọ" KHÔNG phải vai trò**
> — có tài khoản thì là một tài khoản (bất kỳ vai trò nào) được **liên kết** vào bản ghi
> `Occupancy`; chưa có tài khoản thì chỉ là bản ghi do chủ trọ quản lý.

| Actor | Mô tả | Quyền chính |
|---|---|---|
| **Guest** | Khách chưa đăng nhập (trạng thái) | Xem tin public, tìm kiếm/lọc, xem chi tiết, xem trang khu trọ public kèm đánh giá, xem SĐT che một phần (BR-014), đăng ký/đăng nhập. **Không** nhắn tin, xem SĐT đầy đủ, lưu tin, đăng tin, và **không báo cáo tin** (bắt buộc đăng nhập — chống spam và dìm hàng hàng loạt, BR-032) |
| **Tenant** (`TENANT`) | Bên thuê — mặc định mọi tài khoản sau đăng ký | Quyền Guest + nhắn tin/gọi người đăng, lưu tin yêu thích, đăng/quản lý tin tìm phòng & ở ghép, báo cáo vi phạm. Nếu đã được chủ trọ liên kết vào phòng (`residencyStatus ∈ {ACTIVE, PAST}`) → khu "Phòng của tôi" / Residency shell / app mobile: xem phòng đang ở, hợp đồng, hóa đơn kèm mã thanh toán, nhận thông báo, **gửi báo cáo sự cố**, **gửi chỉ số điện nước kèm ảnh** (nếu khu bật), gỡ liên kết "Không phải tôi", viết đánh giá khu đã ở |
| **Landlord** (`LANDLORD`) | Bên cho thuê — chủ BĐS hoặc người được ủy quyền (cò trọ). Nền tảng không môi giới. Nâng cấp từ Tenant qua "Trở thành chủ trọ" | Quyền tầng "đã đăng nhập" (nhắn tin, lưu tin, tin nhu cầu, báo cáo) + **miễn phí:** đăng & quản lý `RentalListing`, boost. **Theo gói (gating):** quản lý Property/Room/Occupancy/Contract/Invoice/UtilityReading/Payment, thông tin nhận tiền theo khu, nhận & xử lý báo cáo sự cố, duyệt chỉ số người ở gửi, báo cáo đánh giá sai sự thật để Staff xem xét, dashboard, gói SaaS của mình. Nếu bản thân đang đi thuê nơi khác và được liên kết → cũng vào Residency |
| **Staff** (`STAFF`) | Nhân viên vận hành — tài khoản nội bộ | Kiểm duyệt tin cho thuê / tìm phòng / ở ghép, xử lý báo cáo (tin, tin nhắn, đánh giá), khóa hội thoại, hỗ trợ khách. **Không** quản lý tài khoản, danh mục, gói |
| **Admin** (`ADMIN`) | Quản trị hệ thống — tài khoản nội bộ | Quyền tầng nội bộ (như Staff) + quản lý tài khoản (khóa/mở, điều chỉnh vai trò), danh mục (loại hình cho thuê, tiện ích, khu vực, khoảng giá, gói dịch vụ & thời gian dùng thử, **gói đẩy tin**, **từ khóa cấm**), bảng theo dõi toàn hệ thống. Mọi thao tác ghi audit kèm lý do |

**Mỗi tài khoản đúng một vai trò (BR-013).** `TENANT` → `LANDLORD` qua thao tác "Trở thành chủ trọ", một chiều (cơ chế và vòng đời ở `ROLES_AND_IDENTITY.md`). Không vai trò nào kế thừa vai trò nào — quyền chung nằm ở tầng "đã đăng nhập". `STAFF`/`ADMIN` là tài khoản nội bộ, không dùng cho hoạt động chợ tin đăng (separation of duties).

**Tài khoản người thuê vs Người đang ở (chống nhầm lẫn):**

| | Tài khoản người thuê | Người đang ở (`Occupancy`) |
|---|---|---|
| Bản chất | Một **tài khoản** đăng nhập được | Một **bản ghi dữ liệu** ghi nhận ai đang ở phòng nào |
| Ai tạo | Chính người đó tự đăng ký | Chủ trọ nhập khi có người dọn vào |
| Cần tài khoản? | Đương nhiên có | Không bắt buộc — có thể chỉ tên + SĐT |
| Thuộc về | Chính chủ tài khoản | Chủ trọ sở hữu khu đó (BR-007) |
| Liên kết | — | `userId` (null khi chưa liên kết). Chủ trọ liên kết bằng SĐT, **có hiệu lực ngay**; người được liên kết nhận Notification `OccupancyLinked` + nút **"Không phải tôi"** để tự gỡ (BR-029) |

Nói gọn: *tài khoản trả lời "ai đang dùng hệ thống", bản ghi người ở trả lời "ai đang ở phòng nào"*. Hai thứ gặp nhau khi chủ trọ liên kết bản ghi với tài khoản — lúc đó người thuê mới xem được phòng và hóa đơn của mình.

**Ba tầng trực giao — minh họa bằng người dùng thật:**

| Người dùng | `role` | `subscriptionStatus` | `residencyStatus` | Vào được |
|---|---|---|---|---|
| Sinh viên đang tìm phòng | `TENANT` | — | NONE | Marketplace |
| Sinh viên đã thuê qua nền tảng | `TENANT` | — | ACTIVE | Marketplace + Residency |
| Cò trọ đăng tin hộ | `LANDLORD` | NONE | NONE | Marketplace + zone Tin đăng (B4/B5) |
| Chủ trọ đang dùng SaaS | `LANDLORD` | ACTIVE | NONE | Marketplace + Workspace đầy đủ |
| Chủ trọ đang đi thuê nhà nơi khác | `LANDLORD` | ACTIVE | ACTIVE | Cả ba shell |
| Nhân viên kiểm duyệt | `STAFF` | — | — | Khu `/admin` (không dùng Marketplace) |

Dòng "chủ trọ đang đi thuê" là lý do tầng "người đang ở" không gắn với vai trò: người đó vẫn là `LANDLORD`, chỉ là đồng thời có một `Occupancy` đã liên kết.

---

## PHÂN QUYỀN (RBAC)

| Nhóm endpoint | Guest | Tenant | Landlord | Staff | Admin |
|---|---|---|---|---|---|
| Xem tin / tìm kiếm / xem review | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nhắn tin, lưu tin, đăng tin nhu cầu | – | ✓ | ✓ | – | – |
| Báo cáo vi phạm (tin/tin nhắn/review) | – | ✓ | ✓ | – | – |
| Viết review (verified) | – | ✓¹ | ✓¹ | – | – |
| Đăng/quản lý tin cho thuê, boost | – | –³ | ✓ | – | – |
| Khu quản lý vận hành (Property…Invoice, sự cố, duyệt chỉ số) | – | – | ✓² | – | – |
| Residency (phòng của tôi, sự cố, gửi chỉ số) | – | ✓⁴ | ✓⁴ | – | – |
| Kiểm duyệt tin / report / review, khóa hội thoại | – | – | – | ✓ | ✓ |
| Quản lý user / danh mục / gói / cấu hình | – | – | – | – | ✓ |

¹ Chỉ khi đã liên kết với phòng thuộc khu đó, không phải chủ khu, và hợp đồng đã đủ 30 ngày hoặc đã có ít nhất một lần ghi nhận thu tiền (BR-022). ² Chỉ khi `subscriptionStatus ∈ {TRIAL, ACTIVE}`; `READ_ONLY` chỉ đọc (BR-015). ³ Tenant bấm "Trở thành chủ trọ" → vai trò đổi thành Landlord, cấp lại phiên, rồi mới đăng tin (BR-013). ⁴ Chỉ khi tài khoản đã được liên kết với một phòng (`residencyStatus ∈ {ACTIVE, PAST}`); `PAST` chỉ đọc lịch sử; gửi chỉ số còn cần khu bật `allowOccupantMeterSubmission` (BR-033); khi gói của chủ trọ hết hạn, người ở vẫn đọc nhưng không tạo mới sự cố/chỉ số (BR-034). Mọi truy cập dữ liệu SaaS lọc theo `landlordId` (BR-007); dữ liệu Residency lọc theo `Occupancy.userId` của chính người gọi (BR-034); Admin truy cập ghi audit.

**Pipeline kiểm tra endpoint SaaS (thứ tự):** token hợp lệ → `role = LANDLORD` (claims) → ownership `landlordId` (BR-007) → gating `subscriptionStatus` (DB).

**Pipeline kiểm tra endpoint Residency:** token hợp lệ → tài khoản có `Occupancy` liên kết nào không (`userId` = người gọi; không → `RESIDENCY_NOT_LINKED`) → bản ghi đang truy cập có đúng thuộc phòng của người đó không (BR-034).

**Pipeline kiểm tra endpoint nội bộ:** token hợp lệ → `role ∈ {STAFF, ADMIN}` (claims); nhóm quản lý tài khoản/danh mục/gói → `role = ADMIN` → ghi audit kèm lý do (Module 13).

---
