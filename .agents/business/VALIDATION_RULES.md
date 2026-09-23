# Quy tắc validation dữ liệu

Ràng buộc dữ liệu ở tầng nhập liệu. Dùng khi viết Zod schema trong `packages/schemas`.
Backend luôn kiểm tra lại, nhưng client phải chặn sớm để trải nghiệm tốt.

---

- **SĐT** VN hợp lệ, unique toàn hệ thống — là định danh tài khoản, **không có email** (BR-016); **mật khẩu** ≥ 8 ký tự. **AuthMethod:** unique (`userId`, `provider`); hiện chỉ `Password`.
- **RentalListing:** tiêu đề 10–120 ký tự; giá > 0; ảnh ≥ 3; `accessPolicy=Restricted` bắt buộc `accessOpenTime/CloseTime`; **`propertyId`/`roomId` (nếu có) phải thuộc chính `landlordId`**; nội dung qua lọc `BannedKeyword` khi gửi duyệt.
- **Property:** bật public phải có `name` + `wardName` + `provinceCode` + `wardCode`; `publicSlug` tự sinh, unique. Nhận tiền: STK chỉ số; `bankAccountName` IN HOA không dấu (VietQR hợp lệ).
- **Room:** `roomCode` unique trong Property; giá ≥ 0; diện tích > 0. `electricityPrice/waterPrice/servicePrice` ≥ 0 nếu có; **null = dùng giá của khu, `0` = miễn phí** — giao diện không hiển thị ô trống thành "chưa cấu hình" (BR-036).
- **UtilityReadingSubmission:** `submittedValue ≥ previousReading` của kỳ trước; **ảnh đồng hồ bắt buộc**; mỗi (room, type, period) chỉ một submission `Pending`.
- **Incident:** tiêu đề 5–120 ký tự; mô tả ≤ 2.000 ký tự; tối đa 5 ảnh; chỉ tạo được khi `residencyStatus=ACTIVE` (đang ở phòng — chưa tới `endDate`; đã rời đi thì không gửi mới).
- **Occupancy:** `endDate ≥ startDate` (nếu có; `endDate` là **ngày đầu tiên không còn ở** — BR-037); `phoneNumber` bắt buộc; `fullName` bắt buộc khi `userId` null; một phòng nhiều bản ghi, trong đó một người đại diện `isPrimary` đứng hợp đồng (BR-037).
- **Contract:** `endDate > startDate`; chặn Contract Active thứ hai và chồng lấn thời gian trên cùng Room (409).
- **UtilityReading:** chỉ số lưu **số nguyên** (BR-041); `currentReading ≥ previousReading`; `unitPrice ≥ 0` và **chép từ đơn giá đang áp dụng lúc ghi** (giá phòng, trống thì giá khu — không đọc ngược, BR-036); unique (roomId, type, period).
- **Invoice:** `period` đúng `YYYY-MM`; tổng = Σ InvoiceItem **đã làm tròn** (BR-041); unique (contractId, period). `invoiceCode` unique, sinh một lần lúc tạo, dạng `mã phòng-YYYYMM` (trùng thì thêm hậu tố `-2`, `-3`… sau phần kỳ), **không bao giờ đổi**. VietQR sinh **tại client** kèm amount + addInfo = `invoiceCode`; addInfo **tối đa 25 ký tự** — khi phải rút gọn thì rút phần mã phòng trước, **không cắt phần kỳ, không cắt hậu tố** (BR-038).
- **Payment:** `amount > 0`; Σ Payment không vượt `totalAmount`.
- **PlatformTransaction:** `idempotencyKey` unique; webhook verify chữ ký gateway; xử lý webhook idempotent (nhận trùng không kích hoạt trùng); `Failed` → `Success` **chỉ** qua webhook đã xác thực chữ ký (BR-039); webhook chữ ký hợp lệ mà không khớp giao dịch nào thì trả thành công kèm ghi cảnh báo, không trả lỗi (BR-040).
- **Review:** `rating ∈ [1,5]`; `content ≤ 1.000`; `contractId` hợp lệ, thuộc `authorUserId` qua Occupancy đã liên kết (`userId` khác null — BR-029); không phải chủ khu; đạt điều kiện mở (BR-022); chặn trùng theo `contractId` (BR-023).
- **Conversation:** người khởi tạo ≠ người đăng tin (BR-030); tin ở trạng thái cho phép (BR-019).
- **Subscription:** không TRIAL lần 2; `purchase/renew` kiểm `planId` Active.

---
