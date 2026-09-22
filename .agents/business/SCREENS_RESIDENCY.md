# Màn hình Residency shell và app mobile

Danh sách màn hình thuộc `app/(residency)` và app Expo dành cho người ở. Toàn bộ khu này
là tính năng mới, prototype chưa có nên không có mẫu để port.

---

## RESIDENCY SHELL (người ở) — route gốc `/nguoi-o`

> Web shell và **app mobile Expo** dùng chung API (mục 7.5). Điều kiện vào: `residencyStatus ∈ {ACTIVE, PAST}`.

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| C1 | Tổng quan phòng của tôi | `/nguoi-o` | Phòng đang ở, khu trọ, liên hệ chủ trọ, hợp đồng hiện tại | V1 |
| C2 | Thông báo được thêm vào phòng | `/nguoi-o/lien-ket` | Hiện phòng và khu vừa được chủ trọ thêm vào; nút "Không phải tôi" để tự gỡ nếu bị thêm nhầm (BR-029) | V1 |
| C3 | Hóa đơn của tôi | `/nguoi-o/hoa-don` | Danh sách hóa đơn theo kỳ, trạng thái đã/chưa thu | V1 |
| C4 | Chi tiết hóa đơn | `/nguoi-o/hoa-don/{id}` | Các dòng chi phí, **STK + VietQR để thanh toán**, lịch sử thu | V1 |
| C5 | Hợp đồng của tôi | `/nguoi-o/hop-dong` | Xem/tải hợp đồng và bản scan của chính mình | V1 |
| C6 | Báo cáo sự cố | `/nguoi-o/su-co` | Danh sách sự cố đã gửi + tạo mới (mô tả, ưu tiên, ảnh) | V1 |
| C7 | Chi tiết sự cố | `/nguoi-o/su-co/{id}` | Theo dõi trạng thái, trao đổi với chủ trọ, xác nhận đóng | V1 |
| C8 | Gửi chỉ số điện nước | `/nguoi-o/chi-so` | Nhập số + chụp ảnh đồng hồ (chỉ hiện khi khu bật — BR-033) | V1 |
| C9 | Thông báo | `/nguoi-o/thong-bao` | Hóa đơn mới, nhắc hạn, cập nhật sự cố; push trên mobile | V1 |
| C10 | Lịch sử ở trọ | `/nguoi-o/lich-su` | Các đợt ở đã kết thúc; lối vào viết đánh giá khu từng ở | V1 |

**App mobile (Expo)** có các màn tương ứng C1–C10 với điều hướng tab: Phòng của tôi · Hóa đơn · Sự cố · Thông báo · Tài khoản. Bổ sung so với web: chụp ảnh trực tiếp từ camera cho sự cố và chỉ số đồng hồ, nhận push notification.
