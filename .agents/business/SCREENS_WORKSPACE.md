# Màn hình Management Workspace shell

Danh sách màn hình thuộc `app/(workspace)` — khu quản lý của chủ trọ.

> **B4 và B5 KHÔNG thuộc Surface này.** Chúng chạy trên `RentalListing`, miễn phí và không
> chịu gating, nên thuộc Surface **Marketplace** — xem `SURFACES_AND_MODES.md` §2. Chúng vẫn
> nằm trong bảng dưới đây để tra cứu, cột Surface ghi rõ chủ sở hữu. Shell Workspace được link
> sang, nhưng phải là link **cross-surface có nhãn rõ**, không phải mục lẫn trong sidebar.

---

## MANAGEMENT WORKSPACE SHELL — route gốc `/chu-tro`

> Entry `/chu-tro` mở cho mọi user đã đăng nhập — là điểm kích hoạt năng lực Seller. Toàn bộ
> màn SaaS chịu gating BR-015; `READ_ONLY` ẩn/khóa nút ghi, lỗi `WORKSPACE_READ_ONLY`.

| # | Màn hình | Route | Surface | Mô tả | Giai đoạn |
|---|---|---|---|---|---|
| B1 | Entry / Onboarding | `/chu-tro` | Workspace | **2 lối:** "Đăng tin (miễn phí)" → B5; "Dùng thử bộ quản lý" → TRIAL → B2 | V1 |
| B2 | Onboarding wizard 3 bước | `/chu-tro/bat-dau` | Workspace | Property + nhận tiền (VietQR) → Room → (tùy chọn) Occupancy/Contract | V1 |
| B3 | Dashboard Seller | `/chu-tro/tong-quan` | Workspace | Phòng trống (luôn hiện); lấp đầy, doanh thu/tổng phòng/số khách (toggle, mặc định TẮT — BR-012); sắp hết hạn HĐ; chưa thu | MVP (mock) → V1 |
| B4 | Quản lý tin cho thuê | `/tai-khoan/tin-cho-thue` | **Marketplace** | Tin của tôi; tạo/sửa/boost/gia hạn/xóa | MVP ✅ |
| B5 | Đăng tin cho thuê | `/dang-tin-cho-thue` | **Marketplace** | Form nhiều bước + bước chọn khu (nếu có Property) | MVP ✅ |
| B6 | Danh sách khu trọ | `/chu-tro/khu-tro` | Workspace | Danh sách khu + tổng phòng/trống; thêm khu | MVP (mock) → V1 |
| B7 | Chi tiết khu + nhận tiền + public | `/chu-tro/khu-tro/{id}` | Workspace | Sửa khu; STK/VietQR; bật hồ sơ public | V1 |
| B8 | Quản lý phòng | `/chu-tro/khu-tro/{id}/phong` | Workspace | Lưới phòng theo trạng thái; badge "Có tin đang chạy"; "Tạo tin từ phòng" | MVP (mock) → V1 |
| B9 | Chi tiết phòng | `/chu-tro/phong/{id}` | Workspace | Thông tin, người ở hiện tại (nhiều Occupancy), HĐ, hóa đơn gần đây | V1 |
| B10 | Quản lý người ở | `/chu-tro/phong/{id}/nguoi-o` | Workspace | Thêm theo SĐT (linked Pending/Confirmed hoặc fallback), kết thúc ở (endDate), lịch sử | V1 |
| B11 | Hợp đồng | `/chu-tro/hop-dong`, `…/{id}` | Workspace | Tạo HĐ (chặn chồng lấn), upload scan, nhắc hết hạn, chấm dứt | V1 |
| B12 | Điện nước & Hóa đơn | `/chu-tro/hoa-don` | Workspace | UtilityReading → Invoice → xuất kèm VietQR (amount + mã HĐ) → gửi → "Đã thu" | MVP (demo luồng) → V1 |
| B13 | Chi tiết hóa đơn | `/chu-tro/hoa-don/{id}` | Workspace | Dòng hóa đơn, STK/QR, lịch sử thu | V1 |
| B15 | Gói SaaS của tôi | `/chu-tro/goi-dich-vu` | Workspace* | Xem hạn, dùng thử, mua, gia hạn, trạng thái giao dịch | V1 |
| B16 | Quản lý đánh giá khu | `/chu-tro/danh-gia` | Workspace* | Xem đánh giá khu của mình (phản hồi = V2) | V1 |
| B17 | Hộp thư sự cố | `/chu-tro/su-co`, `…/{id}` | Workspace | Nhận & xử lý `Incident` từ người ở: đổi trạng thái, trao đổi, xem ảnh (BR-035) | V1 |
| B18 | Duyệt chỉ số từ người ở | `/chu-tro/duyet-chi-so` | Workspace | Hàng đợi `UtilityReadingSubmission`: xem ảnh đồng hồ → xác nhận/sửa số/từ chối (BR-033) | V1 |

\* B15/B16 là màn **đọc** — vẫn xem được ở `READ_ONLY` (B15 phải xem được để còn gia hạn).

**Không có B14:** mã này thuộc màn "Hỗ trợ thuế" đã bỏ cùng tính năng thuế. Giữ nguyên mã
B15–B18 để khớp đặc tả, không dồn số.
