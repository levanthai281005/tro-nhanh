# Bảng giả định chuẩn (AS-001 → AS-028)

Các giả định đã chốt của dự án. Mọi tài liệu khác tham chiếu theo mã AS ở đây. Nếu một
yêu cầu mâu thuẫn với giả định nào, dừng lại và hỏi thay vì tự quyết. Thứ tự dòng theo đúng
Mục 13 của đặc tả để dễ đối chiếu.

---

| Mã | Giả định |
|---|---|
| AS-001 | Liên hệ qua 2 kênh: nhắn tin in-app + gọi điện; không tích hợp Zalo; không đặt lịch xem phòng |
| AS-002 | Nền tảng KHÔNG cầm/thu hộ tiền thuê; hóa đơn kèm STK/VietQR của khu; chủ trọ tự ghi nhận thu; gateway chỉ thu phí nền tảng qua `PlatformTransaction`; đối soát ngân hàng tự động = tương lai |
| AS-003 | Gói SaaS bán đứt 36 tháng ~600.000đ (tham khảo); gia hạn ưu đãi 150.000–180.000đ/năm; nhắc 6/2/1 tháng; Workspace 4 trạng thái; TRIAL theo plan Trial (mặc định 1 tháng, 1 Property, 5 Room); hết hạn → read-only, giữ dữ liệu |
| AS-004 | Mỗi tài khoản mang **đúng một vai trò**; `TENANT` nâng cấp thành `LANDLORD` qua "Trở thành chủ trọ" (một chiều, không quay lại); quyền chung của cả hai nằm ở tầng "đã đăng nhập" (BR-013, mục 1.8) |
| AS-005 | Landlord là chủ BĐS hoặc người được ủy quyền (cò trọ); nền tảng không môi giới, không phân biệt người đăng |
| AS-006 | Occupancy `userId` nullable; liên kết tài khoản cần Tenant xác nhận (BR-029); hệ thống single-sided — chủ trọ nhập điện nước |
| AS-007 | Review verified-only (BR-022); chủ không dùng SaaS → khu không có review (có chủ đích, tạo động lực dùng SaaS) |
| AS-008 | "Phòng của tôi" V1 chỉ xem; người ở tự nhập điện nước + báo sự cố = V2 |
| AS-009 | Người ở gửi chỉ số điện nước cho chủ qua kênh ngoài (thủ công, không tích hợp); ngoài ra có kênh trong app tùy chọn — chủ trọ bật `allowOccupantMeterSubmission` và **phải duyệt** trước khi thành chỉ số chính thức (BR-033) |
| AS-010 | Hồ sơ khu public là opt-in; review viết được trước, hiển thị khi bật (BR-024) |
| AS-011 | Chat: UI từ MVP, nghiệp vụ đầy đủ V1; realtime polling → WebSocket/SSE sau |
| AS-012 | *(không dùng — bỏ cùng tính năng hỗ trợ thuế)* |
| AS-013 | Thông tin nhận tiền (STK/QR) đặt theo từng Property |
| AS-014 | MVP demo = danh sách màn hình chuẩn ở Mục 10 (A1–A3, A7, A11-UI, A14, B3, B4, B5, B6, B8, B12), chạy mock data, chưa xây BE/DB chi tiết |
| AS-015 | Kiểm duyệt = lọc từ khóa (`BannedKeyword`) + Staff duyệt tay; chưa AI moderation |
| AS-016 | Con số performance/availability là mục tiêu giả định, tinh chỉnh sau khi đo tải |
| AS-017 | Đơn giá điện/nước do Landlord tự nhập, không lấy biểu giá nhà nước |
| AS-018 | Map dùng bên thứ ba; geocoding khi đăng tin |
| AS-019 | Web (ba khu giao diện) bằng **Next.js App Router**; **ứng dụng di động Expo cho người ở**; cả ba ứng dụng nằm trong monorepo `tro-nhanh` cùng các package dùng chung; styling **Tailwind v3 + NativeWind**. Chủ trọ dùng web, không có ứng dụng riêng |
| AS-021 | App người ở là **lớp cộng thêm, không phải điều kiện tiên quyết** — mọi nghiệp vụ chủ trọ chạy đủ kể cả khi không người ở nào có tài khoản (Occupancy fallback `userId` null) |
| AS-022 | Residency là **module trong domain SaaS**, không phải bounded context thứ ba (lý do ở 1.6) |
| AS-023 | Không tạo vai trò riêng cho người ở; quyền vào khu người ở suy ra từ việc tài khoản có được liên kết với phòng hay không (`residencyStatus` suy từ dữ liệu Occupancy) |
| AS-024 | Báo cáo vi phạm bắt buộc đăng nhập, Guest không gửi được (BR-032) |
| AS-020 | Backend viết bằng **NestJS trên TypeScript**, nằm trong cùng monorepo `tro-nhanh` tại `apps/api`. Truy cập dữ liệu qua Prisma; mọi thay đổi cấu trúc dữ liệu đi qua file migration có đánh số, không sửa tay trực tiếp trên cơ sở dữ liệu |
| AS-026 | Cổng thanh toán dùng **PayOS**, chỉ thu phí dịch vụ của nền tảng. Chọn vì không đòi hỏi giấy phép kinh doanh và mô hình webhook khớp luồng đã thiết kế |
| AS-027 | Địa chỉ dùng **mô hình hành chính hai cấp** (tỉnh/thành → phường/xã) theo quy định áp dụng từ 01/07/2025; lọc theo mã, hiển thị theo tên |
| AS-028 | SMS **chỉ dùng cho mã xác thực**; mọi nhắc hạn đi qua thông báo trong ứng dụng và trên web |
| AS-025 | Định nghĩa dữ liệu dùng chung đặt ở `packages/schemas` dưới dạng Zod schema — backend dùng để kiểm tra đầu vào, web và mobile dùng cho biểu mẫu. Không còn bước sinh mã từ tài liệu API |

---
