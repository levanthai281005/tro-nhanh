# Lộ trình và lý do thiết kế

Phân kỳ tính năng theo MVP, V1, V2 và lý do đằng sau các lựa chọn thiết kế gây tranh cãi.
Dùng để biết một tính năng có thuộc phạm vi hiện tại hay không.

---

## Phân kỳ tính năng

| Giai đoạn | Trọng tâm |
|---|---|
| **MVP** | Danh sách màn hình chuẩn (Mục 10), chạy mock để demo. **Nguyên tắc:** mock **dữ liệu và trạng thái** (dropdown giả lập gói/role), KHÔNG mock **cấu trúc luồng** — route, guard, 2 zone sidebar, context switcher đúng bản cuối ngay từ MVP; sang V1 chỉ thay nguồn dữ liệu bằng `GET /me` + API thật. Mục tiêu: kiểm chứng nhu cầu & mức sẵn lòng trả. |
| **V1** | Nghiệp vụ thật đầy đủ: Auth/RBAC/gating thật; Property/Room/Occupancy (consent)/Contract/Invoice/Payment; `PlatformTransaction` + webhook; Messaging đầy đủ; Review verified (BR-022 mới); bản đồ; **Residency shell + app mobile người ở** (tổng quan phòng, hóa đơn, báo sự cố, gửi chỉ số có duyệt, push); Admin/Moderation. |
| **V2** | Điểm uy tín chủ khu; chủ khu phản hồi review; versioning tin khi duyệt lại (BR-003); block user toàn cục; đối soát ngân hàng; WebSocket realtime; nâng gói giữa kỳ. |

## Defense — vì sao Review chọn verified-only (chuẩn bị phản biện)

**Lập luận lõi:** giá trị của review nằm ở **độ tin cậy**, không ở số lượng — và độ tin cậy là thứ duy nhất Facebook/đối thủ không làm được. Cho đánh giá tự do = tái tạo đúng vấn đề "tin ảo" đang muốn giải.

Bốn trụ đỡ: (1) **Chiến lược** — verified là USP; (2) **Kinh doanh** — review gắn SaaS tạo flywheel: chủ dùng SaaS → khu có nhãn uy tín → tin dễ lấp phòng → hút chủ khác dùng SaaS (flywheel này hoạt động được nhờ tin đăng gắn được `propertyId` từ form — Module 3); (3) **Kỹ thuật** — chống gian lận ở tầng cấu trúc, không cần đội kiểm duyệt lớn; (4) **Lean** — nhóm hạt nhân dùng SaaS nên có review mẫu ngay.

**"Chủ không dùng SaaS thì khu không có review" không phải bug mà là thiết kế có chủ đích** — tương tự "shop không bán trên Shopee thì không có review Shopee". Tin của chủ chưa dùng SaaS vẫn hiển thị đầy đủ & đã kiểm duyệt; review là lớp tin cậy thêm, đồng thời là động lực dùng SaaS.

**Rủi ro gian lận & 4 lớp chặn (đã nâng từ "giảm thiểu" thành rule chốt):** (1) cấm chủ khu tự review (BR-022); (2) liên kết Occupancy cần Renter xác nhận — không gắn được tài khoản chim mồi âm thầm (BR-029); (3) điều kiện mở review: Contract ≥ 30 ngày hoặc có Payment — tạo Contract khống chưa đủ (BR-022); (4) report + tự ẩn ≥ 3 report + kiểm duyệt (BR-023). Không hệ thống nào chống giả 100%, nhưng chi phí gian lận ở đây cao hơn hẳn review tự do.

---

*— Hết —*
