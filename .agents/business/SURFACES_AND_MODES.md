# Surface, Vai trò và Capability

> **Ghi chú về tên file:** tên `SURFACES_AND_MODES.md` là **lịch sử** — giữ nguyên vì
> `packages/access` và nhiều tài liệu khác đang tham chiếu tới. Khái niệm **"Mode" đã bỏ** kể từ
> khi mô hình vai trò chuyển sang *một tài khoản — một vai trò* (xem §1). Đừng tìm "Mode" trong
> code hay tài liệu mới; trong file này "Mode" chỉ xuất hiện để giải thích vì sao nó bị bỏ.

Tài liệu này trả lời **một** câu hỏi mà trước đây bị rải rác khắp UI: *ai vào được bề mặt nào,
được ghi cái gì, và vào bằng lối nào.* Mọi màn hình trong `app/(public)`, `app/(workspace)`,
`app/(residency)` và toàn bộ app mobile đều tuân theo file này.

> Luật ở đây được **thi hành bằng code**, không phải bằng kỷ luật: `packages/access` là bản
> dịch 1-1 của tài liệu này, kèm test chạy được. UI không bao giờ tự suy quyền.

---

## 1. Ba khái niệm phải tách bạch

| Khái niệm | Là gì | Ai quyết | Sống ở đâu |
|---|---|---|---|
| **Surface** | Bề mặt sản phẩm: `marketplace` · `workspace` · `residency` | Kiến trúc — cố định | Route group / app group; trên web, **URL** nói người dùng đang đứng ở đâu |
| **Vai trò** (`role`) | Tài khoản này là ai: `TENANT` · `LANDLORD` · `STAFF` · `ADMIN` — **một giá trị**, cố định theo tài khoản, chỉ đổi một chiều qua "Trở thành chủ trọ" | Server; claims trong JWT | `GET /me` |
| **Capability** | Được phép gì: `subscriptionStatus`, `residencyStatus`, hạn mức gói | **Server**, suy từ dữ liệu | `GET /me` |

### Vai trò cố định, Surface suy từ ba tầng

Đăng nhập là bằng **danh tính** (SĐT + OTP), không chọn vai trò lúc đăng nhập. Vai trò gắn với
tài khoản và không đổi qua lại; thao tác duy nhất đổi vai trò là "Trở thành chủ trọ" (một chiều).

Một tài khoản vẫn có thể vào **nhiều** Surface — nhưng không phải vì có nhiều vai trò, mà vì ba
lối vào thuộc **ba tầng trực giao** (BR-013):

- `marketplace` — tầng **đã đăng nhập** (mọi tài khoản; phần public mở cả cho khách chưa đăng nhập)
- `workspace` — tầng **chủ trọ**: `role = LANDLORD`
- `residency` — tầng **người đang ở**: suy từ **dữ liệu** (`Occupancy` có `userId` = mình), không phụ thuộc vai trò

Vì sao đây là ranh giới quan trọng nhất của tài liệu này:

- Một chủ trọ hoàn toàn có thể đang đi thuê chỗ khác. Người đó là `LANDLORD` với
  `residencyStatus = ACTIVE` — **một** tài khoản, vào được cả ba Surface. Không cần vai trò
  "Resident", không cần tài khoản thứ hai.
- Quyết định đã chốt: **không có role `Resident`**; "người đang ở" là bản ghi dữ liệu. Làm thành
  vai trò sẽ kéo theo câu hỏi "hết hợp đồng có gỡ vai trò không" và phá BR-022 (quyền đánh giá
  khu từng ở).
- **Không có "Mode" lưu ở client.** Trước đây (khi vai trò cộng dồn) người dùng phải chọn "tôi
  đang là chủ trọ / người ở" và client nhớ lựa chọn đó. Nay vai trò cố định, còn Surface đang
  đứng chính là URL — lưu thêm một trạng thái chỉ đẻ ra bài toán "mode cũ không còn vào được".

Hệ quả thực hành: **không màn hình nào hỏi "bạn là ai?"** ngoài đúng một chỗ là màn "Trở thành
chủ trọ"; mọi màn khác chỉ hỏi "bạn muốn vào đâu?", và câu trả lời bị giới hạn bởi vai trò và
Capability do server trả về.

---

## 2. Ba Surface sở hữu gì

| Surface | Màn hình | Dữ liệu lõi | Shell |
|---|---|---|---|
| **Marketplace** | A1–A14, **B4, B5** | `RentalListing`, `RoomWantedPost`, `RoommateWantedPost`, `Favorite`, `Conversation` | `PublicNavbar` + `AccountShell` |
| **Workspace** | B1–B3, **B6–B18** | `Property`, `Room`, `Occupancy`, `Contract`, `Invoice`, `UtilityReading`, `Incident`, `UtilityReadingSubmission` | `WorkspaceShell` |
| **Residency** | C1, C3–C10 | Bản đọc của dữ liệu Workspace, giới hạn theo `Occupancy` có `userId` = người gọi | `ResidencyShell` |

Khu `/admin/*` (10.D) là **khu nội bộ** cho `STAFF`/`ADMIN`, nằm ngoài ba Surface sản phẩm và
ngoài phạm vi file này — xem `SCREENS_ADMIN.md`.

### B4/B5 thuộc Marketplace — quyết định đã chốt

`SCREENS_WORKSPACE.md` từng liệt kê B4 (quản lý tin) và B5 (đăng tin) *bên trong* bảng
Workspace shell dưới nhãn "zone Tin đăng miễn phí". Điều đó khiến hai màn bị **hai shell cùng
nhận**, và là nguồn rối trực tiếp cho cả web lẫn mobile.

Chốt: **B4/B5 thuộc Surface Marketplace.** Căn cứ:

- Dữ liệu là `RentalListing` — thuộc bounded context Marketplace, không phải Property
  Management.
- Route đã là `/tai-khoan/tin-cho-thue` và `/dang-tin-cho-thue`, **không** có tiền tố
  `/chu-tro`.
- Đăng tin **miễn phí và không chịu gating** (BR-015) — chỉ cần `role = LANDLORD`, không cần
  gói. Đặt nó trong shell mà cả shell nằm sau cổng gating là mâu thuẫn tự thân.
- Khi Workspace tách sang subdomain riêng (mục 5), một màn thuộc hai shell sẽ thành lỗi thật
  chứ không còn là chuyện thẩm mỹ.

Shell Workspace **được phép link sang** B4/B5, nhưng phải là link **cross-surface có nhãn rõ**,
không phải một mục lẫn trong sidebar như thể nó là màn SaaS.

### Luật crossing giữa Surface

> Hai Surface chỉ gặp nhau qua **URL / deeplink**. Không bao giờ qua `import`.

- ESLint đã chặn `features/marketplace ↔ workspace ↔ residency` ở mức `error`.
- Cần dữ liệu của Surface khác → gọi API của Surface đó qua service của **chính mình**, hoặc
  điều hướng bằng URL.
- Ngoại lệ duy nhất được phép chia sẻ: `packages/access`, `packages/types`,
  `packages/schemas`, `packages/constants`, `packages/utils`, `components/ui`.

---

## 3. Bảng quyết định — vào được đâu

Đầu vào là `SessionContext` từ `GET /me`. `packages/access` encode đúng bảng này.

### 3.1 Vào được Surface nào (`canEnterSurface`)

| Surface | Điều kiện vào | Không đạt thì |
|---|---|---|
| `marketplace` | Luôn luôn — kể cả khách chưa đăng nhập | — |
| `workspace` | Đã đăng nhập **và** `role = LANDLORD` | Chưa đăng nhập → `/dang-nhap?next=…`; `TENANT` → màn **"Trở thành chủ trọ"** (giữ `?next=`); `STAFF`/`ADMIN` → `/admin` |
| `residency` | Đã đăng nhập **và** `residencyStatus ≠ NONE` | → màn hướng dẫn C0 "chủ trọ cần thêm bạn vào phòng bằng đúng số điện thoại này" |

Vào được `workspace` **không** đồng nghĩa dùng được zone SaaS — xem 3.2. Nâng cấp vai trò là
**thao tác rõ ràng** ("Trở thành chủ trọ"), không kích hoạt ngầm khi mở `/chu-tro` hay khi lưu
tin đầu tiên; sau khi nâng cấp, client gọi `POST /auth/refresh` rồi mới điều hướng tiếp.

Điều kiện `role = LANDLORD` cũng áp cho B4/B5 dù hai màn này thuộc Marketplace.

### 3.2 Zone SaaS trong Workspace (`subscriptionStatus`)

| `subscriptionStatus` | Đọc màn SaaS | Ghi | Hành vi UI |
|---|---|---|---|
| `NONE` | ✗ | ✗ | Chuyển về B1, hiện hai lối: "Đăng tin (miễn phí)" và "Dùng thử bộ quản lý" |
| `TRIAL` | ✓ | ✓ (trong hạn mức plan Trial) | Banner còn N ngày dùng thử |
| `ACTIVE` | ✓ | ✓ (trong hạn mức gói) | Không banner |
| `READ_ONLY` | ✓ | ✗ | Banner đỏ; mọi nút ghi bị khóa kèm lý do; **dữ liệu giữ nguyên** (BR-015) |

Hai màn **luôn đọc được** kể cả `READ_ONLY`: **B15** (gói dịch vụ — phải vào được thì mới gia
hạn nổi) và **B16** (đánh giá khu).

### 3.3 Residency (`residencyStatus`)

| `residencyStatus` | Vào Residency | Ghi chú |
|---|---|---|
| `NONE` | ✗ | Màn hướng dẫn "bạn chưa được liên kết vào phòng nào" |
| `ACTIVE` | ✓ | Đầy đủ. Liên kết có hiệu lực **ngay** khi chủ trọ gắn (BR-029) — không có trạng thái chờ xác nhận; nút "Không phải tôi" để tự gỡ nếu bị thêm nhầm |
| `PAST` | Chỉ đọc | Xem lịch sử; **vẫn viết được đánh giá** khu từng ở (BR-022) |

**Khi gói của chủ trọ hết hạn** (`subscriptionStatus = READ_ONLY` phía chủ trọ): người ở
**vẫn xem** hợp đồng và hóa đơn đã phát hành, nhưng **không tạo mới** báo cáo sự cố hay gửi chỉ
số (BR-034). `packages/access` phải trả mức `read` cho hai hành động ghi này.

### 3.4 Hạn mức gói (`isWithinLimit`)

Chạm `maxProperties` / `maxRooms` → **chặn tạo mới**, gợi ý gói lớn hơn. Over-limit (gia hạn
xuống gói nhỏ hơn dữ liệu hiện có) → **giữ nguyên dữ liệu**, chỉ chặn tạo mới cho tới khi về
dưới hạn mức. Nhất quán tinh thần "không bao giờ xóa dữ liệu chủ trọ" của BR-015.

### 3.5 Điều hướng mặc định sau đăng nhập (`resolveDefaultSurface`)

Chỉ áp dụng khi **không có `?next=`/`?redirect=`** — có thì luôn quay về đúng chỗ đó. Thứ tự:

1. `role ∈ {STAFF, ADMIN}` → `/admin`
2. `role = LANDLORD` **và** `subscriptionStatus ∈ {TRIAL, ACTIVE, READ_ONLY}` → `workspace`
   (`/chu-tro/tong-quan`)
3. còn lại → `marketplace` (`/`)

Đây là quy tắc **thuần túy suy từ vai trò + Capability**, không có trạng thái "mode đã chọn"
nào ở client ghi đè. Residency không đứng trong thứ tự này: không còn việc "chờ xác nhận liên
kết" cần làm ngay, còn hóa đơn tới hạn đã có Notification dẫn thẳng vào `/nguoi-o/hoa-don`.
Nhớ Surface vào lần cuối là tiện ích UX tùy chọn, không phải luật, và không được ghi đè bảng
3.1–3.3.

---

## 4. Lối vào và lối ra của mỗi Surface

| Từ → Đến | Lối |
|---|---|
| Marketplace → Workspace | Menu tài khoản → "Quản lý khu trọ" (chỉ hiện khi `role = LANDLORD`); `TENANT` thấy "Trở thành chủ trọ" ở đúng vị trí đó |
| Marketplace → Residency | Menu tài khoản → "Phòng của tôi" (chỉ hiện khi `residencyStatus ≠ NONE`); hoặc Notification `OccupancyLinked` |
| Workspace → Marketplace | Sidebar, mục cuối: "← Về Trọ Nhanh" và "Tin đăng của tôi" (**cross-surface, có nhãn**) |
| Residency → Marketplace | Tab cuối cùng ở bottom bar (web). App mobile không có Marketplace — không có lối này |
| Bất kỳ → `/dang-nhap` | Guard, kèm `?next=` để quay lại đúng chỗ |

**Không** có lối tắt ngầm giữa Workspace và Residency. Chủ trọ muốn xem góc nhìn người ở phải
đi vòng qua Marketplace — hai Surface này có mô hình dữ liệu đối xứng nhau và trộn lối đi sẽ
sinh nhầm lẫn quyền.

---

## 5. Web — chiến lược URL và mốc tách subdomain

**Hiện tại:** một app Next.js, ba route group sản phẩm (+ khu nội bộ).

```
tronhanh.vn/            (public)     → Marketplace
tronhanh.vn/chu-tro/*   (workspace)  → Workspace
tronhanh.vn/nguoi-o/*   (residency)  → Residency
tronhanh.vn/admin/*     (admin)      → khu nội bộ STAFF/ADMIN — ngoài phạm vi file này
```

**Đích:** Workspace tách thành `apps/workspace` deploy ở `quanly.tronhanh.vn`. Lý do: hai bề
mặt có chiến lược render ngược nhau — Marketplace cần SSR/ISR cho Google index, Workspace phải
`noindex` và động 100%; ép chung một `next.config`, một middleware, một chiến lược cache là kéo
nhau xuống. Thêm nữa, hai app khác nhau khiến luật cấm import chéo được **compiler** thi hành.

**Mốc tách: cùng nhánh với A7 (đăng nhập/OTP).** Nội dung kỹ thuật thật của việc tách gần như
toàn bộ là **session dùng chung giữa các subdomain** (cookie scope `.tronhanh.vn`, refresh
token, CSRF). Tách trước khi có A7 nghĩa là thiết kế SSO trong mù rồi làm lại.

Điều kiện để lúc đó việc tách chỉ là **di chuyển file**, không phải refactor:

- [x] `packages/access` giữ toàn bộ luật truy cập, không phụ thuộc framework
- [x] ESLint chặn import chéo giữa ba feature domain ở mức `error`
- [x] `(workspace)` có root layout + provider riêng, không dùng ké của `(public)`
- [x] `(workspace)` khai báo `robots: noindex`
- [ ] A7 xong → cookie `.tronhanh.vn`, rồi mới lift `apps/workspace`

---

## 6. Mobile — một app, một Surface (Residency)

**Một app Expo, dành riêng cho người ở.** Đặc tả (1.6, 10.C) chốt: app mobile phục vụ khu người
ở và dùng chung API với Residency shell; **chủ trọ dùng web** — Workspace là dashboard nhiều
bảng biểu, hợp màn hình lớn. Vì vậy trên mobile chỉ có **một** Surface: không có màn chọn
"chế độ", không có mirror của Workspace.

```
apps/mobile/src/app/
├── (auth)/         đăng nhập SĐT + OTP — KHÔNG hỏi vai trò ở màn này
└── (residency)/    C1, C3–C10 — tab: Phòng của tôi · Hóa đơn · Sự cố · Thông báo · Tài khoản
```

- Root layout gọi đúng `packages/access` như web — luật viết một lần, dùng hai nơi. Sau đăng
  nhập: `residencyStatus = NONE` → màn hướng dẫn C0 (không đăng xuất, không chặn — chờ chủ trọ
  liên kết; nhận Notification `OccupancyLinked` thì vào thẳng); `ACTIVE`/`PAST` → tab.
- Vai trò không quan trọng ở đây: `TENANT` hay `LANDLORD` đều vào được, miễn có `Occupancy`
  đã liên kết — đúng tinh thần tầng "người đang ở" suy từ dữ liệu.
- Bổ sung so với web: chụp ảnh trực tiếp từ camera cho sự cố và chỉ số đồng hồ; push
  notification qua `DeviceToken`.
- Deeplink mang theo Surface: `tronhanh://residency/hoa-don/{id}` — mở app, kiểm Capability,
  rồi mới điều hướng.

**Mục tương lai:** nếu sau này có **ứng dụng di động cho chủ trọ**, phải xem lại toàn bộ mục
này — khi đó một tài khoản `LANDLORD` đang đi thuê nơi khác sẽ lại có hai Surface trên cùng
một thiết bị, và câu hỏi "vào đâu sau đăng nhập" quay trở lại (giải bằng bảng 3.5, **không**
bằng "mode" lưu ở client).

---

## 7. Hợp đồng với backend

Một endpoint duy nhất, gọi một lần khi khởi động app và sau mỗi mutation đổi quyền
(nâng cấp "Trở thành chủ trọ", mua gói, kích hoạt trial, được liên kết vào phòng):

```
GET /me
```

```jsonc
{
  "userId": "…",
  "role": "LANDLORD",
  "subscriptionStatus": "TRIAL",
  "residencyStatus": "NONE",
  "limits": { "maxProperties": 3, "maxRooms": 20 },
  "trialEndsAt": "2026-09-16T00:00:00.000Z",
  "subscriptionExpiresAt": null
}
```

Vì sao gộp một endpoint thay vì client tự ghép từ nhiều nguồn: `subscriptionStatus` là **giá trị
suy ra** từ `UserSubscription` (hết hạn → `READ_ONLY`), `residencyStatus` suy từ `Occupancy`.
Để client tự suy nghĩa là luật gating tồn tại hai bản, và bản ở client thì người dùng sửa được.

> **Guard ở client chỉ là UX.** Biên bảo mật thật nằm ở backend: mọi endpoint ghi của module
> SaaS phải tự kiểm `subscriptionStatus` và trả `WORKSPACE_READ_ONLY`; mọi endpoint Residency
> phải tự kiểm liên kết và trả `RESIDENCY_NOT_LINKED`, kể cả khi UI đã khóa nút.

---

## 8. Áp dụng khi viết code

- Không component nào được viết `status === 'READ_ONLY'` hay `role === 'LANDLORD'`. Dùng
  `canWrite()`, `canEnterSurface()` từ `packages/access`.
- Thêm một luật truy cập mới → sửa **tài liệu này** trước, rồi `packages/access` + test, rồi
  mới tới UI.
- Thêm màn hình mới → ghi rõ nó thuộc Surface nào ngay trong PR; màn không thuộc Surface nào là
  dấu hiệu thiết kế sai.
- **Trạng thái đồng bộ:** tính đến đợt cập nhật tài liệu này, `packages/access` vẫn đang ở mô
  hình cũ (`roles[]`, `workspaceStatus`, `residencyStatus = PENDING`, mức `limited`,
  `GET /me/context`). Đồng bộ code là một task riêng — cho tới lúc đó, **tài liệu này thắng**.
