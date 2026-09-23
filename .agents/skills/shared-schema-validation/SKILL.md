---
name: shared-schema-validation
description: Dùng chung Zod schema ở packages/schemas để kiểm tra dữ liệu đầu vào — tra schema đã có, đặt ràng buộc đúng tầng, dẫn xuất schema request, map lỗi 422 về đúng field. Dùng khi thêm hoặc sửa đầu vào của một endpoint hoặc một biểu mẫu.
---

# Zod schema dùng chung cho kiểm tra đầu vào

`packages/schemas` là nơi **duy nhất** khai hình dạng dữ liệu: `apps/api` dùng để kiểm tra đầu
vào, web và mobile dùng để dựng biểu mẫu, kiểu suy ra bằng `z.infer`. Không có DTO thứ hai,
không dùng class-validator, không có bước sinh mã từ OpenAPI.

Luật ("validate bằng schema từ `packages/schemas` qua pipe dùng chung", "không khai lại
DTO/type song song") ở `../../rules/CODING_STANDARDS.md`. Đây là cách làm.

## Bước 1 — Tra schema đã có trước khi khai mới

| File trong `packages/schemas/src` | Giữ gì |
|---|---|
| `contract.ts` | Hợp đồng: trạng thái, chuyển trạng thái hợp lệ, chồng lấn khoảng ngày |
| `invoice.ts` | Hóa đơn, dòng hóa đơn, chỉ số công tơ, khoản thu, kỳ `YYYY-MM` |
| `occupancy.ts` | Người ở: tên, số điện thoại, trạng thái liên kết |
| `property.ts` | Khu trọ: tên, địa chỉ, thông tin nhận tiền, trang công khai |
| `rentalListing.ts` | Tin cho thuê: tiêu đề, giá, diện tích, ảnh, chính sách |
| `room.ts` | Phòng: mã, tầng, giá, diện tích, tiện ích, trạng thái |

Mọi export đi qua `src/index.ts`. Thêm schema mới thì thêm cả dòng export ở đó, giữ đúng thứ
tự nhóm đang có.

## Bước 2 — Quy ước đặt tên trong package

Theo đúng cái đang có, không đặt kiểu khác:

| Thứ | Dạng tên | Ví dụ |
|---|---|---|
| Schema thực thể | `<thucThe>Schema` | `invoiceSchema` |
| Schema một trường | `<thucThe><Truong>Schema` | `roomCodeSchema` |
| Danh sách giá trị enum | `<THUC_THE>_<TRUONG>_VALUES` | `INVOICE_STATUS_VALUES` |
| Schema enum | `<thucThe><Truong>Schema` | `invoiceStatusSchema` |
| Kiểu suy ra | `<ThucThe>Input` | `InvoiceInput` |

Giá trị enum lấy nguyên từ `../../business/STATUS_ENUMS.md`, khai mảng `as const` rồi
`z.enum(...)` để backend, web và mobile dùng chung đúng một danh sách.

Thông báo lỗi viết tiếng Việt ngay trong schema: biểu mẫu hiện thẳng chuỗi đó, backend trả về
cũng chuỗi đó — không viết hai lần ở hai nơi rồi lệch nhau.

## Bước 3 — Đặt ràng buộc đúng tầng

Đây là chỗ hay sai nhất:

| Loại ràng buộc | Ví dụ | Đặt ở đâu |
|---|---|---|
| Thuộc bản chất dữ liệu | chỉ số mới ≥ chỉ số cũ; số tiền không âm; kỳ dạng `YYYY-MM` | `packages/schemas` |
| Chỉ thuộc biểu mẫu | trường bắt buộc ở bước 2 của wizard; ô trống khác số 0 | feature tương ứng |
| Cần tra dữ liệu khác trong DB | phòng đã có hóa đơn kỳ này chưa; hợp đồng có đang hiệu lực; hợp đồng chồng lấn; còn hạn mức gói | service trong `apps/api` |

Ràng buộc loại ba **không được nhét vào Zod**: schema chạy cả trong trình duyệt, ở đó không
có cơ sở dữ liệu và cũng không được phép có. Nó là luật nghiệp vụ, thuộc service, ném lỗi
mang `code` — 409 khi trùng hoặc chồng lấn, 422 khi sai ngữ nghĩa.

## Bước 4 — Dẫn xuất schema request, đừng khai lại

Endpoint hiếm khi nhận trọn thực thể. Dẫn xuất từ schema thực thể:

- Tạo mới: dùng thẳng schema thực thể, hoặc `.omit({ … })` các trường máy chủ tự sinh
- Sửa một phần: `.pick({ … }).partial()`
- Tham số truy vấn: `z.coerce.number()` cho `page`/`pageSize` vì query string luôn là chuỗi

Khai lại bằng tay thì hai bản sẽ lệch nhau, và lệch âm thầm — không có lỗi biên dịch nào bắt
được việc một bên quên `.max(120)`.

## Bước 5 — Nối vào `apps/api`

Pipe dùng chung nhận schema, parse đầu vào và ném lỗi validation; exception filter chuyển
thành 422 kèm `details` theo `../../business/API_RESPONSE_STANDARD.md`. Handler lấy kiểu từ
`z.infer`, **không** ép kiểu, **không** đọc dữ liệu thô từ request.

`details` mang `path` và `message` của từng lỗi để biểu mẫu gắn đúng ô nhập — phía giao diện
đã xử lý theo `../api-integration/SKILL.md`. Sai `path` thì người dùng chỉ thấy một dòng lỗi
chung chung ở đầu form và không biết phải sửa ô nào.

## Cạm bẫy

- Không `.passthrough()`: trường lạ phải bị loại ngay, không đi tiếp vào service.
- Số tiền là `number` nguyên (đơn vị đồng), không phải chuỗi có dấu phân cách — định dạng để
  hiển thị là việc của giao diện.
- Ngày truyền dạng chuỗi ISO, không truyền `Date` qua JSON.
- Schema không kiểm tra quyền. "Người gọi có sở hữu phòng này không" là việc của guard và
  service, không phải của Zod.

## Khi backend chưa có endpoint

Vẫn khai schema trước ở `packages/schemas` rồi dựng biểu mẫu trên đó — theo
`../../tasks/INTEGRATE_API_ENDPOINT.md`. Khi endpoint thật xong thì chỉ đổi nguồn dữ liệu.
