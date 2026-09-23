# Khoảng trống dữ liệu — bốn mục đã chốt, hai mục hoãn

Những chỗ giao diện cần dữ liệu mà Mục 6 của `docs/spec/dac-ta-ky-thuat.md` (và bản chép
`DATA_ENTITIES.md`) chưa có cột, phát hiện trong lúc rebuild. **Đợt đồng bộ v3.6 (23/09/2026) đã
chốt bốn mục vào đặc tả**; hai mục còn lại chuyển sang *hoãn* kèm lý do. File này giữ lại để
biết vì sao mỗi cột tồn tại và để không dựng lại những phương án đã bị bác.

Nguyên tắc vẫn giữ nguyên với hai mục hoãn: **không tự thêm cột** vào `schema.prisma` hay
`packages/schemas` khi đặc tả chưa có, **không tự sửa `DATA_ENTITIES.md`**, và tuyệt đối **không
nhồi dữ liệu vào trường văn bản** (prototype từng nối JSON vào cuối `description` — cách đó biến
mô tả vừa là nội dung cho người đọc vừa là kho dữ liệu, và đã bị loại khi port).

## Trạng thái tổng hợp

| Mục | Trạng thái | Căn cứ trong đặc tả |
|---|---|---|
| 1. Địa chỉ hành chính — lưu mã lẫn tên | **Đã chốt** | `RentalListing`: `provinceCode + wardCode` (lọc), `wardName + addressDetail` (hiển thị); AS-027, BR-043 |
| 1.1 Máy chủ tự suy `wardName` từ mã | **Đã chốt** | BR-043; Mục 9 (validation địa chỉ) |
| 1.2 Danh mục hành chính gói sẵn trong mã nguồn | **Đã chốt** — bác phương án endpoint | BR-043 |
| 2. Toạ độ bản đồ | **Đã chốt** | `RentalListing.latitude/longitude` (null); AS-018 |
| 3. Số người ở tối đa | **Đã chốt** | `Room.maxOccupants` (null); Mục 9 |
| 4. Cách tính tiền nước | **Đã chốt** | `Property.waterPricingMethod`, `ListingCost.waterPricingMethod`, `UtilityReading.pricingMethod` + `occupantCount`; BR-042 |
| 5. Các khoản phí khác (`otherFees`) | **Hoãn** | Chưa vào đặc tả |
| 6. Đếm lượt xem tin | **Hoãn** | `ContactEvent` đã có; đếm lượt xem chưa |

---

## Đã chốt

### 1. Địa chỉ hành chính

`RentalListing`, `RoommateWantedPost` và `Property` đều mang `provinceCode + wardCode` để lọc và
`wardName` (+ `addressDetail`/`address`) để hiển thị; AS-027 chốt mô hình hành chính hai cấp.
Giữ lại lý do vì nó giải thích vì sao phải lưu **cả mã lẫn tên**:

- Lọc theo khu vực bằng **so sánh chuỗi** thì lệch một ký tự ("Phường Tân Hưng" vs
  "P. Tân Hưng") là mất kết quả.
- Đợt sáp nhập 01/07/2025 đã **bỏ hẳn cấp quận/huyện**. Chỉ lưu tên thì sau lần đổi địa giới
  tiếp theo, tin cũ mang tên đã khai tử và **không có mã để tra ngược** ra đơn vị mới.
- Mã trả lời "đơn vị hành chính nào, một cách chuẩn xác"; tên là **ảnh chụp tại thời điểm
  đăng** để hiển thị đúng lịch sử.
- **Dùng mã Tổng cục Thống kê, không tự đánh ID mới.** Tự đánh số riêng nghĩa là nhận việc
  duy trì một bảng ánh xạ vĩnh viễn.

### 1.1 Tên phường do máy chủ suy ra, không nhận từ client

Chốt thành quy tắc ở **BR-043** và ràng buộc "Địa chỉ" trong Mục 9. Client chỉ gửi
`provinceCode` + `wardCode` + `addressDetail`; `ListingModule` tra tên từ danh mục rồi mới ghi
vào `wardName`, đồng thời kiểm mã phường có tồn tại và có thuộc đúng tỉnh không.

Đúng nguyên tắc đã ghi trong `AGENTS.md`: *giá trị suy được thì derive server-side, không nhận
từ client*. Nếu client gửi kèm tên, người ta có thể gửi `wardCode` của một khu rẻ nhưng
`wardName` của khu đắt để lọt vào kết quả tìm kiếm sai — suy ở server thì bịt hẳn.

### 1.2 Danh mục hành chính gói sẵn trong mã nguồn — không làm endpoint

**Đặc tả chọn phương án gói sẵn** (BR-043): danh mục (34 tỉnh, 3.321 phường; sinh từ
`provinces.open-api.vn`, chốt ngày 2026-08-08) đặt ở `packages/constants/src/vn/`, **cả `apps/api`
lẫn web/mobile cùng import từ đó** — một nguồn, ba nơi dùng. Danh mục rất ít thay đổi (lần gần
nhất 01/07/2025) nên bộ lọc phản hồi tức thì và máy chủ dùng đúng bộ dữ liệu đó để kiểm mã.

> **Đề xuất endpoint `GET /public/wards` (kèm `ETag`) đã bị bác — đừng dựng lại.** Backend buộc
> phải có danh mục này để kiểm dữ liệu ghi vào (1.1); đã có sẵn trong mã nguồn rồi thì thêm một
> endpoint phục vụ đúng bộ dữ liệu đó chỉ là thêm một đường lệch. Phía client mọi nơi vẫn đi qua
> đúng một hàm `loadVnWards()`, nên nếu về sau danh mục lớn tới mức cần tải động thì đổi ruột
> hàm đó là xong.

### 2. Toạ độ bản đồ

`RentalListing` đã có `latitude` + `longitude`, **được rỗng**. Tiện ích xung quanh vẫn ở entity
`ListingNearbyPlace` (`type`, `description`, `distance`).

AS-018 đã dự trù *"map dùng bên thứ ba; geocoding khi đăng tin"*. Toạ độ sinh bằng geocoding từ
địa chỉ lúc đăng, không bắt người dùng nhập tay; rỗng thì giao diện **ẩn bản đồ** thay vì hiện
bản đồ sai chỗ. Đặc tả cố ý **không đặt ràng buộc dải giá trị** cho hai cột này.

### 3. Số người ở tối đa

`Room.maxOccupants` (null), Mục 9 thêm ràng buộc `> 0` nếu có. Nhiều chủ trọ có quy định số
người tối đa; người thuê cần biết trước khi liên hệ. Lưu ý cột nằm ở **`Room`**, không ở
`RentalListing` như đề xuất ban đầu — sức chứa là thuộc tính của phòng thật, tin đăng chỉ hiển
thị lại.

### 4. Cách tính tiền nước

**BR-042** chốt ba cách: theo khối, theo đầu người, khoán cố định — và ba chỗ lưu:

| Cột | Vai trò |
|---|---|
| `Property.waterPricingMethod` | **Nguồn chính** — cài ở cấp khu, áp cho mọi phòng trong khu |
| `ListingCost.waterPricingMethod` | Để tin đăng hiển thị đúng đơn vị giá |
| `UtilityReading.pricingMethod` + `occupantCount` | Chốt cứng lúc ghi, cùng `unitPrice` (BR-036) |

`UtilityReading.currentReading` theo đó **thành nullable** — hai cách tính sau không có chỉ số.

Đề xuất ban đầu là một cột `waterPricingUnit` với hai giá trị `PerPerson`/`PerCubicMeter` trên
`ListingCost`. Đặc tả mở rộng thành **ba** giá trị (thêm `FlatRate`) và đặt nguồn chính ở cấp
khu, vì phần lớn nhà trọ Việt Nam dùng chung một đồng hồ nước cho cả khu — cách tính là đặc tính
của khu, không phải của từng tin đăng. Lý do gốc vẫn đúng và vẫn là lý do cột tồn tại:
**"100.000đ" vô nghĩa nếu thiếu đơn vị** — theo người hay theo khối là hai con số hoàn toàn khác.

---

## Hoãn

### 5. Các khoản phí khác (`otherFees`)

**Thiếu:** danh sách `{ name, amount }` trên `ListingCost` cho phí rác, mạng, thang máy… tuỳ khu.

**Vì sao hoãn:** đây là **quan hệ một-nhiều**, không phải một cột — làm đúng thì cần một entity
riêng (hoặc cột jsonb, mà jsonb thì mất khả năng lọc và kiểm dữ liệu). Bốn khoản đã có
(`electricityBill`, `waterBill`, `serviceFee`, `deposit`) phủ phần lớn tin đăng, nên chi phí cấu
trúc chưa xứng với lợi ích.

**Trạng thái phía web:** B5 (bước chi phí, `StepCosts.tsx`) **vẫn có ô nhập** danh sách phí khác,
giữ ở `ListingExtras` đánh dấu `PROPOSAL:` — dữ liệu không đi đâu cả khi nối API thật. Khi dựng
`packages/schemas` phải quyết: bỏ ô nhập, hay giữ và chấp nhận nó chỉ nằm trong bản nháp cục bộ.

**Mở lại khi:** có số liệu cho thấy chủ trọ thật sự cần khai thêm khoản, hoặc khi cần đối chiếu
chi phí tin đăng với hóa đơn thật (`InvoiceItem` đã có `type=Other`).

### 6. Đếm lượt xem tin

**Thiếu:** số lượt xem tin.

Trang quản lý tin của chủ trọ ở prototype hiển thị "Tổng lượt xem" và "Tổng liên hệ" nhưng
`RentalListing` không có trường đếm nào — bản prototype **điền số cứng**. Bản rebuild đã bỏ hai
ô đó thay vì hiện số không có nguồn.

- **Lượt liên hệ** suy được từ entity `ContactEvent` đã có — `AnalyticsModule` chỉ cần endpoint
  tổng hợp, không cần cột mới.
- **Lượt xem** thì chưa có chỗ nào ghi.

**Vì sao hoãn:** là tính năng phụ trợ, không chặn luồng chính; và làm đúng thì phải chọn giữa
cột đếm trên `RentalListing` (rẻ, nhưng không phân tích được theo thời gian và mỗi lần xem là
một lượt ghi vào bảng nóng) hay bảng sự kiện riêng (phân tích được, nhưng phải chống đếm trùng
và phải có job gộp). Chốt sai lúc này là nhận một migration sửa đổi về sau.

**Mở lại khi:** dựng `AnalyticsModule` — làm luôn endpoint tổng hợp lượt liên hệ trước, rồi
quyết định lượt xem trên số liệu thật.

---

## Việc kéo theo phía code

Các trường từng đánh dấu `PROPOSAL:` ở web (`features/marketplace/types/listingLocation.ts`,
`postListing.ts`) **nay đã có cột trong đặc tả**. Khi dựng `packages/schemas`, gỡ dấu `PROPOSAL:`
và cho chúng đi theo schema dùng chung như mọi trường khác. Ba chỗ cần khớp lại chứ không chép
nguyên:

- `WaterPricingUnit` ở web chỉ có hai giá trị (`PerPerson`/`PerCubicMeter`) — đặc tả có **ba**,
  thiếu `FlatRate`; và tên chuẩn là `waterPricingMethod`.
- Cách tính nước là cài đặt **cấp khu** (`Property`); trên tin đăng nó chỉ là bản sao để hiển
  thị. Form B5 hiện cho người đăng chọn tự do — khi tin gắn `propertyId` thì nên lấy theo khu.
- `maxOccupants` là cột của **`Room`**; ô nhập ở B5 (`StepRoomInfo.tsx`) là dữ liệu của tin, khi
  tin gắn `roomId` thì phải thống nhất một nguồn.
- `otherFees` vẫn thuộc mục hoãn ở trên, chưa có chỗ lưu.
