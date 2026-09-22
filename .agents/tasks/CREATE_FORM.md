# Làm form nhập liệu

Toàn dự án dùng **React Hook Form + Zod**. Không dùng Formik, không tự viết state quản lý
form bằng `useState`.

---

## Bước 1 — Viết schema trước

Ràng buộc của **thực thể hay endpoint** (backend `apps/api` cũng dùng để kiểm tra đầu vào)
đặt trong `packages/schemas`. Ràng buộc **chỉ thuộc về form** — bắt buộc phải khai, chuỗi rỗng
khác số 0, bước nhập nhiều trang — đặt trong thư mục feature. Ràng buộc lấy từ
`../business/VALIDATION_RULES.md`.

Schema là nguồn chân lý: kiểu dữ liệu của form suy ra từ schema (`z.infer`), không khai báo
type riêng rồi để lệch nhau.

## Bước 2 — Nối vào form

Dùng `zodResolver` từ `@hookform/resolvers/zod`. Component chứa form là Client Component;
đặt `'use client'` ở đúng component đó, không đặt ở `page.tsx`.

## Bước 3 — Thông báo lỗi tiếng Việt

Thông báo lỗi viết trong schema, bằng tiếng Việt, nói rõ phải làm gì. Tránh thông báo chung
chung kiểu "Giá trị không hợp lệ".

## Bước 4 — Xử lý lỗi từ backend

Backend trả `{ error: { code, message, details } }`. Với lỗi validation (HTTP 422), map
`details` về đúng field trong form thay vì hiện một thông báo chung. Xem
`../business/API_RESPONSE_STANDARD.md`.

Client validate để trải nghiệm tốt; backend kiểm tra lại bằng **cùng schema** trong
`packages/schemas` — **không bao giờ tin client**.

## Bước 5 — Trạng thái gửi

Khóa nút gửi khi đang submit, hiện chỉ báo tiến trình, và xử lý cả trường hợp thất bại để
người dùng không mất dữ liệu vừa nhập.

## Form nhiều bước

Với form nhiều bước như đăng tin: mỗi bước một file riêng, schema tách theo bước rồi hợp
nhất, giữ dữ liệu khi người dùng quay lại bước trước, và cho lưu nháp nếu nghiệp vụ yêu cầu.
