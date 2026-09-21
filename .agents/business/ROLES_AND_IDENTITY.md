# Mô hình định danh và vai trò

Bốn vai trò, mỗi tài khoản đúng một vai trò; quyền chia bốn tầng không chồng lấn; ba tầng
thông tin client cần để dựng navigation, guard và điều hướng sau đăng nhập.

---

## Mô hình vai trò: một tài khoản — một vai trò, không kế thừa

**Nguyên tắc lõi:** hệ thống có **bốn vai trò**, mỗi tài khoản mang **đúng một** vai trò
(`User.roleId` n-1 `Role`, `Role.code` unique). Không có chuyện một tài khoản vừa là người này
vừa là người kia, và **không vai trò nào kế thừa vai trò nào**.

| Vai trò | Là ai | Cách có được |
|---|---|---|
| `TENANT` | Người tìm phòng và người đang thuê | Mặc định — mọi tài khoản sau khi đăng ký |
| `LANDLORD` | Chủ trọ, người cho thuê phòng (chủ BĐS hoặc người được ủy quyền; nền tảng không môi giới) | Nâng cấp từ `TENANT` qua "Trở thành chủ trọ" |
| `STAFF` | Nhân viên vận hành nền tảng | Tài khoản nội bộ |
| `ADMIN` | Quản trị hệ thống | Tài khoản nội bộ |

**Khách chưa đăng nhập** không phải vai trò — là trạng thái chưa có phiên làm việc.

### Quyền chia bốn tầng, không tầng nào chồng lấn

Thay vì để vai trò này kế thừa vai trò kia, các quyền mà nhiều bên cùng cần được **đẩy xuống
tầng "đã đăng nhập"**:

| Tầng | Điều kiện | Gồm những gì |
|---|---|---|
| **Đã đăng nhập** | Bất kỳ vai trò nào¹ | Xem tin, tìm kiếm, lưu tin, nhắn tin, báo cáo vi phạm, đăng tin tìm phòng và tin ở ghép |
| **Chủ trọ** | `role = LANDLORD` | Đăng tin cho thuê, đẩy tin nổi bật (miễn phí); quản lý khu trọ, phòng, người ở, hợp đồng, hóa đơn (theo gói — `ACCESS_GATING.md`) |
| **Người đang ở** | **Suy từ dữ liệu** — có bản ghi `Occupancy` đã liên kết (`userId` = mình), không phụ thuộc vai trò | Xem phòng đang thuê, hợp đồng và hóa đơn của mình, báo sự cố, gửi chỉ số, viết đánh giá khu |
| **Nội bộ** | `role ∈ {STAFF, ADMIN}` | Kiểm duyệt tin, xử lý báo cáo; `ADMIN` thêm quyền quản lý tài khoản, danh mục, gói dịch vụ |

¹ Trên thực tế `STAFF`/`ADMIN` là tài khoản nội bộ, không dùng cho hoạt động chợ tin đăng —
ma trận RBAC (`ACTORS_AND_RBAC.md`) để `–` cho các quyền này (separation of duties).

> **Lý do không kế thừa (BR-013):** chủ trọ vẫn lưu tin và nhắn tin được vì đó là quyền của
> tầng "đã đăng nhập", không phải quyền riêng của người thuê. Một chủ trọ đang đi thuê nhà nơi
> khác vẫn xem được phòng mình thuê, vì quyền đó suy từ dữ liệu người ở chứ không từ vai trò.
> Nhờ vậy backend không cần bất kỳ cơ chế kế thừa nào, và mỗi người chỉ cần **một** tài khoản.

### Vòng đời vai trò

| Bước | Sự kiện | `role` sau sự kiện | Ghi chú |
|---|---|---|---|
| 1 | Đăng ký (SĐT + OTP) | `TENANT` | Mặc định mọi tài khoản |
| 2 | Đăng tin tìm phòng / ở ghép, lưu tin, nhắn tin | `TENANT` — không đổi | Quyền tầng "đã đăng nhập" |
| 3 | Bấm **"Trở thành chủ trọ"** | `LANDLORD` | **Một chiều, không quay lại** — quay lại sẽ khiến khu trọ và hợp đồng đang quản lý bơ vơ. Người nâng cấp **không mất gì**: tin đã lưu, tin nhu cầu đã đăng, phòng đang thuê vẫn truy cập được (chúng thuộc tầng "đã đăng nhập" và tầng dữ liệu) |
| 4 | Bấm "Dùng thử" / mua gói | Không đổi; đổi `subscriptionStatus` | Gating là tầng riêng, không phải vai trò |
| 5 | (Hiếm) Admin điều chỉnh vai trò (Module 13) | Theo thao tác Admin | Đường phụ; đường chính là bước 3 |

**Không có kích hoạt ngầm.** Chỉ `LANDLORD` mới tạo được `RentalListing`. `TENANT` bấm "Đăng
tin cho thuê" hoặc mở `/chu-tro` → được mời "Trở thành chủ trọ" trước (giữ `?redirect=` để
quay lại đúng chỗ sau khi nâng cấp), không tự gán vai trò trong lúc lưu tin.

**Cấp lại phiên sau khi nâng cấp:** phiên cũ vẫn mang `role = TENANT` trong claims. Sau khi
"Trở thành chủ trọ" thành công, **frontend gọi ngay `POST /auth/refresh`** để nhận access token
mới có `role = LANDLORD`, rồi mới điều hướng. (Trade-off đã cân: BE trả token trong response
nghiệp vụ = trộn concern; middleware query role mỗi request = phá stateless.)

---

## Hệ thống "biết vai trò" qua ba tầng thông tin độc lập

| Tầng | Lưu ở đâu | Trả lời | Giá trị |
|---|---|---|---|
| **Trạng thái tài khoản** `User.status` | DB | "Có dùng được hệ thống không?" | `PendingVerification` / `Active` / `Locked` |
| **Vai trò** `role` | Claims trong JWT — **một giá trị** | "Được vào shell/nhóm endpoint nào?" | `TENANT` / `LANDLORD` / `STAFF` / `ADMIN` |
| **Trạng thái năng lực** | Suy từ DB | "Trong shell đó làm được gì?" | `subscriptionStatus`: NONE/TRIAL/ACTIVE/READ_ONLY · `residencyStatus`: NONE/ACTIVE/PAST |

Chi tiết trạng thái tài khoản: `PendingVerification` (đã đăng ký, chưa xác thực OTP — chưa làm được gì ngoài xác thực lại); `Active` (bình thường); `Locked` (Admin khóa — không đăng nhập được, tin đăng tự ẩn theo BR-028, dữ liệu SaaS giữ nguyên). Thông tin đăng nhập nằm ở bảng `AuthMethod` tách khỏi `User` (BR-016) — hiện mỗi tài khoản một dòng kiểu mật khẩu.

Chi tiết `residencyStatus` (suy từ `Occupancy` có `userId` = chính user, cùng `Contract`): `NONE` chưa được liên kết vào phòng nào; `ACTIVE` đang ở — liên kết có hiệu lực **ngay** khi chủ trọ gắn (BR-029), không có bước chờ xác nhận, người được gắn nhận thông báo và có nút "Không phải tôi" để tự gỡ; `PAST` đã rời đi — vẫn xem được lịch sử và vẫn viết được đánh giá khu đã ở.

> **Không nhét `subscriptionStatus`/`residencyStatus` vào JWT:** trạng thái đổi theo thời gian trong khi claims "đóng băng" đến khi token hết hạn — nhét vào sẽ có 15–30 phút hệ thống mở/khóa sai. Gating là quyết định tiền bạc, phải luôn tươi. `role` gần như bất biến (chỉ đổi qua "Trở thành chủ trọ", và lúc đó cấp lại phiên) → để trong token cho stateless.

### Ba thứ hay bị nhầm là vai trò nhưng không phải

- **Gói dịch vụ không phải vai trò.** Chủ trọ mua gói hay chưa thì vẫn là `LANDLORD`; chỉ khác phạm vi chức năng mở ra (`subscriptionStatus` — `ACCESS_GATING.md`).
- **"Người đang ở" không phải vai trò.** Đó là bản ghi `Occupancy` đã liên kết. Làm thành vai trò sẽ đẻ ra câu hỏi "hết hợp đồng có gỡ vai trò không, gỡ rồi còn xem lịch sử và viết đánh giá được không"; dùng trạng thái thì tự chuyển `PAST` một cách tự nhiên.
- **Quyền sở hữu dữ liệu không phải vai trò.** Hai chủ trọ cùng là `LANDLORD` nhưng mỗi người chỉ đụng được khu của mình (`landlordId`, BR-007). Đây là kiểm tra ở tầng dữ liệu, tách hẳn khỏi tầng vai trò — trộn hai tầng là nguồn gốc của mọi mô hình phân quyền rối rắm.

Ba tầng thông tin **trực giao** nhau — một chủ trọ đang đi thuê nhà nơi khác có thể đồng thời `role=LANDLORD`, `subscriptionStatus=ACTIVE`, `residencyStatus=ACTIVE` và vào được cả ba shell, mà vẫn chỉ có **một** tài khoản, **một** vai trò.

**`GET /me` là nguồn chân lý phía client:** trả `{ user, profile, role, subscriptionStatus, residencyStatus, limits }`; frontend (web và app mobile) gọi sau đăng nhập/refresh và sau mỗi mutation đổi quyền (nâng cấp vai trò, mua gói, được liên kết vào phòng) để render navigation (hiện "Quản lý khu trọ" hay "Trở thành chủ trọ", zone SaaS khóa/mở, có hiện "Phòng của tôi" không). Không suy diễn từ localStorage.

---

## Route guard (frontend — chỉ là UX, backend luôn kiểm tra lại)

1. Mọi route cần đăng nhập, chưa đăng nhập → `/dang-nhap?redirect=…`.
2. Route cần vai trò chủ trọ — `/chu-tro/*`, `/dang-tin-cho-thue`, `/tai-khoan/tin-cho-thue` (B4/B5):
   - `role = TENANT` → màn **"Trở thành chủ trọ"** (giữ `?redirect=`; nâng cấp xong → refresh phiên → quay lại đúng route).
   - `role ∈ {STAFF, ADMIN}` → không có lối vào; đưa về `/admin`.
3. Route con zone SaaS (`/chu-tro/*` trừ B1) → đọc `subscriptionStatus`: `NONE` → B1; `READ_ONLY` → chế độ chỉ đọc. Backend trả 403 mã `WORKSPACE_READ_ONLY` khi ghi bị chặn; FE bắt mã này hiện modal mời gia hạn **không mất dữ liệu form đang nhập**.
4. `/nguoi-o/*` (và app mobile) → đọc `residencyStatus`: `NONE` → màn hình trống hướng dẫn "chủ trọ cần thêm bạn vào phòng bằng đúng số điện thoại này"; `ACTIVE`/`PAST` → vào bình thường (`PAST` chỉ xem lịch sử). Backend trả `RESIDENCY_NOT_LINKED` cho tài khoản chưa liên kết.
5. `/admin/*` → `role ∈ {STAFF, ADMIN}`; phần quản lý tài khoản/danh mục/gói chỉ `ADMIN`.

**Quy ước redirect toàn hệ thống:** mọi tình huống Guest bị yêu cầu đăng nhập (nhắn tin, lưu tin, xem SĐT, báo cáo tin, đăng tin) đều mang `?redirect=` — đăng nhập/đăng ký xong quay về đúng ngữ cảnh (mở lại modal liên hệ, giữ form đang nhập). Áp dụng tương tự cho màn "Trở thành chủ trọ".

---
