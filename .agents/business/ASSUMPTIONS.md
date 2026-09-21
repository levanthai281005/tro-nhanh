# Bảng giả định chuẩn (AS-001 → AS-025)

Các giả định đã chốt của dự án. Mọi tài liệu khác tham chiếu theo mã AS ở đây. Nếu một
yêu cầu mâu thuẫn với giả định nào, dừng lại và hỏi thay vì tự quyết.

---

| Mã | Giả định |
|---|---|
| AS-001 | Liên hệ qua 2 kênh: nhắn tin in-app + gọi điện; không tích hợp Zalo; không đặt lịch xem phòng |
| AS-002 | Nền tảng KHÔNG cầm/thu hộ tiền thuê; hóa đơn kèm STK/VietQR của khu; chủ trọ tự ghi nhận thu; gateway chỉ thu phí nền tảng qua `PlatformTransaction`; đối soát ngân hàng tự động = tương lai |
| AS-003 | Gói SaaS bán đứt 36 tháng ~600.000đ (tham khảo); gia hạn ưu đãi 150.000–180.000đ/năm; nhắc 6/2/1 tháng; Workspace 4 trạng thái; TRIAL theo plan Trial (mặc định 1 tháng, 1 Property, 5 Room); hết hạn → read-only, giữ dữ liệu |
| AS-004 | Một tài khoản kiêm Renter & Seller; role cộng dồn theo hành vi (mục 1.8) |
| AS-005 | Seller là chủ BĐS hoặc người được ủy quyền (cò trọ); nền tảng không môi giới, không phân biệt người đăng |
| AS-006 | Occupancy `userId` nullable; liên kết tài khoản cần Renter xác nhận (BR-029); hệ thống single-sided — chủ trọ nhập điện nước |
| AS-007 | Review verified-only (BR-022); chủ không dùng SaaS → khu không có review (có chủ đích, tạo động lực dùng SaaS) |
| AS-008 | "Phòng của tôi" V1 chỉ xem; người ở tự nhập điện nước + báo sự cố = V2 |
| AS-009 | Người ở gửi chỉ số điện nước cho chủ qua kênh ngoài (thủ công, không tích hợp); ngoài ra có kênh trong app tùy chọn — chủ trọ bật `allowOccupantMeterSubmission` và **phải duyệt** trước khi thành chỉ số chính thức (BR-033) |
| AS-010 | Hồ sơ khu public là opt-in; review viết được trước, hiển thị khi bật (BR-024) |
| AS-011 | Chat: UI từ MVP, nghiệp vụ đầy đủ V1; realtime polling → WebSocket/SSE sau |
| AS-012 | *(không dùng — bỏ cùng tính năng hỗ trợ thuế)* |
| AS-013 | Thông tin nhận tiền (STK/QR) đặt theo từng Property |
| AS-014 | MVP demo = danh sách màn hình chuẩn ở Mục 10 (A1–A3, A7, A11-UI, A14, B3, B4, B5, B6, B8, B12), chạy mock data, chưa xây BE/DB chi tiết |
| AS-015 | Kiểm duyệt = lọc từ khóa (`BannedKeyword`) + Moderator duyệt tay; chưa AI moderation |
| AS-016 | Con số performance/availability là mục tiêu giả định, tinh chỉnh sau khi đo tải |
| AS-017 | Đơn giá điện/nước do Seller tự nhập, không lấy biểu giá nhà nước |
| AS-018 | Map dùng bên thứ ba; geocoding khi đăng tin |
| AS-019 | Web (3 shell) bằng **Next.js App Router**; **app mobile Expo React Native cho người ở**; hai app nằm trong **monorepo pnpm** cùng package dùng chung (`types`, `api-client`, `tailwind-preset`); styling **Tailwind v3 + NativeWind**. Chủ trọ dùng web, không có app riêng |
| AS-021 | App người ở là **lớp cộng thêm, không phải điều kiện tiên quyết** — mọi nghiệp vụ chủ trọ chạy đủ kể cả khi không người ở nào có tài khoản (Occupancy fallback `userId` null) |
| AS-022 | Residency là **module trong domain SaaS**, không phải bounded context thứ ba (lý do ở 1.6) |
| AS-023 | Không tạo role "Resident"; điều kiện vào Residency shell là `residencyStatus` suy từ dữ liệu Occupancy (1.8.2) |
| AS-024 | Báo cáo vi phạm bắt buộc đăng nhập, Guest không gửi được (BR-032) |
| AS-020 | Backend: **Java Spring Boot 4.1, Java 21 LTS, Maven**, repo riêng tách khỏi client. Lựa chọn thư viện bên trong (JPA/migration/cách giữ ranh giới module) do team BE quyết, miễn tôn trọng ranh giới 2 domain + Shared Kernel ở 1.6 |
| AS-025 | Contract giữa backend và client đi qua **OpenAPI spec** (`springdoc-openapi` sinh ra, client codegen); `openapi.json` commit vào repo client và cập nhật cùng PR khi API đổi |

---
