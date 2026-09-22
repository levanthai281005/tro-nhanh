# Khoảng trống dữ liệu chờ chốt vào đặc tả

Những chỗ giao diện cần dữ liệu mà Mục 6 của `docs/spec/dac-ta-ky-thuat.md` (và bản chép
`DATA_ENTITIES.md`) chưa có cột, phát hiện trong lúc rebuild. Đề xuất nhắm vào **đặc tả**:
chốt vào Mục 6 trước, rồi mới sinh migration Prisma và Zod schema — không có bước "gửi team
backend" riêng nữa vì backend nằm cùng repo.

Nguyên tắc chung khi xử lý: **không tự thêm cột** vào `schema.prisma` hay `packages/schemas`
khi đặc tả chưa có, **không tự sửa `DATA_ENTITIES.md`**, và tuyệt đối **không nhồi dữ liệu
vào trường văn bản** (prototype từng nối JSON vào cuối `description` — cách đó biến mô tả vừa
là nội dung cho người đọc vừa là kho dữ liệu, và đã bị loại khi port). Trong lúc chờ, các
trường này nằm ở type mở rộng riêng phía web, đánh dấu `PROPOSAL:` ngay tại chỗ khai báo
(hiện ở `features/marketplace/types/listingLocation.ts` và `postListing.ts`).

> **Các mục đang mở bên dưới (1.1, 1.2, 2, 3, 4) phải được chốt trước khi viết
> `schema.prisma`** — đây là quyết định về cấu trúc dữ liệu; chốt sau khi đã có migration
> thì mỗi mục là thêm một migration sửa đổi và một lần cập nhật schema dùng chung.

## Trạng thái tổng hợp

| Mục | Trạng thái | Căn cứ trong đặc tả |
|---|---|---|
| 1. Địa chỉ hành chính | **Đã chốt** | `RentalListing`: `provinceCode + wardCode` (lọc), `wardName + addressDetail` (hiển thị); AS-027 |
| 1.1 Backend tự suy `wardName` | Còn mở — quy tắc triển khai cho `ListingModule` | Đặc tả chưa nói |
| 1.2 Endpoint danh mục hành chính | Còn mở | Mục 7.3 chưa có endpoint |
| 2. Toạ độ + tiện ích xung quanh | **Một nửa** | `ListingNearbyPlace` đã có; `latitude/longitude` chưa |
| 3. `maxOccupants`, `waterPricingUnit`, `otherFees` | Còn mở | `ListingCost` chỉ có `electricityBill/waterBill/serviceFee/deposit` |
| 4. Lượt xem tin | Còn mở | `ContactEvent` đã có; đếm lượt xem chưa |

---

## Đã chốt

### 1. Địa chỉ hành chính

Đặc tả đã nhận đề xuất: `RentalListing`, `RoommateWantedPost` và `Property` đều mang
`provinceCode + wardCode` để lọc và `wardName` (+ `addressDetail`/`address`) để hiển thị;
AS-027 chốt mô hình hành chính hai cấp. Giữ lại lý do vì nó giải thích vì sao phải lưu **cả
mã lẫn tên**:

- Lọc theo khu vực bằng **so sánh chuỗi** thì lệch một ký tự ("Phường Tân Hưng" vs
  "P. Tân Hưng") là mất kết quả.
- Đợt sáp nhập 01/07/2025 đã **bỏ hẳn cấp quận/huyện**. Chỉ lưu tên thì sau lần đổi địa giới
  tiếp theo, tin cũ mang tên đã khai tử và **không có mã để tra ngược** ra đơn vị mới.
- Mã trả lời "đơn vị hành chính nào, một cách chuẩn xác"; tên là **ảnh chụp tại thời điểm
  đăng** để hiển thị đúng lịch sử.
- **Dùng mã Tổng cục Thống kê, không tự đánh ID mới.** Tự đánh số riêng nghĩa là nhận việc
  duy trì một bảng ánh xạ vĩnh viễn.

---

## Còn mở

### 1.1 Tên phường phải do backend suy ra, không nhận từ client

Client chỉ gửi `provinceCode` + `wardCode` + `addressDetail`. `ListingModule` tra tên từ danh
mục của mình rồi mới ghi vào `wardName`, đồng thời kiểm mã phường có tồn tại và có thuộc đúng
tỉnh không.

Theo đúng nguyên tắc đã ghi trong `AGENTS.md`: *giá trị suy được thì derive server-side,
không nhận từ client*. Nếu client gửi kèm tên, người ta có thể gửi `wardCode` của một khu rẻ
nhưng `wardName` của khu đắt để lọt vào kết quả tìm kiếm sai — suy ở server thì bịt hẳn.
Cần ghi thành quy tắc trong Mục 9 (validation) của đặc tả.

### 1.2 Danh mục hành chính nên do backend phục vụ

Hiện client dùng file tĩnh (34 tỉnh, 3.321 phường; sinh từ `provinces.open-api.vn`, chốt ngày
2026-08-08) đặt ở `packages/constants/src/vn/`.

Backend **buộc phải** có danh mục này để kiểm dữ liệu ghi vào (1.1). Đã có sẵn ở backend rồi
thì để client giữ bản thứ hai là tự tạo rủi ro hai bên lệch nhau — người dùng chọn được phường
mà backend từ chối. Vì cùng monorepo, bước đầu có thể để **cả `apps/api` lẫn client cùng
import từ `packages/constants`** — một nguồn, hai nơi dùng — rồi mới tính chuyện endpoint.

**Đề xuất cho đặc tả:** một endpoint `GET /public/wards` trả toàn bộ danh mục kèm `ETag` và
cache dài hạn. Client gọi một lần, lần sau trình duyệt trả từ cache. Phía client đã sẵn đường
chuyển: mọi nơi đi qua đúng một hàm `loadVnWards()`, đổi nguồn chỉ sửa ruột hàm đó.

### 2. Bản đồ vị trí

**Thiếu:** `latitude`, `longitude` trên `RentalListing`. Tiện ích xung quanh đã có entity
`ListingNearbyPlace` (`type`, `description`, `distance`).

AS-018 đã dự trù *"map dùng bên thứ ba; geocoding khi đăng tin"* — tức toạ độ vốn nằm trong
kế hoạch, chỉ chưa có cột. Toạ độ nên sinh bằng geocoding từ địa chỉ lúc đăng, không bắt người
dùng nhập tay. Web đã có `ListingLocationMap` sẵn sàng nhận toạ độ.

### 3. Thông tin phòng và chi phí

**Thiếu trên `RentalListing`/`ListingCost`:**

| Trường | Kiểu | Vì sao cần |
|---|---|---|
| `maxOccupants` | int, null | Nhiều chủ trọ có quy định số người tối đa; người thuê cần biết trước khi liên hệ |
| `waterPricingUnit` | enum `PerPerson` / `PerCubicMeter` | **"100.000đ" vô nghĩa nếu thiếu đơn vị** — theo người hay theo khối là hai con số hoàn toàn khác |
| `otherFees` | danh sách `{ name, amount }` | Phí dịch vụ, rác, mạng… tuỳ khu; không ép nhập, nhưng có thì phải hiện minh bạch |

Ba trường này đang là thứ prototype nhồi vào `description` bằng marker `---METADATA---`.
B5 (đăng tin) đã có ô nhập cho cả ba, đang giữ ở type `PROPOSAL:`.

### 4. Số liệu hiệu quả tin đăng

**Thiếu:** số lượt xem tin.

Trang quản lý tin của chủ trọ ở prototype hiển thị "Tổng lượt xem" và "Tổng liên hệ" nhưng
`RentalListing` không có trường đếm nào — bản prototype **điền số cứng**. Bản rebuild đã bỏ
hai ô đó thay vì hiện số không có nguồn.

- **Lượt liên hệ** suy được từ entity `ContactEvent` đã có — `AnalyticsModule` chỉ cần
  endpoint tổng hợp.
- **Lượt xem** thì chưa có chỗ nào ghi; cần quyết định có làm không (cột đếm trên
  `RentalListing`, hoặc bảng sự kiện riêng nếu muốn phân tích theo thời gian).

---

## Thứ tự ưu tiên đề nghị

1. **Mục 3** — ảnh hưởng trực tiếp chất lượng tin đăng; B5 đã có ô nhập, chỉ thiếu cột.
2. **Mục 2** — giao diện đã sẵn sàng nhận toạ độ; cần chốt trước migration đầu tiên của
   `RentalListing`.
3. **Mục 1.1 + 1.2** — 1.1 là quy tắc validation, chốt cùng `ListingModule`; 1.2 có đường đi
   tạm bằng `packages/constants` dùng chung.
4. **Mục 4** — tính năng phụ trợ cho chủ trọ, không chặn luồng chính.
