# Checklist trước khi bàn giao

Chạy hết checklist này trước khi báo hoàn thành hoặc mở PR.

---

## Quality gate

- [ ] `pnpm lint` sạch
- [ ] `pnpm typecheck` sạch
- [ ] `pnpm build` chạy qua
- [ ] `pnpm format:check` sạch (hoặc đã chạy format)
- [ ] `pnpm test` xanh

## Styling

- [ ] Không còn `style={{}}` — trừ giá trị tính lúc chạy, có comment giải thích
- [ ] Không còn mã màu hex viết thẳng; màu lấy từ preset
- [ ] Không có class Tailwind bịa tên (lint đã bắt, nhưng kiểm lại nếu có cảnh báo)

## Cấu trúc

- [ ] Không file nào vượt 300 dòng
- [ ] Không import chéo giữa `marketplace`, `workspace`, `residency`
- [ ] `'use client'` chỉ ở nơi thật sự cần, không đặt trong `page.tsx`
- [ ] Không khai lại type/DTO đã có trong `packages/schemas` — kiểu suy ra bằng `z.infer`
- [ ] Thay đổi cấu trúc dữ liệu có migration Prisma kèm theo, không sửa tay DB
- [ ] Không dùng explicit `any`

## Nghiệp vụ

- [ ] Đã đối chiếu các mã BR liên quan trong `../business/BUSINESS_RULES.md`
- [ ] Giá trị enum khớp đúng `../business/STATUS_ENUMS.md`, không tự dịch
- [ ] Xử lý lỗi theo `error.code`, không dựa vào chuỗi message
- [ ] Dữ liệu SaaS và Residency lọc đúng theo chủ sở hữu
- [ ] Lát cắt chạm một trong bốn vùng bắt buộc đã có test kèm theo (`../skills/critical-path-testing/SKILL.md`)
- [ ] Endpoint mới đã vào `../business/API_CONTRACT.md`, đặt đúng module trong `../business/BACKEND_SERVICES.md`

## Trải nghiệm

- [ ] Có đủ trạng thái loading, empty và error
- [ ] Thông báo lỗi bằng tiếng Việt, nói rõ người dùng cần làm gì
- [ ] Nếu port từ prototype: đã mở bản cũ so sánh giao diện bằng mắt

## PR

- [ ] Một mục tiêu, phạm vi nhỏ
- [ ] Mô tả rõ đã làm gì và cách kiểm tra
- [ ] Có ảnh chụp màn hình nếu thay đổi giao diện
