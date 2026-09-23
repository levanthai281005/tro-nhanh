# Tạo một module NestJS mới

Dùng khi dựng một module của `apps/api`. Backend là một ứng dụng NestJS duy nhất chia thành
17 module theo ranh giới domain; đặt module sai ranh giới thì về sau phải viết lại cả tầng dữ
liệu chứ không sửa vặt được — nên ba bước đầu là xác định ranh giới, chưa viết dòng code nào.

Luật (module ứng một dòng trong danh sách, controller mỏng, Prisma chỉ gọi trong module sở
hữu bảng, thứ tự guard, interceptor và exception filter dùng chung, transaction) nằm ở
`../rules/CODING_STANDARDS.md` mục NestJS. File này chỉ nói **thứ tự làm và cách tự kiểm**.

Cấu trúc thư mục bên trong `apps/api` chốt trong kế hoạch dựng backend; file này không quy
định trước.

---

## Bước 1 — Xác nhận module nằm trong danh sách

Tra `../business/BACKEND_SERVICES.md`: đúng 17 module, mỗi module một dòng trách nhiệm. Tên
kết thúc bằng `*Module`. Không dùng `Tenant`/`Tenancy` để đặt tên — `TENANT` chỉ là giá trị
vai trò, module quản lý người ở và hợp đồng tên là `OccupancyContractModule`.

Việc cần làm không khớp dòng nào → **dừng và hỏi**. Thêm module là sửa đặc tả (Mục 11), không
phải quyết định đưa ra giữa lúc code.

Khớp một dòng nhưng dòng đó đã có module → không tạo module mới, thêm vào module đang có.

## Bước 2 — Liệt kê dữ liệu sở hữu và dữ liệu phải mượn

Trước khi code, viết ra hai danh sách:

1. **Bảng module này sở hữu** — tra `../business/DATA_ENTITIES.md`
2. **Dữ liệu cần nhưng thuộc module khác** — kèm tên service công khai sẽ gọi

Mỗi bảng có đúng một module sở hữu. Module khác cần dữ liệu thì gọi service công khai của
module sở hữu, kể cả khi chỉ đọc một trường.

Ví dụ: `Invoice` thuộc `BillingModule`. `ResidencyModule` hiển thị "hóa đơn của tôi" thì gọi
service của `BillingModule`, không truy vấn `prisma.invoice`.

## Bước 3 — Kiểm chiều phụ thuộc

Marketplace và Property Management đều được gọi xuống Shared Kernel. Hai domain **không gọi
chéo tầng dữ liệu của nhau**; giữa chúng chỉ có bốn điểm nối hợp lệ, đều một chiều (Mục 1.6):

| Điểm nối | Chiều |
|---|---|
| Tạo tin cho thuê từ phòng trống | SaaS → Marketplace |
| Đồng bộ trạng thái tin khi phòng đổi trạng thái | SaaS → Marketplace |
| Đọc điểm đánh giá gắn với khu trọ | Marketplace đọc dữ liệu đánh giá |
| Xác minh quyền viết đánh giá qua hợp đồng và người ở | Marketplace → SaaS |

`ResidencyModule` **chỉ đọc** dữ liệu của `PropertyRoomModule`, `OccupancyContractModule` và
`BillingModule`, không có chiều ngược lại — đó là thứ giữ cho phụ thuộc không thành vòng.

Lát cắt cần một chiều ngoài bảng trên → **dừng và hỏi**; thêm chiều mới là đổi kiến trúc.

## Bước 4 — Chọn namespace và guard

Bảng tiền tố ở `INTEGRATE_API_ENDPOINT.md` Bước 3. Namespace quyết định guard nào áp dụng, và
guard mount theo tiền tố chứ không gắn lẻ từng handler.

Ngoại lệ duy nhất không đi qua guard xác thực là endpoint webhook của cổng thanh toán — nó
xác thực bằng chữ ký.

## Bước 5 — Khai schema đầu vào

Theo `../skills/shared-schema-validation/SKILL.md`: schema ở `packages/schemas` trước, module
dùng lại. Không khai DTO riêng trong `apps/api`.

## Bước 6 — Migration nếu chạm cấu trúc dữ liệu

Theo `ADD_DB_MIGRATION.md`. Module mới thường kéo theo bảng mới; sinh migration ngay trong
cùng lát cắt, không để dồn về cuối.

## Bước 7 — Dựng module

Thứ tự đỡ phải sửa lại: **service (luật nghiệp vụ) → interface công khai → controller**.

- **Interface công khai nhỏ nhất có thể:** chỉ export ra ngoài đúng những hàm module khác
  thật sự gọi. Export cả repository hay Prisma client là mở lại đúng cánh cửa Bước 2 vừa đóng.
- Lỗi nghiệp vụ ném kèm `code` theo `../business/API_RESPONSE_STANDARD.md`; mã mới thì thêm
  vào file đó trong cùng PR.
- Thao tác nhiều bước bọc transaction. Nếu thao tác chạm dữ liệu của module khác thì
  transaction bắt đầu ở service điều phối, không tách thành hai lần ghi rời nhau.

## Bước 8 — Test bốn vùng bắt buộc

Module chạm một trong bốn vùng ở `../skills/critical-path-testing/SKILL.md` thì test viết
trong cùng lát cắt, không để sau.

## Bước 9 — Cập nhật tài liệu

- Endpoint mới → `../business/API_CONTRACT.md`
- Đổi trách nhiệm module → `../business/BACKEND_SERVICES.md`
- Xong lát cắt → `../PROJECT_STATE.md`

## Ranh giới sai lộ ra thế nào

| Triệu chứng | Nghĩa là gì | Làm gì |
|---|---|---|
| Service gọi `prisma.<bảng>` mà Bước 2 không ghi bảng đó | Đang với sang dữ liệu module khác | Gọi service công khai của module sở hữu |
| Hai module cùng ghi một bảng | Quyền sở hữu chưa rõ | Chốt một chủ; module kia gọi qua service |
| Import vòng giữa hai module | Có một chiều không hợp lệ | Xem lại Bước 3; thật sự cần thì dừng và hỏi |
| Guard gắn lẻ trên từng handler | Namespace chọn sai | Xem lại Bước 4 |
| Controller có nhánh `if` nghiệp vụ | Luật rơi ra khỏi service | Đẩy về service |

## Bàn giao

Theo `PRE_HANDOFF_CHECKLIST.md`.
