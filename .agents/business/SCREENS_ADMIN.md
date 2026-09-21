# Màn hình khu Admin và Moderator

Danh sách màn hình quản trị hệ thống và kiểm duyệt nội dung.

---

## ADMIN / MODERATOR AREA — route gốc `/admin`

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| D1 | Dashboard hệ thống | `/admin` | Tổng user/tin/doanh thu phí nền tảng | V1 |
| D2 | Kiểm duyệt tin | `/admin/duyet-tin` | Hàng đợi 3 loại tin, duyệt/từ chối (lý do) | V1 |
| D3 | Xử lý báo cáo | `/admin/bao-cao` | Report tin / tin nhắn / đánh giá; khóa hội thoại | V1 |
| D4 | Kiểm duyệt đánh giá | `/admin/danh-gia` | Hàng đợi review bị báo cáo | V1 |
| D5 | Quản lý người dùng | `/admin/nguoi-dung` | Khóa/mở (khóa → ẩn tin BR-028), gán role | V1 |
| D6 | Danh mục & cấu hình | `/admin/danh-muc` | Amenity, khu vực, khoảng giá, gói (+ plan Trial), **phí & thời hạn boost**, **từ khóa cấm** | V1 |

---
