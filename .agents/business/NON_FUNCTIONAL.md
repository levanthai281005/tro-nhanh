# Yêu cầu phi chức năng

Ràng buộc về hiệu năng, bảo mật, riêng tư và độ tin cậy áp dụng cho toàn hệ thống.

---

- **Hiệu năng:** tìm kiếm < 1.5s giai đoạn đầu; phân trang server-side; index theo Mục 6.
- **Bảo mật:** bcrypt/argon2; JWT access ngắn + refresh (lưu DB, thu hồi khi logout); file riêng tư qua signed URL; cô lập theo `landlordId` (BR-007); rate limit login/OTP/đăng tin/nhắn tin.
- **Riêng tư:** trang khu public không lộ vận hành (BR-024); dashboard toggle mặc định ẩn (BR-012); liên kết Occupancy cần consent (BR-029); mã QR VietQR sinh tại máy người dùng, không gửi số tài khoản sang bên thứ ba.
- **Độ tin cậy:** thao tác đa bước bọc **transaction** (tạo Contract → RoomStatus → Notification; Room Rented → listing Rented; Invoice từ nhiều Item); webhook PayOS idempotent.
- **Khả mở rộng:** ranh giới domain rõ; storage tách khỏi DB; stateless API.
- **Bảo trì:** chuẩn REST theo `API_RESPONSE_STANDARD.md` (Mục 7.7 của đặc tả); soft delete; audit Admin; cấu trúc dữ liệu chỉ đổi qua migration Prisma có đánh số.

---
