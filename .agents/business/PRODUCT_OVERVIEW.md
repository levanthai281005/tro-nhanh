# Tổng quan sản phẩm

Hai trụ cột của nền tảng, bốn vai trò, cơ chế thanh toán, ranh giới hệ thống và các hệ thống
ngoài cần tích hợp. Đây là bối cảnh nền cho mọi quyết định triển khai.

---

## Hai trụ cột của hệ thống

Trọ Nhanh là nền tảng Web/Mobile gồm **hai trụ cột** chạy trên cùng một hệ thống tài khoản và dữ liệu:

**Trụ cột A — Marketplace (đăng tin & tìm kiếm):**
Kết nối nhu cầu thuê và cho thuê bất động sản lưu trú (phòng trọ, căn hộ dịch vụ, căn hộ chung cư). Gồm: tin cho thuê do Landlord đăng (`RentalListing`), tin tìm phòng và tin tìm người ở ghép do Tenant đăng, cùng tìm kiếm/lọc, yêu thích, **đánh giá khu trọ (verified)**, kiểm duyệt và báo cáo vi phạm. Người dùng liên hệ với người đăng qua **hai kênh: nhắn tin trong app và gọi điện**. Đăng tin miễn phí cho cả hai phía.

**Trụ cột B — SaaS quản lý vận hành (cho Landlord):**
Công cụ quản lý tài sản cho thuê theo cấu trúc hai cấp **Property (khu) → Room (phòng)**. Landlord quản lý người ở (`Occupancy`), hợp đồng (`Contract` — lưu bản chụp, không ký điện tử), hóa đơn/chi phí (`Invoice/InvoiceItem`), chỉ số điện nước (`UtilityReading`), ghi nhận thu (`Payment`), nhắc hạn (`Notification`), báo cáo kinh doanh (Dashboard), tiếp nhận báo cáo sự cố và duyệt chỉ số do người ở gửi. Truy cập theo gói SaaS (`UserSubscription`). **Khu dành cho người ở** (Residency) là module trong trụ cột này.

Hai trụ cột liên kết qua hành động **"Tạo tin đăng từ phòng trống"** và cơ chế **gắn tin đăng vào khu** (`RentalListing.propertyId`). Room và RentalListing là hai entity độc lập về vòng đời, nhưng có **quy tắc đồng bộ chống tin ảo** (BR-027): phòng đã có người thuê thì tin gắn với phòng đó không được tiếp tục hiển thị như phòng trống.

## Bốn vai trò — một tài khoản, một vai trò

`TENANT` (mặc định sau đăng ký) · `LANDLORD` (nâng cấp một chiều qua "Trở thành chủ trọ") · `STAFF` · `ADMIN` (tài khoản nội bộ). Không vai trò nào kế thừa vai trò nào: quyền chia **bốn tầng** — đã đăng nhập / chủ trọ / người đang ở (**suy từ dữ liệu liên kết**, không từ vai trò) / nội bộ. "Người đang ở" và "gói dịch vụ" đều **không phải vai trò**. Chi tiết: `ROLES_AND_IDENTITY.md`, `ACTORS_AND_RBAC.md`, `ACCESS_GATING.md`.

## Cơ chế thanh toán (nền tảng KHÔNG giữ tiền)

Nền tảng **không cầm, không trung chuyển tiền thuê** giữa người ở và chủ trọ (tránh nghĩa vụ pháp lý của trung gian thanh toán — AS-002). Hai dòng tiền tách bạch bằng **hai entity khác nhau**:

- **Tiền thuê (Tenant/người ở → chủ trọ), ngoài nền tảng:** mỗi **Property** lưu thông tin nhận tiền riêng (ngân hàng, STK, tên chủ TK → sinh **VietQR**). Hóa đơn xuất kèm STK + VietQR (QR nhúng **số tiền** và **nội dung chuyển khoản = mã hóa đơn** để chủ trọ đối chiếu tay dễ). Người ở chuyển khoản thẳng hoặc trả tiền mặt; chủ trọ bấm "Đã thu" → ghi bản ghi `Payment` (`Cash`/`BankTransfer`). App chỉ **ghi nhận**, không đối soát ngân hàng (để dành tương lai).
- **Phí nền tảng (Landlord → Trọ Nhanh), qua payment gateway:** boost và gói SaaS đi qua **PayOS**, ghi vào entity `PlatformTransaction` (trạng thái `Pending/Success/Failed`, có `idempotencyKey` chống tính phí trùng, kích hoạt quyền lợi **chỉ tại webhook** — mục 4.9).

> **Lý do tách 2 entity:** hai nghiệp vụ khác hẳn nhau — một bên là *ghi chép tay* của chủ trọ (không có gateway, không có trạng thái chờ), một bên là *giao dịch điện tử* (có Pending/Failed, webhook, idempotency). Gộp chung một bảng `Payment` với FK nullable chéo nhau dễ sinh bản ghi "mồ côi" và validation rối.

## Ranh giới hệ thống (System Boundary)

**Trong phạm vi:** 19 module ở Mục 3; web responsive (3 shell) + **app mobile cho người ở**; backend API; database; lưu trữ file (ảnh tin, bản chụp hợp đồng, ảnh sự cố, ảnh chỉ số đồng hồ, file hóa đơn); nhắn tin trong app; đánh giá khu trọ; **báo cáo sự cố**; hiển thị STK/QR và ghi nhận thanh toán.

**Ngoài phạm vi:** ký hợp đồng điện tử; đặt lịch xem phòng có cấu trúc; cầm/thu hộ tiền thuê và đối soát ngân hàng tự động; eKYC; dịch vụ môi giới; **mọi hình thức hỗ trợ kê khai hay tính thuế**; **tích hợp Zalo** (không nút, không deep link — AS-001).

## Hệ thống ngoài cần tích hợp (External Systems)

| Hệ thống ngoài | Mục đích | Ghi chú |
|---|---|---|
| SMS gateway | **Chỉ** gửi mã xác thực khi đăng ký và khôi phục mật khẩu | Mọi nhắc hạn (HĐ, thanh toán, gia hạn gói, tin nhắn mới) đi qua thông báo trong ứng dụng và push trên mobile — không SMS, không email (BR-016) |
| Map service | Hiển thị vị trí phòng, tính khoảng cách tiện ích | Geocoding địa chỉ khi đăng tin (AS-018) |
| Cổng thanh toán — **PayOS** | Thu **phí nền tảng** (boost + gói SaaS) từ Landlord, qua `PlatformTransaction` + webhook | KHÔNG xử lý tiền thuê (AS-002). Chọn PayOS vì mô hình tạo link ở máy chủ rồi nhận kết quả qua webhook khớp luồng đã thiết kế, và không đòi giấy phép kinh doanh như cổng truyền thống |
| Object/Cloud storage | Ảnh tin, bản chụp hợp đồng, ảnh sự cố, ảnh chỉ số, file hóa đơn | DB chỉ lưu URL; file riêng tư phân quyền |

## Cơ chế liên hệ giữa người dùng

Đúng **hai kênh**: **Nhắn tin** (in-app, không lộ SĐT — kênh khuyến khích) và **Gọi điện** (hiển thị `contactPhone`, chỉ hiện đầy đủ khi đã đăng nhập — BR-014). **Không tích hợp Zalo**; người dùng tự lấy SĐT hiển thị để dùng Zalo bên ngoài nếu muốn. Không được tạo hội thoại với tin của **chính mình** (self-contact, BR-030).
