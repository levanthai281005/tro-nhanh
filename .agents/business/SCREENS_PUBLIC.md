# Màn hình Public / Tenant shell

Danh sách màn hình thuộc `app/(public)` — phần Marketplace dành cho Guest và Tenant.
Mã màn hình (A1, A2...) dùng để tham chiếu trong task và commit.

---

## PUBLIC / RENTER SHELL — route gốc `/`

**Khu công khai (Guest xem được):**

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| A1 | Trang chủ | `/` | Hero tìm kiếm, tin nổi bật (boost), khu vực hot | MVP |
| A2 | Kết quả tìm phòng | `/tim-phong` | Danh sách + bộ lọc (giá, khu vực, loại hình, diện tích, tiện ích, giờ giấc, điểm đánh giá — kèm toggle "gồm tin chưa có đánh giá") + bản đồ | MVP (lọc cơ bản) → V1 |
| A3 | Chi tiết tin cho thuê | `/phong/{id}` | Gallery, chi phí, tiện ích, giờ giấc, thời điểm đăng/cập nhật, badge điểm khu, liên hệ (redirect có `?redirect=`), nút Báo cáo | MVP → V1 (badge) |
| A4 | Trang khu trọ public | `/khu-tro/{slug}` | Tên khu, khu vực + điểm & danh sách đánh giá + tin đang cho thuê của khu | V1 |
| A5 | Danh sách tin nhu cầu | `/tin-tim-phong`, `/tin-o-ghep` | Tin tìm phòng / ở ghép công khai | V1 |
| A6 | Hồ sơ người đăng (public) | `/nguoi-dung/{id}` | Thông tin cơ bản + tin đang đăng (uy tín chủ khu = V2) | V1 |

**Khu Tenant (đăng nhập):**

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| A7 | Đăng ký / Đăng nhập / OTP / Quên MK | `/dang-ky`, `/dang-nhap`, … | Xác thực; hỗ trợ `?redirect=` | MVP |
| A8 | Tin đã lưu | `/tai-khoan/da-luu` | Favorite; cảnh báo tin đổi trạng thái | V1 |
| A9 | Quản lý tin nhu cầu của tôi | `/tai-khoan/tin-cua-toi` | Tạo/sửa/ẩn/gia hạn | V1 |
| A10 | Đăng tin nhu cầu (form) | `/tai-khoan/dang-tin-nhu-cau` | Wizard tìm phòng / ở ghép | V1 |
| A11 | Hộp thư / Chat | `/tin-nhan`, `/tin-nhan/{id}` | Danh sách hội thoại + khung chat | MVP (UI) → V1 |
| A12 | Thông báo | `/thong-bao` | Trung tâm thông báo (gồm thông báo được thêm vào phòng — BR-029) | V1 |
| A13 | **Phòng của tôi** | `/tai-khoan/phong-cua-toi` | Tab **"Đang ở"** (HĐ + danh sách hóa đơn kèm trạng thái, xem VietQR để chuyển khoản) + tab **"Lịch sử ở trọ"** (các đợt đã kết thúc, nút "Đánh giá khu" cho đợt chưa review) + gỡ liên kết "Không phải tôi" | V1 |
| A14 | Hồ sơ & cài đặt | `/tai-khoan/ho-so` | Tên, avatar, SĐT liên hệ, email, đổi mật khẩu, yêu cầu xóa tài khoản | MVP |
