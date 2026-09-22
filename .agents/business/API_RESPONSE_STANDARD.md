# Chuẩn response và mã lỗi

Một chuẩn duy nhất cho toàn dự án: hình dạng response thành công, response lỗi, phân trang
và danh sách mã lỗi nghiệp vụ. Client xử lý lỗi dựa trên `error.code`, không dựa vào
chuỗi message.

---

## Chuẩn response — MỘT chuẩn duy nhất (các tài liệu khác trích theo đây)
- **Thành công:** `{ "data": …, "meta": {…} }` — không có cờ `success` (HTTP status đã nói điều đó).
- **Lỗi:** `{ "error": { "code": "ROOM_NOT_FOUND", "message": "…", "details": [] } }`. Mã lỗi nghiệp vụ đáng chú ý: `WORKSPACE_READ_ONLY`, `TRIAL_ALREADY_USED`, `REVIEW_NOT_ELIGIBLE`, `SELF_CONTACT_FORBIDDEN`, `RESIDENCY_NOT_LINKED`, `METER_SUBMISSION_DISABLED`.
- **Pagination:** `?page=&pageSize=&sort=`; trả `meta: { page, pageSize, total, totalPages }`. Messaging phân trang con trỏ thời gian (`?before=`/`?after=`).
- **Status codes:** 200/201 thành công; 400 request sai cấu trúc; 401 chưa xác thực; 403 không đủ quyền (RBAC/ownership/gating); 404 không tồn tại; 409 xung đột (trùng roomCode, chồng lấn hợp đồng, trùng period); **422 lỗi validation ngữ nghĩa**; 429 rate limit; 500 hệ thống.

Ở `apps/api`, chuẩn này được áp bằng **một interceptor** (bọc `data`/`meta`) và **một exception
filter** (bọc `error`) dùng chung cho toàn ứng dụng — controller không tự dựng hình dạng
response, service ném lỗi nghiệp vụ mang `code` và để filter chuyển thành HTTP status.

---
