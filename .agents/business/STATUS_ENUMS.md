# Bảng enum trạng thái

Toàn bộ giá trị trạng thái của hệ thống, gom một chỗ để tra nhanh khi render badge, dựng bộ
lọc hoặc viết điều kiện hiển thị. Giá trị phải khớp đúng chuỗi backend trả về — không tự
dịch, không tự thêm giá trị mới.

---

## Marketplace

**`RentalListing.status`** — vòng đời tin cho thuê (BR-001)

| Giá trị | Ý nghĩa | Gợi ý màu badge |
|---|---|---|
| `Draft` | Nháp, chưa gửi duyệt | `ink-muted` |
| `PendingApproval` | Đang chờ kiểm duyệt | `warning` |
| `Active` | Đang hiển thị công khai | `status-available` |
| `Rejected` | Bị từ chối, có `rejectReason` | `error` |
| `Expired` | Hết hạn hiển thị (60 ngày — BR-026) | `ink-muted` |
| `Rented` | Đã cho thuê xong | `status-rented` |
| `Hidden` | Người đăng tự ẩn | `ink-muted` |

Tin nhu cầu thuê (`RoomWantedPost`, `RoommateWantedPost`) dùng chung tập giá trị này.

Đẩy tin **không có enum trạng thái riêng**: tin đang được đẩy ⇔ `boostExpireAt > now` — suy ra từ cột này, không lưu cờ.

**`Conversation.status`**: `Active` · `Archived` · `Blocked`.

**`Review.status`** (BR-023)

| Giá trị | Ý nghĩa |
|---|---|
| `Visible` | Đang hiển thị |
| `Reported` | Bị báo cáo, chờ kiểm duyệt |
| `Hidden` | Đã ẩn bởi Staff |

**`Report.status`**: `Pending` · `Resolved` · `Dismissed`.

---

## Property Management (SaaS)

**`Room.status`** — trạng thái phòng (BR-002, BR-031)

| Giá trị | Ý nghĩa | Gợi ý màu badge |
|---|---|---|
| `Available` | Còn trống | `status-available` |
| `Deposited` | Đã nhận cọc | `status-deposited` |
| `Rented` | Đang cho thuê | `status-rented` |
| `Hidden` | Tạm ẩn khỏi quản lý | `ink-muted` |

**`Contract.status`** (BR-006)

| Giá trị | Ý nghĩa |
|---|---|
| `Draft` | Đang soạn |
| `Active` | Đang hiệu lực |
| `Expired` | Hết hạn tự nhiên |
| `Terminated` | Chấm dứt sớm, có `terminateReason` |

**`Invoice.status`** — suy tự động từ tổng `Payment` (BR-004)

| Giá trị | Ý nghĩa | Gợi ý màu badge |
|---|---|---|
| `Unpaid` | Chưa thu đồng nào | `ink-muted` |
| `PartiallyPaid` | Đã thu một phần | `warning` |
| `Paid` | Đã thu đủ | `success` |
| `Overdue` | Quá `dueDate` mà chưa đủ | `error` |

Client **không tự tính** trạng thái này; luôn dùng giá trị backend trả về.

**`Property.waterPricingMethod`** — cách tính tiền nước của khu (BR-042)

| Giá trị | Ý nghĩa | Có nhập chỉ số nước? |
|---|---|---|
| `PerCubicMeter` | Theo khối: (chỉ số mới − chỉ số cũ) × đơn giá | Có |
| `PerPerson` | Theo đầu người: số người trong phòng × đơn giá mỗi người | Không |
| `FlatRate` | Khoán cố định mỗi tháng | Không |

Cài ở **cấp khu**, áp dụng cho mọi phòng trong khu. Bản ghi chỉ số giữ bản sao ở
`UtilityReading.pricingMethod` — **đổi cách tính của khu không làm đổi hóa đơn các kỳ trước**.

**`UtilityReadingSubmission.status`** (BR-033): `Pending` · `Approved` · `Rejected`.

**`Incident.status`** — vòng đời sự cố (BR-035)

| Giá trị | Ai chuyển được |
|---|---|
| `Open` | Người ở tạo |
| `Acknowledged` | Landlord sở hữu khu |
| `InProgress` | Landlord sở hữu khu |
| `Resolved` | Landlord sở hữu khu |
| `Closed` | Người ở xác nhận (hoặc mở lại về `InProgress`) |

**`Incident.priority`**: `Low` · `Normal` · `High` · `Urgent`.

---

## Định danh và quyền truy cập

**`User.status`** — trạng thái tài khoản

| Giá trị | Hệ quả |
|---|---|
| `PendingVerification` | Chưa xác thực OTP, chưa dùng được gì |
| `Active` | Bình thường |
| `Locked` | Không đăng nhập được; tin đăng tự ẩn (BR-028) |

**`role`** trong JWT — **một giá trị duy nhất** (BR-013, mục 1.8): `TENANT` · `LANDLORD` · `STAFF` · `ADMIN`. `TENANT` đổi thành `LANDLORD` qua "Trở thành chủ trọ" (`POST /me/become-landlord`, một chiều).

**`subscriptionStatus`** — quyền trong Workspace SaaS (BR-013, BR-015)

| Giá trị | Quyền |
|---|---|
| `NONE` | Chưa mở Workspace, chỉ thấy màn mời dùng thử |
| `TRIAL` | Dùng thử có thời hạn, giới hạn nhẹ |
| `ACTIVE` | Đầy đủ theo hạn mức gói |
| `READ_ONLY` | Chỉ đọc; thao tác ghi trả lỗi `WORKSPACE_READ_ONLY` |

**`residencyStatus`** — quan hệ ở trọ (BR-029, BR-034)

| Giá trị | Quyền vào Residency shell |
|---|---|
| `NONE` | Không vào được, hiện màn hướng dẫn "chủ trọ cần thêm bạn vào phòng" |
| `ACTIVE` | Đầy đủ |
| `PAST` | Chỉ đọc lịch sử, vẫn viết được đánh giá |

Không có giá trị chờ: liên kết người ở **có hiệu lực ngay** khi chủ trọ gắn (BR-029) — `Occupancy` chỉ có `userId` null hay không null, không có trạng thái liên kết riêng. Người được gắn nhầm tự gỡ bằng nút "Không phải tôi".

**`UserSubscription.status`**: `Trial` · `Active` · `Expired` · `Cancelled`.

**`PlatformTransaction.status`**: `Pending` · `Success` · `Failed`.

---

## Enum dữ liệu khác

- **`RentalListing.typeId` / `RoomWantedPost.typeId`**: khóa ngoại tới danh mục `ListingType`
  (`code` unique) do quản trị viên quản lý — **không phải enum cố định trong code**; giá trị
  tra từ API danh mục, không hard-code `BoardingRoom/ServicedApartment/Apartment`.
- **`AuthMethod.provider`**: `Password` — hiện chỉ dùng giá trị này (BR-016); đăng nhập bên
  thứ ba là dự phòng, chưa hỗ trợ.
- **`Amenity.type`**: `Room` · `Surrounding`.
- **`Notification.type`**: `ListingApproved` · `Rejected` · `NewMessage` · `ContractExpiring` ·
  `InvoiceDue` · `InvoiceOverdue` · `InvoiceReceived` · `SubscriptionRenewal` · `TrialEnding` ·
  `ReviewModerated` · `OccupancyLinked` · `ListingAutoRented` · `FavoriteChanged` · `System`.
- **`accessPolicy`** (giờ giấc ra vào — BR-025): `Free` · `Restricted`.
- **`InvoiceItem.type`**: `Rent` · `Electricity` · `Water` · `Service` · `Deposit` · `Other`.
- **`UtilityReading.type`**: `Electricity` · `Water`.
- **`ListingCost.waterPricingMethod`** và **`UtilityReading.pricingMethod`**: dùng chung tập giá
  trị của `Property.waterPricingMethod` (`PerCubicMeter` · `PerPerson` · `FlatRate` — BR-042).
  Trên tin đăng là để hiển thị đúng đơn vị giá; trên bản ghi chỉ số là bản sao chốt cứng lúc ghi.
- **`Payment.method`**: `Cash` · `BankTransfer`.
- **`PlatformTransaction.type`**: `Boost` · `Subscription`.
- **`Report.targetType`**: `RentalListing` · `RoomWantedPost` · `RoommateWantedPost` ·
  `Conversation` · `Message` · `Review`.
- **`Media.ownerType`**: `RentalListing` · `RoommateWantedPost` · `Contract` · `Profile` ·
  `Invoice` · `Incident` · `UtilityReadingSubmission`.
