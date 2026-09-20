# Bản đối chiếu nghiệp vụ — trạng thái đã dựng tới B9

**Mục đích:** một file duy nhất để đối chiếu với tài liệu nghiệp vụ chính, liệt kê _đúng những
gì code đang làm_ và _chỗ nào khác với tài liệu / khác với prototype_. Dùng để chỉnh tài liệu
chính cho khớp thực tế, không phải để đọc thay tài liệu.

**Mốc:** `feat/rebuild` tại `9ad2270` (sau PR #23). Viết 13/09, bổ sung 6.8 ngày 21/09/2026. Nguồn đối chiếu:
`.agents/business/*`, `docs/DATABASE_DESIGN.md`, `PROJECT_STATE.md` và chính mã nguồn.

**Ký hiệu**

|     | Nghĩa                                                                            |
| --- | -------------------------------------------------------------------------------- |
| ✅  | Code khớp tài liệu — không cần sửa doc                                           |
| 🔧  | Code **tinh chỉnh** hoặc **làm rõ** điều tài liệu nói chưa đủ — doc nên ghi thêm |
| ➕  | Quyết định **mới** phát sinh khi dựng, tài liệu chưa có — doc cần bổ sung        |
| ⏸   | Có trong tài liệu nhưng **cố ý hoãn**, kèm lý do                                 |
| ❓  | **Chưa chốt** — cần chủ dự án quyết                                              |
| ⚪  | Chưa dựng / chưa đối chiếu được ở phía frontend                                  |

---

## 1. Mô hình định danh và quyền

Toàn bộ đúng theo `SURFACES_AND_MODES.md`, `ROLES_AND_IDENTITY.md`, `ACCESS_GATING.md`. Không
có chỗ nào code làm khác. Tóm lại để đối chiếu:

### 1.1 Ba khái niệm tách bạch ✅

| Khái niệm      | Là gì                                                    | Ai quyết                  | Code                                                   |
| -------------- | -------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| **Surface**    | `marketplace` · `workspace` · `residency`                | Kiến trúc, cố định        | Route group `(public)` / `(workspace)` / `(residency)` |
| **Mode**       | Bối cảnh người dùng đang đứng                            | Người dùng chọn           | Chưa dựng (A7 để cuối)                                 |
| **Capability** | `roles[]`, `workspaceStatus`, `residencyStatus`, hạn mức | **Server** suy từ dữ liệu | `GET /me/context` (mock) → `packages/access`           |

- **Mode ≠ Role.** Đăng nhập bằng danh tính (SĐT + OTP), không bao giờ bằng vai trò.
- **Không có role `Resident`** (AS-023). Người ở vẫn là `Renter`, khác ở `residencyStatus`.
- **Role cộng dồn** (BR-013, AS-004): `[Renter]` → `[Renter, Seller]` khi đăng tin đầu tiên
  hoặc mở Workspace lần đầu.

### 1.2 Luật truy cập viết một lần ✅

`packages/access` là bản dịch 1-1 của bảng quyết định trong `SURFACES_AND_MODES.md` §3, kèm
**26 test**. UI không bao giờ viết `status === 'READ_ONLY'` hay `roles.includes('Seller')` —
hỏi qua `canWriteInSurface()` / `getSurfaceDenial()`. Mọi nút ghi trong Workspace đi qua
`WriteGuardButton`, mọi route Workspace bọc `SurfaceGate`.

| `workspaceStatus` | Đọc SaaS | Ghi | Đã dựng                           |
| ----------------- | -------- | --- | --------------------------------- |
| `NONE`            | ✗        | ✗   | Sidebar khóa, dẫn về `/chu-tro`   |
| `TRIAL`           | ✓        | ✓   | Banner "còn N ngày"               |
| `ACTIVE`          | ✓        | ✓   | —                                 |
| `READ_ONLY`       | ✓        | ✗   | Banner đỏ, nút ghi khóa kèm lý do |

### 1.3 B4/B5 thuộc Marketplace — đã chốt ✅

`SCREENS_WORKSPACE.md` đã sửa. Sidebar Workspace không còn nhóm "Tin đăng — miễn phí"; thay
bằng cụm cross-surface có nhãn rõ. Route thật: `/tai-khoan/tin-cho-thue` (B4) và
`/dang-tin-cho-thue` (B5), không có tiền tố `/chu-tro`.

### 1.4 Quyền sở hữu kiểm ở route ✅ (BR-007)

Mọi route theo `{id}` trong Workspace (`/chu-tro/khu-tro/{id}`, `/chu-tro/phong/{id}`,
`/chu-tro/phong/{id}/nguoi-o`) kiểm `property.sellerId === sellerId` ở Server Component, sai
→ `notFound()`. Không lộ mã phòng của người khác khi gõ thẳng URL.

---

## 2. Thực thể đã dựng và quyết định ở tầng dữ liệu

### 2.1 `Property` (khu trọ) — B6, B7

| Trường                                             | Tài liệu                       | Đã dựng                                   | Ghi chú                                                                                |
| -------------------------------------------------- | ------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------- |
| `electricityPrice` / `waterPrice` / `servicePrice` | ⚠️ `DATA_ENTITIES` **chưa có** | ➕ Có, bắt buộc                           | Tầng 1 của đơn giá ba tầng — đã chốt ở `DATABASE_DESIGN` §10.2                         |
| `bankName`                                         | Text                           | 🔧 Lưu **mã** ngân hàng (`"MB"`, `"VCB"`) | Đã chốt `DATABASE_DESIGN` §10.12. VietQR cần BIN 6 số; text tự do sinh QR chết im lặng |
| `bankAccountName`                                  | Text                           | 🔧 Tự chuyển **IN HOA không dấu** khi gõ  | Ràng buộc kỹ thuật VietQR, không phải lỗi người dùng                                   |
| `provinceCode` / `wardCode`                        | `district`                     | 🔧 Dùng mã 2 cấp (34 tỉnh, 3.321 phường)  | `district` hiện chứa tên phường — xem ❓ mục 6.3                                       |
| `isPublicProfileEnabled` / `publicSlug`            | ✅                             | ✅                                        | Toggle ở B7 theo BR-024                                                                |
| `avgRating` / `reviewCount`                        | Dẫn xuất                       | ✅ Chỉ hiển thị                           | Client không tính                                                                      |

**Năm khối của B7 lưu độc lập** (thông tin, đơn giá, nhận tiền, hồ sơ công khai, vùng nguy
hiểm) — không có nút Lưu chung. Xóa khu chặn theo BR-011 khi còn phòng `Rented`/`Deposited`
hoặc hợp đồng `Active`.

### 2.2 `Room` (phòng) — B8, B9

| Trường                                                | Tài liệu           | Đã dựng                     | Ghi chú                                                            |
| ----------------------------------------------------- | ------------------ | --------------------------- | ------------------------------------------------------------------ |
| `status`                                              | 4 giá trị BR-002   | ✅                          | `ALLOWED_ROOM_STATUS_TRANSITIONS` encode đúng bảng                 |
| `electricityPrice` / `waterPrice` / `servicePrice`    | ⚠️ chưa có         | ➕ Có, **nullable**         | Tầng 2. **`null` = theo giá khu, `0` = miễn phí.** Hai ý khác nhau |
| `amenities`                                           | `Room n-n Amenity` | ➕ Đã dựng (PR #22)         | Lưu **nhãn** tiếng Việt, không lưu key — xem ❓ mục 6.5            |
| `accessPolicy` / `accessOpenTime` / `accessCloseTime` | BR-025             | ⚪ Chưa có trên Room        | Có trên `RentalListing` (B5). Tài liệu ghi cả hai                  |
| `hasActiveListing`                                    | Dẫn xuất           | ✅ Badge "Có tin đang chạy" | BR-027                                                             |
| `hasActiveContract`                                   | Dẫn xuất           | ✅                          | Chặn xóa phòng                                                     |

**Ô để trống ≠ số 0.** `Number('')` ra `0`, nên form kiểm chuỗi rỗng **trước** khi parse.
Ràng buộc "phải khai" thuộc form, không thuộc schema thực thể (`roomPriceSchema` cố ý cho
`≥ 0` vì phòng cho người nhà ở nhờ là dữ liệu thật).

### 2.3 `Occupancy` (người ở) — B10

| Điểm                             | Tài liệu                       | Đã dựng                                                                                                   |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Nhiều người ở cùng lúc một phòng | Module 7 + BR-006              | ✅ Mỗi người **một bản ghi riêng**, SĐT riêng, `linkStatus` riêng                                         |
| Người đại diện hợp đồng          | Contract gắn **một** Occupancy | ✅ `isContractRepresentative` trên Occupancy; đổi đại diện sửa **hai** bản ghi cùng lúc                   |
| Liên kết tài khoản               | BR-029                         | ✅ Tra theo **SĐT** (BR-016), luôn ra `Pending`, **không có đường tắt** sang `Confirmed`                  |
| `endDate`                        | —                              | 🔧 Là ngày **bắt đầu không còn ở**, không phải ngày ở cuối. "Đang ở" = `endDate > today`, không phải `>=` |
| `occupantCount`                  | Có                             | ✅ Số nhân khẩu **của bản ghi đó** — xem `DATABASE_DESIGN` §10.11                                         |

Prototype mô hình hóa "một người ở + `occupantCount`" và tra theo email — **cả hai đều bỏ**.

### 2.4 `Contract` (hợp đồng) — B11

| Điểm                                     | Tài liệu | Đã dựng                                                                                                       |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| Tối đa 1 Active / Room, chặn chồng lấn   | BR-006   | ✅ `hasDateRangeOverlap` — khoảng **đóng hai đầu** (🔧 doc chưa nói đóng/mở)                                  |
| Tạo Active → Room `Rented`               | BR-031   | ✅ Phòng `Hidden` thì **không** đụng (chủ đang cố ý ẩn)                                                       |
| Kết thúc → Room giữ nguyên, gợi ý 1 chạm | BR-031   | ✅ Dialog nói rõ còn một bước nữa                                                                             |
| Job chuyển `Expired`                     | BR-006   | ⚪ Backend. FE gắn cờ **"Active đã qua `endDate`"** ở B9/B11 vì giữa hai lần job chạy trạng thái vẫn `Active` |
| Upload scan                              | BR-008   | ⏸ Cần private bucket + signed URL                                                                             |
| Gia hạn                                  | —        | ➕ Dời `endDate`, giữ người đại diện và hóa đơn cũ, vẫn kiểm chồng lấn                                        |
| Chấm dứt sớm                             | BR-006   | ✅ Bắt buộc `terminateReason`                                                                                 |

### 2.5 `UtilityReading` (chỉ số) — B12

| Điểm                                                | Tài liệu           | Đã dựng                                                                                                                 |
| --------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Unique (roomId, type, period); `current ≥ previous` | `VALIDATION_RULES` | ✅                                                                                                                      |
| `unitPrice` chốt cứng lúc ghi                       | §10.2 tầng 3       | ✅ Đổi giá khu sau không làm đổi hóa đơn kỳ đã ghi                                                                      |
| `invoiceId` đánh dấu đã lên hóa đơn                 | `DATA_ENTITIES`    | 🔧 Đã lên hóa đơn thì **bất biến**, không sửa được nữa (doc chưa nói)                                                   |
| `previousReading` lấy từ đâu                        | —                  | ➕ Từ **kỳ liền trước theo `period`**, không theo `createdAt`. Ghi bù kỳ cũ mà lấy theo thời điểm tạo là ra tiêu thụ âm |
| Chỉ ghi cho phòng nào                               | `USER_FLOWS`       | ✅ Chỉ phòng có Contract `Active`                                                                                       |
| Ghi hàng loạt                                       | —                  | ➕ Bảng cả khu theo kỳ, lưu một lần (prototype: modal từng phòng). Backend nên nhận **một transaction** cho cả bảng     |

### 2.6 `Invoice` · `InvoiceItem` · `Payment` — B12

| Điểm                                                    | Tài liệu                    | Đã dựng                                                                                                                                     |
| ------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Unique (contractId, period) → `contractId` **bắt buộc** | `DATA_ENTITIES`             | ✅ Phòng chưa có Contract Active **không xuất được**. Prototype cho phép null — đã bỏ                                                       |
| Tiền thuê lấy từ đâu                                    | —                           | ➕ **`Contract.rentPrice`**, không phải `Room.price`. Hợp đồng là căn cứ pháp lý; phòng tăng giá sau ngày ký thì giá phòng là sai           |
| `status` suy từ ΣPayment + `dueDate`                    | BR-004, `STATUS_ENUMS`      | ✅ **Client không tự tính.** Mock có `deriveInvoiceStatus` ở tầng service đóng vai backend, ghi `XÓA khi nối API`                           |
| Thu một phần **đã quá hạn**                             | BR-004                      | ✅ Vẫn là `Overdue`, không phải `PartiallyPaid`                                                                                             |
| `InvoiceItem.type`                                      | 6 giá trị                   | ✅ Có `Deposit`. Prototype chỉ có 5                                                                                                         |
| Ghi nhận thu                                            | AS-002                      | 🔧 Ô điền sẵn **số còn thiếu** (không phải tổng); **chặn thu vượt**; cho sửa số (thu một phần là thường). Doc chưa nói chặn vượt            |
| Nội dung chuyển khoản VietQR                            | "addInfo = mã hóa đơn"      | ➕ Mã hóa đơn `P101-202608`; nội dung CK rút gọn **≤ 25 ký tự** theo thang bậc, **không bao giờ cắt kỳ** (7 test). Doc chưa ghi giới hạn 25 |
| Số tiền trên QR                                         | —                           | ➕ Là **số còn thiếu**, không phải tổng — hóa đơn đã thu một phần mà quét ra tổng gốc thì người ở chuyển thừa                               |
| Gửi hóa đơn                                             | `PATCH /invoices/{id}/send` | 🔧 Chỉ ghi `sentAt` + in qua `window.print()`. Gửi in-app thật ⏸ chờ A11 + `Notification`                                                   |
| `Media` đính kèm hóa đơn                                | `DATA_ENTITIES`             | ⏸ Cùng lý do BR-008                                                                                                                         |

### 2.7 `Amenity` (tiện ích) — PR #22

| Điểm                                              | Tài liệu        | Đã dựng                                                                                              |
| ------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| Catalog `name`, `icon`, `type` (Room/Surrounding) | `DATA_ENTITIES` | 🔧 Catalog 11 mục ở `src/constants/amenities.ts`, dùng chung tin đăng + phòng. Chưa phân biệt `type` |
| `Room n-n Amenity`                                | `DATA_ENTITIES` | ✅ `Room.amenities: string[]`                                                                        |
| Lưu gì xuống DB                                   | —               | ❓ FE lưu **nhãn**. Nếu BE có bảng `amenities` với id thì cần map — xem mục 6.5                      |
| Mảng rỗng                                         | —               | ➕ Là dữ liệu **thật** (phòng thô), UI nói rõ thay vì để trống                                       |

---

## 3. Bảng đối chiếu Business Rules (BR-001 → BR-035)

| BR  | Nội dung ngắn                            | FE đã dựng   | Ghi chú                                                                   |
| --- | ---------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| 001 | Vòng đời tin đăng                        | ✅ B4/B5     | Badge đúng 7 trạng thái                                                   |
| 002 | Trạng thái phòng 4 giá trị               | ✅ B8        | Chip màu thay `<select>`                                                  |
| 003 | Sửa trường quan trọng → duyệt lại        | ⚪           | Chưa đối chiếu cảnh báo trước lưu ở B4                                    |
| 004 | Trạng thái hóa đơn suy từ ΣPayment       | ✅ B12       | Service suy, UI không tính                                                |
| 005 | Chỉ hiện Active, boost xếp trước         | ⚪           | Mock sắp xếp, chưa kiểm kỹ                                                |
| 006 | Hợp đồng: 1 Active/Room, chặn chồng lấn  | ✅ B11       | Khoảng **đóng hai đầu**                                                   |
| 007 | Dữ liệu SaaS riêng theo `sellerId`       | ✅           | Kiểm ở route, `notFound()`                                                |
| 008 | Scan hợp đồng private                    | ⏸            | Cần backend                                                               |
| 009 | Tin nhu cầu 30 ngày                      | ⚪           | A5/A9/A10 chưa làm                                                        |
| 010 | Tối đa 2 tin nhu cầu Active              | ⚪           | —                                                                         |
| 011 | Không xóa khu còn phòng thuê / HĐ Active | ✅ B7        | `countBlockingRooms`                                                      |
| 012 | Dashboard: số nhạy cảm mặc định TẮT      | ⚪           | B3 chưa làm. **Không áp** cho B12 — màn tiền, người vào đang chủ động thu |
| 013 | Đa vai trò cộng dồn                      | ✅           | `packages/access`                                                         |
| 014 | Hai kênh liên hệ, che SĐT với Guest      | ✅ A3        | `PhoneModal`                                                              |
| 015 | Gating 4 trạng thái                      | ✅           | `WriteGuardButton`, `SurfaceGate`                                         |
| 016 | SĐT duy nhất, định danh                  | ✅ B10       | Liên kết tra theo SĐT                                                     |
| 017 | Nhắc gia hạn gói                         | ⚪           | B15                                                                       |
| 018 | ≥3 report → PendingApproval              | ⚪           | Backend                                                                   |
| 019 | Luật nhắn tin                            | ⚪           | A11                                                                       |
| 020 | Chặn trong chat                          | ⚪           | A11                                                                       |
| 021 | Thuế tham khảo, cash basis               | ⚪           | B14                                                                       |
| 022 | Review verified-only                     | ⚪           | B16 / C                                                                   |
| 023 | Vòng đời review                          | ⚪           | —                                                                         |
| 024 | Hiển thị review khi khu bật public       | ✅ B7 toggle | A4 trang public chưa làm                                                  |
| 025 | Giờ giấc `accessPolicy`                  | ✅ B5/A3     | Chưa có trên `Room`                                                       |
| 026 | Tin 60 ngày, gia hạn không duyệt lại     | ✅ B4        | Viết mới, prototype không có                                              |
| 027 | Room ↔ Listing đồng bộ                   | 🔧           | Badge có; auto-`Rented` là backend; **"Tạo tin từ phòng" chưa làm**       |
| 028 | Khóa tài khoản → ẩn tin                  | ⚪           | Backend/Admin                                                             |
| 029 | Liên kết cần xác nhận                    | ✅ B10       | Luôn `Pending`                                                            |
| 030 | Cấm tự tương tác                         | ⚪           | Validation API                                                            |
| 031 | RoomStatus ↔ Contract                    | ✅ B11       | —                                                                         |
| 032 | Báo cáo bắt buộc đăng nhập               | ✅ A3        | —                                                                         |
| 033 | Người ở đề xuất chỉ số                   | ⏸            | B18                                                                       |
| 034 | Phạm vi người ở                          | ⚪           | Khu C                                                                     |
| 035 | Vòng đời sự cố                           | ⚪           | B17 / C                                                                   |

---

## 4. Luồng đã dựng — hành vi thực tế

### 4.1 Khu → Phòng → Người ở → Hợp đồng → Chỉ số → Hóa đơn → Thu

```
B6 Danh sách khu ──► B7 Chi tiết khu (đơn giá khu, STK/VietQR, public)
      │
      └► B8 Lưới phòng ──► B9 Chi tiết phòng (hub chỉ đọc)
               │                 │
               │                 ├► B10 Người ở (thêm theo SĐT, đại diện, kết thúc ở)
               │                 ├► B11 Hợp đồng (lập, gia hạn, chấm dứt)
               │                 └► B12 Hóa đơn (lọc ?phong=)
               │
               └► B12 tab Ghi điện nước (bảng cả khu theo kỳ)
                        │
                        └► B12 tab Hóa đơn: Tạo ──► chi tiết (modal) ──► Đã thu / Đã gửi / In
```

**Điều kiện chuỗi:** phòng phải có **người ở** mới lập được hợp đồng; phải có **hợp đồng
Active** mới ghi được chỉ số và xuất được hóa đơn. UI nói rõ điều kiện thiếu ở mỗi bước và dẫn
sang màn cần làm, không để nút chết.

### 4.2 Luồng điện nước → hóa đơn (đối chiếu `USER_FLOWS.md` §"Seller ghi điện nước")

| Bước doc                                             | Đã dựng | Khác/Thêm                                                                                |
| ---------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| 1. Người ở gửi chỉ số kênh ngoài                     | —       | Đúng AS-009                                                                              |
| 2. Nhập `UtilityReading` cho Room có Contract Active | ✅      | ➕ Bảng cả khu, lưu một lần; ô đã lên hóa đơn khóa                                       |
| 3. Tạo `Invoice` + `InvoiceItem`, đánh dấu reading   | ✅      | ➕ Dòng điện/nước **chỉ đọc** trong form tạo — tính từ chỉ số, sửa thì về tab ghi chỉ số |
| 4. Xuất kèm VietQR (amount + mã HĐ) → gửi            | 🔧      | QR = **số còn thiếu**; gửi = đánh dấu + in                                               |
| 5. "Đã thu" → `Payment` → status suy                 | ✅      | 🔧 Chặn thu vượt                                                                         |

### 4.3 Luồng người ở (đối chiếu `USER_FLOWS.md` §"Seller thêm người ở")

✅ Khớp. Bổ sung: đổi người đại diện là một thao tác riêng, sửa hai bản ghi và trả về cả nhóm
để cache không hiện hai người cùng làm đại diện.

---

## 5. Quyết định đã chốt — khác doc hoặc khác prototype

Mỗi mục: _doc đang ghi gì → đã dựng thế nào → đề xuất cho doc chính._

### 5.1 Đơn giá ba tầng (đã chốt, `DATABASE_DESIGN` §10.2)

- **Doc `DATA_ENTITIES`:** không có cột đơn giá trên `Property`/`Room`, chỉ có
  `UtilityReading.unitPrice`.
- **Đã dựng:** khu (bắt buộc) → phòng (nullable) → chốt cứng vào chỉ số.
- **Đề xuất:** thêm 3 cột vào `Property` và 3 cột nullable vào `Room` trong `DATA_ENTITIES`.
  Ghi rõ **`null` = thừa hưởng, `0` = miễn phí**. Không bao giờ hiển thị `null` thành "chưa
  cấu hình". ❓ Chốt tên cột: `service_fee` hay `service_price`.

### 5.2 Hóa đơn bắt buộc gắn hợp đồng

- **Doc:** `unique (contractId, period)` ⇒ ngầm hiểu không null.
- **Đã dựng:** đúng như doc. Prototype cho phép `contractId = null` — **bỏ**.
- **Đề xuất:** viết tường minh trong `BUSINESS_RULES` (một BR mới hoặc mở rộng BR-004/006):
  _"Hóa đơn chỉ xuất được cho phòng có hợp đồng `Active`; tiền thuê lấy từ
  `Contract.rentPrice`."_

### 5.3 Trạng thái hóa đơn do backend quyết

- **Doc:** `STATUS_ENUMS` đã ghi "client không tự tính".
- **Đã dựng:** đúng. Một hàm duy nhất ở service, B9 và B12 cùng đọc.
- **Đề xuất:** không đổi doc. Nhắc backend: job `Overdue` phải chạy theo
  `Asia/Ho_Chi_Minh` (§10.9).

### 5.4 VietQR tự sinh tại máy, không gọi quicklink

- **Doc:** AS-002 nói "hóa đơn kèm STK/VietQR của khu", không nói cách sinh.
- **Đã dựng:** chuỗi EMVCo dựng ở `packages/utils/vietqr.ts` (22 test), vẽ bằng `qrcode`
  tại client. Lý do: quicklink `img.vietqr.io` nhận STK và số tiền qua URL query — mỗi lần
  render là một lần gửi thông tin tài chính của chủ trọ sang bên thứ ba.
- **Đề xuất:** ghi vào `NON_FUNCTIONAL` (riêng tư) hoặc AS-013.

### 5.5 Nội dung chuyển khoản ≤ 25 ký tự

- **Doc:** `VALIDATION_RULES` ghi "addInfo = mã hóa đơn", không ghi giới hạn.
- **Đã dựng:** NAPAS giới hạn 25. Mã hóa đơn `{roomCode}-{YYYYMM}`; nội dung CK rút gọn
  theo thang bậc, không bao giờ cắt kỳ (cắt kỳ tạo ra kỳ khác **có thật**).
- **Đề xuất:** ghi format mã hóa đơn và giới hạn 25 vào `VALIDATION_RULES`.

### 5.6 Người ở: nhiều bản ghi, liên kết bằng SĐT

- **Doc:** đúng (Module 7, BR-016, BR-029).
- **Prototype:** một người + `occupantCount`, tra theo email — **bỏ cả hai**.
- **Đề xuất:** doc không cần đổi. Chốt câu hỏi §10.11 về `occupant_count` (đã hiểu là số
  nhân khẩu của bản ghi đó) và §10.3 (bỏ `is_active`, suy từ `end_date`).

### 5.7 `endDate` là ngày bắt đầu không còn ở

- **Doc:** không định nghĩa.
- **Đã dựng:** "đang ở" = `endDate > today`. Người có `endDate` tương lai hiển thị "Sắp rời
  DD/MM".
- **Đề xuất:** ghi định nghĩa vào `DATA_ENTITIES` (Occupancy) để backend cùng hiểu.

### 5.8 Chồng lấn hợp đồng là khoảng đóng hai đầu

- **Doc:** BR-006 nói "chặn chồng lấn", chưa nói biên.
- **Đã dựng:** kết thúc 31/12 và bắt đầu 31/12 **là** chồng lấn.
- **Đề xuất:** ghi rõ vào BR-006. Backend cưỡng chế bằng `EXCLUDE` constraint (§6).

### 5.9 B12 là một màn hai tab; B13 là modal

- **Doc `SCREENS_WORKSPACE`:** B12 và B13 là hai dòng riêng, B13 có route `/chu-tro/hoa-don/{id}`.
- **Đã dựng:** B12 gồm tab Ghi điện nước + tab Hóa đơn; chi tiết hóa đơn là **modal**, chưa
  có route riêng.
- **Đề xuất:** đánh dấu B13 là "modal trong B12, route riêng để sau" hoặc giữ nguyên nếu vẫn
  muốn route.

### 5.10 B9 là trang tổng hợp chỉ đọc

- **Doc:** mô tả "Thông tin, người ở hiện tại (nhiều Occupancy), HĐ, hóa đơn gần đây" — khớp.
- **Đã dựng:** 6 khối + banner công nợ; chỉ sửa thông tin phòng tại đây; mọi thao tác khác dẫn
  sang B10/B11/B12. Drawer B8 giữ làm xem nhanh.
- **Đề xuất:** thêm chữ "chỉ đọc, dẫn sang màn chuyên trách" để người sau không nhân bản thao
  tác.

### 5.11 Tiện ích cho phòng

- **Doc:** `Room n-n Amenity` có sẵn.
- **Đã dựng:** `Room.amenities` lưu nhãn, catalog dùng chung với tin đăng.
- **Đề xuất:** xem ❓ 6.5.

### 5.12 Bỏ "chế độ demo"

- **Prototype:** `DemoBanner` / `DemoFAB`.
- **Đã dựng:** bỏ, chưa có khái niệm này ở repo mới.

### 5.13 Bộ lọc tìm kiếm

- **Đã dựng:** bỏ bộ lọc "Trạng thái" (Room.status là khái niệm SaaS, không thuộc Marketplace
  công khai); `PROPERTY_TYPES` thu về đúng 3 enum (`BoardingRoom/ServicedApartment/Apartment`).

### 5.14 Không dùng `useBreakpoint()` đọc `window.innerWidth`

- Responsive bằng Tailwind `md:`/`lg:` thuần — JS đọc `window` gây lệch SSR/hydration.

---

## 6. Cần chủ dự án chốt

### 6.1 ❓ Gateway phí nền tảng: PayOS thay VNPay?

- **Doc hiện ghi:** `API_CONTRACT` dòng `POST /payments/webhook/vnpay`; `USER_FLOWS` §"Thanh
  toán phí nền tảng" nhắc VNPay. `BACKEND_PROPOSALS` **không có lý do** cho lựa chọn này.
- **Đã khảo sát:** PayOS khớp đúng luồng đã thiết kế (tạo link ở server → redirect → webhook
  server-to-server có verify chữ ký; `returnUrl` chỉ để hiển thị). Có SDK Node (`@payos/node`)
  — khớp NestJS nếu chốt 6.8.
- **Ranh giới không đổi:** AS-002 — gateway **chỉ** cho `PlatformTransaction` (boost, gói
  SaaS). **Không** đưa tiền thuê qua gateway.
- **Nếu chốt PayOS:** sửa `API_CONTRACT` dòng webhook, `USER_FLOWS` mục thanh toán, thêm lý do
  vào `BACKEND_PROPOSALS`. Schema không đổi (`gatewayTxnId`, `idempotencyKey` đã trung lập).
- **Cần kiểm trước:** phí giao dịch thực tế, yêu cầu tài khoản doanh nghiệp, có sandbox không.

### 6.2 ❓ Tên cột `service_fee` vs `service_price`

§10.2 còn hở. FE đang dùng `servicePrice` ở cả khu và phòng. BE chọn một, FE đổi theo.

### 6.3 ❓ `district` → `ward_name` + `province_code` + `ward_code`

§10.1. FE đã dùng mã 2 cấp (`provinceCode`, `wardCode`) nhưng `DATA_ENTITIES` vẫn ghi
`district`. Đổi tên hay giữ và ghi chú?

### 6.4 ❓ `bank_name` → `bank_code`

§10.12 đã chốt **lưu mã**; tên cột còn sai nghĩa. BE quyết.

### 6.5 ❓ Tiện ích lưu **nhãn** hay **id**?

FE lưu nhãn tiếng Việt (quyết định từ B5, vì bộ lọc tìm kiếm và icon so theo nhãn). Nếu BE
dựng bảng `amenities` có id và bảng nối `room_amenities`, FE cần một bước map. Cần chốt sớm vì
ảnh hưởng cả `RentalListing.amenities` lẫn `Room.amenities`. Ngoài ra catalog có `type`
(Room/Surrounding) nhưng FE chưa phân biệt.

### 6.6 ❓ `accessPolicy` có trên `Room` không?

`DATA_ENTITIES` ghi cả `Room` lẫn `RentalListing` có `accessPolicy`/giờ giấc. FE chỉ dựng trên
`RentalListing`. Nếu `Room` cũng cần thì B8 form phải thêm.

### 6.7 ❓ Ai xác nhận thuế suất/ngưỡng 2026 (BR-021, AS-012)

Chưa ai chốt. Ảnh hưởng B14.

### 6.8 ❓ Backend đổi từ Java Spring Boot sang NestJS

Chủ dự án thông báo ngày 21/09/2026, chưa ghi vào tài liệu nào. **Không ảnh hưởng code
frontend** — ranh giới vẫn là `openapi.json`, client codegen ra `packages/types`. Nhưng phải
sửa **12 chỗ** đang ghi Java/Spring, nếu không agent phiên sau sẽ tin theo doc cũ:

| File                                          | Dòng           | Đang ghi                                    |
| --------------------------------------------- | -------------- | ------------------------------------------- |
| `.agents/business/ASSUMPTIONS.md`             | AS-020         | Java Spring Boot 4.1, Java 21, Maven        |
| `.agents/business/ASSUMPTIONS.md`             | AS-025         | `springdoc-openapi` sinh spec               |
| `.agents/business/ARCHITECTURE_AND_SHELLS.md` | 53–55          | Stack backend, lý do tách repo, `springdoc` |
| `.agents/PROJECT_STATE.md`                    | 30, 279        | Mô tả backend, bảng quyết định              |
| `.agents/REBUILD_PLAN.md`                     | 14             | "Spring Boot qua `@tronhanh/api`"           |
| `.agents/skills/api-integration/SKILL.md`     | 8              | "viết bằng Java Spring Boot"                |
| `.agents/tasks/INTEGRATE_API_ENDPOINT.md`     | 3              | Cùng câu                                    |
| `docs/DATABASE_DESIGN.md`                     | 3, 94          | Đối tượng đọc; "enum Java tương ứng"        |
| `docs/DEVELOPMENT_SETUP.md`                   | 57             | "repo Java riêng"                           |
| `CLAUDE.md` (gốc)                             | Bối cảnh nhanh | "Java Spring Boot"                          |

**Đã chốt kèm theo (21/09):** repo GitHub đổi tên `tro-nhanh-fe` → **`tro-nhanh`**, backend
NestJS sẽ nằm **trong cùng repo**. Vậy mọi câu "backend là repo riêng" đều sai — thêm vào bảng
trên: `CLAUDE.md` gốc ("Backend là repo riêng"), `ARCHITECTURE_AND_SHELLS` §54 ("**Hai repo**"),
`PROJECT_STATE` dòng 30 ("repo riêng `tro-nhanh-api`"), AS-020 ("repo riêng tách khỏi client").

Điểm cần chốt kèm theo khi đổi stack:

- **Sinh OpenAPI bằng gì** — NestJS dùng `@nestjs/swagger` thay `springdoc`. Luồng
  `pnpm api:gen` phía client không đổi, chỉ đổi nguồn file — giờ còn gọn hơn vì cùng repo,
  không phải copy `openapi.json` qua lại.
- **Vị trí trong monorepo** — `apps/api` là chỗ tự nhiên (cạnh `apps/web`, `apps/mobile`).
  `packages/schemas` (Zod) khi đó dùng chung được cho cả validation phía server — lợi ích thật
  của việc cùng ngôn ngữ, nhưng cần quyết Zod schema hay `class-validator` là nguồn chân lý.
- **Ranh giới import** — ESLint `boundaries` hiện chặn ba feature web với nhau; cần thêm luật
  `apps/api` không import từ `apps/web` và ngược lại, chỉ đi qua `packages/*`.
- `DATABASE_DESIGN` §10 các ràng buộc `EXCLUDE`, trigger, `AT TIME ZONE` vẫn nguyên — chúng là
  Postgres, không phụ thuộc ngôn ngữ backend.

---

## 7. Hoãn có lý do

| Việc                                       | Lý do                                                                                              | Mở lại khi           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------- |
| Upload scan hợp đồng (BR-008), ảnh hóa đơn | Cần private bucket + signed URL ≤ 15 phút                                                          | Backend có storage   |
| Gửi hóa đơn in-app                         | Cần A11 hộp thư + `Notification`                                                                   | A11 xong             |
| B13 route chi tiết hóa đơn                 | Modal đủ dùng, route là tiện ích thêm                                                              | Khi cần chia sẻ link |
| B18 duyệt chỉ số từ người ở (BR-033)       | Cần hàng đợi `UtilityReadingSubmission` + khu C gửi                                                | Khu C                |
| "Tạo tin từ phòng" (BR-027)                | B5 chưa đọc `?roomId=`; chạm hai feature                                                           | Nhánh riêng          |
| A7 đăng nhập / OTP                         | Quyết định chủ dự án: để **cuối cùng**. Mọi chỗ dùng `MOCK_USER_ID` đã ghi `TODO: nối AuthContext` | Cuối rebuild         |
| Tách `apps/workspace` ra subdomain         | Cùng mốc A7 (cookie `.tronhanh.vn`)                                                                | Sau A7               |

---

## 8. Bản đồ màn hình → route → trạng thái

### Marketplace

| Mã        | Màn              | Route                           | Trạng thái                                |
| --------- | ---------------- | ------------------------------- | ----------------------------------------- |
| A1        | Trang chủ        | `/`                             | ✅ PR #7                                  |
| A2        | Tìm phòng        | `/tim-phong`                    | ✅ PR #8 — hợp nhất 2 file prototype      |
| A3        | Chi tiết phòng   | `/phong/{id}`                   | ✅ PR #9 — bản đồ Leaflet, báo cáo BR-032 |
| A4        | Trang khu public | —                               | ⚪                                        |
| A5/A9/A10 | Tin nhu cầu      | `/tin-tim-phong`, `/tin-o-ghep` | ⚪                                        |
| A7        | Đăng nhập/OTP    | —                               | ⏸ Cuối cùng                               |
| A11       | Hộp thư          | `/tin-nhan`                     | ⚪                                        |
| —         | Tin đã lưu       | `/tai-khoan/da-luu`             | ✅ PR #3 — **trang chuẩn vàng**           |
| B4        | Quản lý tin      | `/tai-khoan/tin-cho-thue`       | ✅ PR #11                                 |
| B5        | Đăng tin         | `/dang-tin-cho-thue`            | ✅ PR #13                                 |

### Workspace

| Mã      | Màn                                      | Route                          | Trạng thái                 |
| ------- | ---------------------------------------- | ------------------------------ | -------------------------- |
| B1/B2   | Entry / Onboarding                       | `/chu-tro`, `/chu-tro/bat-dau` | ⚪ Entry có khung          |
| B3      | Dashboard                                | `/chu-tro/tong-quan`           | ⚪ **Kế tiếp**             |
| B6      | Danh sách khu                            | `/chu-tro/khu-tro`             | ✅ PR #14                  |
| B7      | Chi tiết khu                             | `/chu-tro/khu-tro/{id}`        | ✅ PR #16                  |
| B8      | Lưới phòng                               | `/chu-tro/khu-tro/{id}/phong`  | ✅ PR #14, tiện ích PR #22 |
| B9      | Chi tiết phòng                           | `/chu-tro/phong/{id}`          | ✅ PR #23                  |
| B10     | Người ở                                  | `/chu-tro/phong/{id}/nguoi-o`  | ✅ PR #18                  |
| B11     | Hợp đồng                                 | `/chu-tro/hop-dong`            | ✅ PR #19                  |
| B12     | Điện nước & hóa đơn                      | `/chu-tro/hoa-don` (`?phong=`) | ✅ PR #20                  |
| B13     | Chi tiết hóa đơn                         | modal trong B12                | 🔧 Route riêng để sau      |
| B14–B18 | Thuế, gói, đánh giá, sự cố, duyệt chỉ số | —                              | ⚪                         |

### Residency · Admin · Mobile

Chưa dựng màn nào. Khung route `(residency)` và `apps/mobile` đã có.

---

## 9. Cạm bẫy kỹ thuật đã ghi nhận (ảnh hưởng backend nên biết)

- **Kho mock theo tiến trình** — mọi hook Workspace đặt `staleTime: 0`, bỏ khi nối API.
- **`Date.now()` không đủ sinh id** — dùng `crypto.randomUUID()`.
- **Invalidate phải đủ rộng** — thao tác ở một màn làm đổi dữ liệu màn khác (BR-031, khóa chỉ
  số khi tạo hóa đơn). Backend trả về bản ghi mới để client ghi thẳng cache, tránh khoảng một
  giây hai chỗ nói ngược nhau.
- **Một thao tác chạm nhiều bản ghi** (đổi đại diện) → backend trả **cả nhóm**, không trả từng
  bản ghi.
- **Lỗi của thao tác trong modal phải hiện trong modal** — mã lỗi backend cần đủ cụ thể để UI
  dịch ra câu tiếng Việt nói rõ phải làm gì.
