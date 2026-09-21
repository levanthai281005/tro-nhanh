# Workspace Guidelines for Agents

Trước khi thay đổi mã nguồn, hãy đọc `README.md`, `HELP.md` và toàn bộ tài liệu trong
`.agents/rules/`.

## Bản đồ tài liệu

| Thư mục | Nội dung | Đọc khi nào |
|---|---|---|
| `.agents/rules/` | Quy ước viết code và đặt tên | Luôn luôn, trước khi viết code |
| `.agents/business/` | Nghiệp vụ: thuật ngữ, luật, màn hình, API, enum | Khi cần biết hệ thống *phải làm gì* |
| `.agents/tasks/` | Quy trình cho từng loại công việc | Khi bắt đầu một loại việc lặp lại |
| `.agents/skills/` | Kỹ năng chuyên biệt kèm bảng tra | Khi thao tác cần tra cứu chi tiết |

Mỗi thư mục có `README.md` làm mục lục. **Đọc đúng file cần thay vì đọc tất cả** — ngữ cảnh
loãng làm chất lượng đầu ra tụt.

Ba file nên đọc đầu tiên khi mới vào dự án: `business/GLOSSARY.md`,
`business/PRODUCT_OVERVIEW.md` và `business/ARCHITECTURE_AND_SHELLS.md`.

## Phạm vi workspace

- `apps/web`: ứng dụng Next.js App Router cho marketplace, chủ trọ và người ở.
- `apps/mobile`: ứng dụng Expo dành cho người ở.
- `apps/api`: backend NestJS (TypeScript) — một ứng dụng duy nhất, 17 module chia theo hai
  domain + Shared Kernel (xem `business/BACKEND_SERVICES.md`); dữ liệu qua Prisma, migration
  có đánh số.
- `packages/*`: `schemas` (Zod — nguồn định nghĩa dữ liệu chung cho cả ba app), `types`,
  `constants`, `utils`, `config` (preset Tailwind), `api` (client), `access` (luật truy cập).

## Nguyên tắc làm việc

- Đọc hướng dẫn đúng phiên bản framework trong `HELP.md` trước khi triển khai.
- Giữ Tailwind CSS ở phiên bản `3.4.17` trên toàn workspace.
- Không import chéo giữa các feature domain `marketplace`, `workspace` và `residency`.
- Ở backend, Marketplace và Property Management không gọi chéo tầng dữ liệu của nhau; chỉ gọi
  xuống Shared Kernel hoặc qua service công khai của module kia.
- Định nghĩa dữ liệu dùng chung khai **một lần** ở `packages/schemas`, kiểu suy ra bằng
  `z.infer`; không khai lại DTO/type song song ở `apps/*`. Không còn bước sinh mã từ OpenAPI.
- Cấu trúc dữ liệu chỉ thay đổi qua migration Prisma có đánh số trong `apps/api`; không sửa
  tay cơ sở dữ liệu.
- Không dùng explicit `any`; TypeScript phải giữ `strict: true`.
- Dùng dependency nội bộ qua `workspace:*`.
- Bảo toàn thay đổi hiện có của người dùng; không reset hoặc xóa ngoài phạm vi yêu cầu.
- Trước khi bàn giao, chạy các quality gate phù hợp: lint, typecheck, build và format check;
  đối chiếu `.agents/tasks/PRE_HANDOFF_CHECKLIST.md`.
- Nghiệp vụ tuân theo mã `BR-xxx` và `AS-xxx` trong `.agents/business/`; giá trị enum lấy đúng
  từ `business/STATUS_ENUMS.md`, không tự dịch hay tự thêm.
- Khi yêu cầu được giao mâu thuẫn với tài liệu nghiệp vụ, **dừng lại và hỏi**, không tự quyết.

## Quy ước riêng cho web

- Mỗi feature tự sở hữu component, hook, schema, server logic, service, type và constant.
- `apps/web/src/lib` chỉ dành cho cấu hình hoặc adapter của SDK/thư viện bên thứ ba.
- `apps/web/src/utils` chỉ dành cho hàm thuần, không giữ trạng thái.
- Ưu tiên Server Component và chỉ tạo Client Component tại boundary cần tương tác.

## Quy ước riêng cho mobile

- Route file trong `apps/mobile/src/app` chỉ giữ navigation và screen composition cấp cao.
- Mã nghiệp vụ thuộc feature tương ứng; feature mobile không tạo thư mục `server/`.
- Dùng Expo Router cho routing, TanStack Query cho server state và SecureStore cho token.
- Cấu hình hoặc adapter SDK bên thứ ba đặt trong `apps/mobile/src/lib`; hàm thuần đặt trong
  `apps/mobile/src/utils`.
- Mọi biến `EXPO_PUBLIC_*` đều là dữ liệu công khai được nhúng vào client bundle.

## Quy ước riêng cho api

- Mỗi module NestJS ứng với đúng một dòng trong `business/BACKEND_SERVICES.md` (17 module, hậu
  tố `*Module`); không tạo module ngoài danh sách khi chưa cập nhật tài liệu.
- Kiểm tra đầu vào bằng Zod schema từ `packages/schemas` qua một validation pipe dùng chung;
  không viết class-validator song song.
- Endpoint ghi dưới `/management/*` đi qua guard của `SubscriptionModule` trước (BR-015);
  endpoint `/residency/*` đi qua guard của `ResidencyModule`.
- Response theo một chuẩn duy nhất ở `business/API_RESPONSE_STANDARD.md`
  (`{ data, meta }` / `{ error: { code, message, details } }`).
- Thao tác nhiều bước bọc transaction Prisma; webhook PayOS idempotent và là nơi **duy nhất**
  kích hoạt quyền lợi sau thanh toán.
- SMS chỉ để gửi mã xác thực; mọi nhắc hạn đi qua thông báo trong ứng dụng.
