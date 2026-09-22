---
name: porting-prototype-ui
description: Chuyển giao diện từ repo prototype sang repo này — đổi inline style sang Tailwind class, đổi react-router sang Next.js App Router, bỏ Supabase. Dùng khi port bất kỳ trang nào từ prototype.
---

# Chuyển giao diện từ prototype

Prototype dùng Vite, react-router (hash router), Supabase và **inline style** — khoảng 2.590
lần `style={{...}}` so với 7 lần `className=`. Nhiệm vụ là giữ nguyên bố cục và câu chữ,
đổi toàn bộ hạ tầng bên dưới.

> Prototype là **chỉ đọc**. Không sửa, không tạo file trong đó.

## Ba luật tuyệt đối

**Luật 1 — Không inline style.** Cấm `style={{...}}` trừ giá trị thật sự phải tính lúc chạy
(ví dụ chiều cao theo dữ liệu), và phải kèm comment giải thích.

**Luật 2 — Màu chỉ lấy từ preset.** Cấm mọi mã hex viết thẳng, cấm cả cú pháp ngoặc vuông
cho màu như `bg-[#8A4A20]`. Tra `references/TOKEN_MAP.md`. Cần màu chưa có thì **dừng lại và
hỏi**, không tự thêm vào preset.

**Luật 3 — Không khai lại kiểu dữ liệu.** Kiểu của thực thể suy từ Zod schema ở
`packages/schemas` (`z.infer`); không viết type song song trong feature rồi để lệch với
backend. Prototype có `shared/types/database.types.ts` sinh từ Supabase — **bỏ**, không port.

## Bảng tra

- `references/TOKEN_MAP.md` — 18 token màu của prototype sang class Tailwind
- `references/STYLE_MAP.md` — các mẫu inline style thường gặp sang class
- `references/ROUTER_MAP.md` — react-router sang `next/navigation`

## Quy tắc về kích thước

Kích thước không có trong thang Tailwind (`fontSize: 11`, `maxWidth: 1280`) thì dùng cú pháp
ngoặc vuông `text-[11px]`, `max-w-[1280px]` để **giữ đúng pixel gốc**. Không tự làm tròn về
thang gần nhất — sẽ lệch so với bản demo đã được người dùng đánh giá.

Ngoại lệ: **màu không bao giờ dùng ngoặc vuông.**

## Font

Prototype gắn `fontFamily: font` vào từng phần tử. Font đã đặt toàn cục trong `globals.css`,
nên gặp thuộc tính này thì **xóa hẳn**, không thêm class thay thế.

## Tầng dữ liệu

Bỏ mọi lời gọi Supabase. Dữ liệu đi qua service của feature, service gọi `@tronhanh/api`
tới `apps/api`. Endpoint chưa có thì dùng dữ liệu mẫu khớp đúng schema trong
`packages/schemas`, đánh dấu `// TODO: nối API thật`.

## Kiểm chứng

Class Tailwind sai tên **không gây lỗi build** — Tailwind lặng lẽ không sinh CSS, typecheck
vẫn xanh, giao diện sai âm thầm. Vì vậy sau khi port phải:

1. Chạy `pnpm lint` (rule chặn class không tồn tại)
2. Mở prototype song song và **so bằng mắt một lần**
