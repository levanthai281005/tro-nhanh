# Trạng thái dự án

**File sống — cập nhật sau mỗi nhánh hoàn thành.** Agent đọc file này đầu tiên để biết đang
ở đâu, tránh làm lại việc đã xong hoặc làm nhầm thứ tự.

Cập nhật lần cuối: **đồng bộ đặc tả v3.6** (23/09/2026 — BR-042/043, bốn khoảng trống dữ liệu đã
chốt; **bộ tài liệu đóng băng sau đợt này**, xem mục "Đã xong"). Trước đó: **đồng bộ đặc tả v3.5**
(BR-039/040/041 và BR-024), **B9 chi tiết phòng**, **tiện ích cho phòng** (PR #22),
**B12 điện nước & hóa đơn** (PR #20), **B11 hợp đồng** (PR #19).

> **Tài liệu đã đóng băng.** Việc tiếp theo là **viết code**, không sửa tài liệu nữa — trừ khi
> dựng thật rồi phát hiện tài liệu sai. Phát hiện sai thì sửa kèm lý do, không sửa vì "đọc thấy
> nên viết khác".

**Bắt đầu phiên mới:** đọc mục "Đang làm" bên dưới. Khu Workspace đã có 7 route chạy được:
`/chu-tro/khu-tro` (B6) · `/chu-tro/khu-tro/{id}` (B7) · `/chu-tro/khu-tro/{id}/phong` (B8) ·
`/chu-tro/phong/{id}` (B9) · `/chu-tro/phong/{id}/nguoi-o` (B10) · `/chu-tro/hop-dong` (B11) ·
`/chu-tro/hoa-don` (B12).
Mục nav chưa dựng thì hiện nhãn "sắp có" chứ không dẫn tới 404 — dựng xong màn nào thì bật cờ
`isReady` của màn đó trong `WorkspaceShell.tsx`.

**Ba file phải đọc trước khi làm màn Workspace tiếp theo:** `business/SURFACES_AND_MODES.md`
(gating và ranh giới Surface), `business/BUSINESS_RULES.md` (mã BR liên quan), và mục
"Cạm bẫy đã gặp" cuối file này — phần lớn là lỗi chỉ lộ ra khi bấm thật trên trình duyệt.

---

## Bố cục thư mục trên máy

```text
rebuild_tronhanh-fe/
├── tro-nhanh/        ← repo này (monorepo web + mobile + api)
└── prototype/        ← bản demo cũ, CHỈ ĐỌC, chạy được để đối chiếu
```

Backend NestJS nằm ngay trong repo tại `apps/api` — **chưa dựng**, là việc kế tiếp.

## Stack đã chốt

| Phần | Công nghệ |
|---|---|
| Web | Next.js App Router, TypeScript, Tailwind **v3** (bắt buộc), shadcn/ui, Lucide |
| Mobile | Expo + React Native, Expo Router, NativeWind (chưa dựng) |
| Backend | NestJS · TypeScript · Node 22 LTS · Prisma — migration có đánh số là nguồn chân lý về cấu trúc dữ liệu (chưa dựng) |
| Dùng chung | pnpm workspace, Turborepo, Zod, TanStack Query, Zustand, React Hook Form, Axios |
| Định nghĩa dữ liệu | Zod schema ở `packages/schemas`, kiểu suy ra bằng `z.infer` — backend validate, web/mobile dựng form; **không codegen** từ OpenAPI |
| Thanh toán | PayOS — chỉ thu phí nền tảng (đẩy tin, gói SaaS); webhook là nơi duy nhất kích hoạt quyền lợi |
| Thông báo | In-app + push; SMS **chỉ** cho mã xác thực, nhắc hạn không qua SMS |

## Chiến lược nhánh

`dev` là nhánh chính. Việc rebuild đi qua một nhánh tích hợp riêng:

```
dev
 └── feat/rebuild                    ← nhánh tích hợp, PR về dev khi xong
      ├── feat/design-tokens         ✅ xong
      ├── feat/ui-primitives         ← đang tới
      ├── feat/port-<tên-trang>      ← mỗi trang một nhánh
      └── ...
```

Nhánh con luôn tách từ và merge về `feat/rebuild`, **không phải `dev`**. Đồng bộ
`feat/rebuild` với `dev` mỗi tuần để tránh conflict dồn về cuối. Nhánh không sống quá hai
ngày — cần lâu hơn thì chia nhỏ.

---

## Tiến độ

### Đã xong

- [x] Khởi tạo monorepo: `apps/web`, `apps/mobile`, `packages/*`, Turborepo, CI
- [x] Ba route group `(public)`, `(workspace)`, `(residency)` đã dựng khung
- [x] Nạp `.agents/` — business, rules, tasks, skills
- [x] `feat/design-tokens` — `packages/config/tailwind-preset.js` với 18 token màu, đè
      `borderRadius`, font Be Vietnam Pro; `globals.css` cú pháp v3; ESLint rule
      `tailwindcss/no-custom-classname` ở mức `error`
- [x] `feat/ui-primitives` (PR #2) — port bộ component chung và `StyleGuidePage`
      - Component: `Button`, `Badge`, `Card`, `Table`, `Pagination`, `Toast`, `EmptyState`,
        `Skeleton`, `AppSelect`, `ModalShell`, `BottomTabBar`, `PublicNavbar*`,
        `WorkspaceShell`, `AccountShell` — tất cả ở `apps/web/src/components/{ui,navigation,
        shells}/`
      - Token màu mở rộng dạng nested (`DEFAULT/hover/press/soft`) trong
        `packages/config/tailwind-preset.js`
      - **Cổng nghiệm thu đã đạt:** StyleGuide bản mới (`/styleguide`) khớp bản prototype
- [x] Trang chuẩn vàng — `feat/port-saved-listings` (PR #3), route `/tai-khoan/da-luu`
      - Xác lập cấu trúc mẫu: `app/(public)/tai-khoan/da-luu/page.tsx` (Server Component,
        prefetch + `HydrationBoundary`) + `features/marketplace/{components,hooks,services,
        types,constants}/` — **mọi trang sau làm theo đúng cấu trúc này**
      - Quy ước đã chốt ở đây, áp dụng tiếp cho các trang sau: query-key registry cục bộ
        theo feature; mock data local + `// TODO: nối API thật khi packages/types sinh xong`
        (cơ chế OpenAPI nay đã bỏ — nối theo schema `packages/schemas` khi `apps/api` có); auth
        chưa có `AuthContext` → dùng `MOCK_RENTER_ID` + `// TODO: nối AuthContext khi có`;
        responsive dùng Tailwind `md:` thuần, **không** port `useBreakpoint()` của prototype
        (JS đọc `window.innerWidth`, gây lệch SSR/hydration — đi ngược lý do chọn Next.js)
- [x] `fix/navbar-post-menu-order` (PR #6) — đổi thứ tự 2 mục trong menu Đăng tin, sửa route
      `/dang-tin-cho-thue` → `/chu-tro/dang-tin`
- [x] `feat/port-homepage` (PR #7) — route `/`, section theo đúng cấu trúc prototype
      (`Hero`, `FeaturedRooms`, `MarketplaceSections`, `WhyUs`, `PostingCTA`, `LandlordCTA`,
      `Footer`). Sửa thêm 3 route chết phát hiện khi port: `/search` → `/tim-phong`,
      `/tin-nhu-cau` → `/tin-tim-phong`/`/tin-o-ghep` theo tab. Bỏ `DemoBanner`/`DemoFAB` theo
      quyết định đã duyệt — chưa có khái niệm "chế độ demo" ở repo mới.
- [x] `feat/port-search-results` (PR #8) — route `/tim-phong`, **hợp nhất** hai file
      prototype trùng lặp (`SearchResultsPage` 836 dòng + `AllListingsPage` 878 dòng) thành
      một page, lấy `AllListingsPage` làm nền (pagination/sort/view toggle đủ hơn), cấy khả
      năng đọc `loc/type/price` từ query string của `SearchResultsPage`. Sửa 3 bug thật phát
      hiện khi đọc code prototype: sort diện tích dùng sai giá trị (`area` → `area-desc`),
      lọc kép client-side (bỏ), bộ lọc "Trạng thái" UI chết (bỏ hẳn — Room.status là khái
      niệm SaaS nội bộ, không thuộc bộ lọc Marketplace công khai theo A2). Thu
      `PROPERTY_TYPES` từ 5 nhãn UI về đúng 3 giá trị enum thật (`BoardingRoom/
      ServicedApartment/Apartment`) — sửa luôn selector ở Home vì cùng nguồn catalog. Chuyển
      `RoomCard` lên `features/marketplace/components/` (top-level, dùng chung Home + Search).
      Chưa có bản đồ thật — giữ `MapPlaceholder`, chưa có tọa độ trong entity lẫn thư viện
      map nào trong repo.

- [x] `feat/port-room-detail` (PR #9) — route `/phong/[id]`, 17 component tách theo
      `features/marketplace/components/detail/`. Viết mới nút Báo cáo (BR-032, prototype
      không có sẵn), `PhoneModal` theo BR-014, `ReviewsSection` chỉ render rỗng (badge điểm
      khu để V1, đúng `SCREENS_PUBLIC.md` A3). Không port cơ chế parse giờ giấc từ text mô tả
      — đọc thẳng `accessPolicy`/`accessOpenTime`/`accessCloseTime` (BR-025). Bổ sung sau khi
      xem lại cùng prototype: bản đồ vị trí + tiện ích xung quanh thật (Leaflet/react-leaflet,
      bọc qua `ListingLocationMap`/`LeafletMap` — chỉ 1 file chạm thẳng thư viện, để đổi
      provider sau này không phải sửa nhiều nơi), và `SiteFooter` dùng chung cho cả Home lẫn
      Detail (prototype thiếu Footer ở trang Detail).

- [x] Luồng đăng tin — `QuanLyPage` (B4, PR #11) và `DangTinPage` (B5, PR #13).
      - B4 `/tai-khoan/tin-cho-thue`: KPI, bộ lọc, bảng + card, ẩn/hiện, xóa, đẩy tin, và
        **gia hạn tin viết mới** theo BR-026 (prototype không có).
      - B5 `/dang-tin-cho-thue`: chia lại 4 bước theo công sức thay vì theo chủ đề; tự lưu
        nháp xuống máy để cứu khi mất mạng/sập nguồn; ảnh tải lên ngay khi chọn; điện/nước
        bắt buộc nói rõ nhưng có lối thoát "theo giá nhà nước"/"theo hóa đơn".
      - Thêm `packages/schemas` (ràng buộc thực thể) và `packages/constants/vn` (34 tỉnh,
        3.321 phường, nạp lười qua `loadVnWards()`).
- [x] `fix/navbar-breakpoint-overflow` (PR #12) — navbar desktop bật từ `md` (768px) nhưng
      cần ~1119px nên toàn site cuộn ngang ở 768–1119px. Đổi mốc sang `lg` + thu gọn cụm phải.

- [x] **Nền Surface + B6/B8** — `feat/workspace-surface-rooms`
      - `.agents/business/SURFACES_AND_MODES.md` — **đọc file này trước khi làm bất kỳ màn nào
        có gating**. Ba khái niệm tách bạch: Surface (marketplace/workspace/residency), Mode
        (bối cảnh người dùng đang đứng), Capability (server quyết). **Mode ≠ Role** — app
        mobile "chọn vai trò" là chọn Mode sau khi đăng nhập, không đẻ role mới.
      - `packages/access` — luật truy cập viết **một lần**, dùng chung web + mobile, 26 test
        encode nguyên bảng quyết định. UI không bao giờ được viết `status === 'READ_ONLY'`
        hay `role === 'LANDLORD'`; hỏi qua `canWriteInSurface()`/`getSurfaceDenial()`.
      - `features/session` (Shared Kernel, cả ba Surface dùng được) — `SessionContextProvider`,
        `useSurfaceAccess()`, `WriteGuardButton`, `SurfaceGate`. Nguồn: `GET /me/context`
        (mock; nay đặc tả gộp vào `GET /me` — xem mục Tồn đọng).
      - **B4/B5 chốt thuộc Marketplace**, không phải Workspace — sidebar Workspace bỏ nhóm
        "Tin đăng — miễn phí", thay bằng cụm cross-surface có nhãn rõ. Đã sửa
        `SCREENS_WORKSPACE.md` theo.
      - B6 `/chu-tro/khu-tro` (viết mới — prototype chỉ có dropdown chọn khu) và B8
        `/chu-tro/khu-tro/[id]/phong` (port `RoomsView` + gộp `AddRoomModal`/`EditRoomModal`
        thành một `RoomFormDialog`).
      - **Không** port `RoomDetailTabs` (chỉ số/hóa đơn/lịch sử ở) — đó là B9/B10, V1. **Bỏ**
        nút "Điện nước"/"Hóa đơn" trên thẻ phòng: B12 chưa có, không để nút chết.
      - `AreaSelect` + `FormField` nâng từ `features/marketplace/post-listing/` lên
        `components/ui/` vì B6 cũng cần (cấm import chéo feature).
      - **Một `Room` có NHIỀU `Occupancy` Active đồng thời**, `Contract` chỉ gắn **một** người
        đại diện (Module 7 + BR-006). Không mô hình hóa thành "một người ở kèm `occupantCount`"
        như prototype: mỗi người là một bản ghi riêng, có SĐT riêng và `linkStatus` riêng
        (BR-029). Thẻ phòng hiện người đại diện + "+N người"; drawer liệt kê đủ.
      - Form: `NumberField` (`components/ui`) tự chấm phân cách hàng nghìn + đơn vị chìm;
        trạng thái phòng dùng chip màu thay `<select>` vì chỉ có 4 giá trị và màu là thứ nhận
        diện ở lưới; lỗi hiện ngay dưới từng ô và **gộp mọi lỗi trong một lần bấm**.

- [x] **B7 chi tiết khu trọ** — `feat/port-property-detail`, route `/chu-tro/khu-tro/[id]`
      - Năm khối **lưu độc lập**: thông tin khu, đơn giá mặc định, nhận tiền + VietQR, hồ sơ
        công khai (BR-024), vùng nguy hiểm (BR-011). Một nút Lưu chung buộc người dùng tin
        rằng bốn khối kia không bị đụng tới.
      - **VietQR vẽ tại máy người dùng** bằng `qrcode`, không gọi `img.vietqr.io` — quicklink
        của VietQR nhận số tài khoản qua URL query, tức là mỗi lần render là một lần gửi thông
        tin tài chính của chủ trọ sang bên thứ ba. `packages/utils/src/vietqr.ts` (chuỗi
        EMVCo) + `packages/constants/src/vn/banks.ts` (28 ngân hàng + mã BIN), **22 test**.
      - Ô ngân hàng **bắt buộc là dropdown**: chuỗi EMVCo cần mã BIN 6 số. Text tự do lưu vẫn
        thành công nhưng QR chết im lặng.
      - Tên chủ TK **tự chuyển IN HOA không dấu khi gõ** thay vì báo lỗi — đó là ràng buộc kỹ
        thuật của VietQR, không phải lỗi người dùng.
      - Hai quyết định đã chốt, ghi vào `docs/DATABASE_DESIGN.md` §10.2 và §10.12: đơn giá
        theo **ba tầng** (khu → phòng nullable → chốt cứng vào `UtilityReading`), và
        `bank_name` lưu **mã** ngân hàng chứ không lưu tên.

- [x] **B10 quản lý người ở** — `feat/port-occupancy`, route `/chu-tro/phong/[id]/nguoi-o`
      - **Tách `Occupancy` thành bảng riêng.** Trước đó nó nằm lồng trong `RoomListItem`: đọc
        được nhưng không ghi được. Giờ `occupancies` là Map riêng trong kho mock, phòng ghép
        người ở lúc đọc — đúng hình dạng DB thật và là điều kiện để B11 gắn hợp đồng.
      - **Liên kết bằng SĐT, không phải email.** Prototype tra `renterEmail`; sai với BR-016
        (SĐT là định danh duy nhất) và email lại là trường tùy chọn nên phần lớn người ở
        không có.
      - **BR-029 không có đường tắt:** gắn tài khoản luôn ra `Pending`, không nhánh nào cho
        chủ trọ đặt thẳng `Confirmed`.
      - Tách khỏi hợp đồng: B10 chỉ thêm/kết thúc người ở và chỉ định đại diện. Tạo Contract
        (kéo theo đổi `Room.status`, chặn chồng lấn) để B11.

- [x] **B11 hợp đồng** — `feat/port-contract`, route `/chu-tro/hop-dong`
      - Danh sách hợp đồng của **toàn bộ khu**, lọc theo trạng thái, cảnh báo sắp hết hạn
        (30 ngày) và quá hạn chưa xử lý.
      - **BR-006** — form tạo chỉ hiện phòng đã có người ở và chưa có hợp đồng Active; service
        chặn chồng lấn bằng `hasDateRangeOverlap` (khoảng **đóng hai đầu** — kết thúc 31/12 và
        bắt đầu 31/12 là chồng lấn).
      - **BR-031** — tạo hợp đồng Active đổi `Room.status` sang `Rented`; chấm dứt thì phòng
        **giữ nguyên** trạng thái (chủ trọ có thể đang dọn/sửa), dialog nói rõ còn một bước nữa.
      - Upload scan hợp đồng (BR-008) **hoãn** — cần private bucket + signed URL từ backend.

- [x] **B12 điện nước & hóa đơn** — `feat/workspace-billing` (PR #20), route `/chu-tro/hoa-don`
      - **Một màn hai tab** vì đây là một chuỗi liên tục: ghi chỉ số cuối kỳ rồi xuất hóa đơn
        ngay từ chính những số vừa ghi. Tách hai route sẽ bắt chủ trọ đi vòng cho một lần chốt sổ.
      - **Ghi chỉ số theo BẢNG cả khu**, không phải modal từng phòng như prototype — khu hai
        mươi phòng thì đó là hai mươi lần mở–gõ–lưu–đóng, trong khi việc thật là cầm sổ đi một
        vòng rồi nhập một lượt. Số tiền hiện ngay khi gõ.
      - **Hóa đơn bắt buộc gắn Contract** (`unique (contractId, period)` trong `DATA_ENTITIES`).
        Phòng chưa có hợp đồng Active thì không xuất được, UI nói rõ lý do.
      - **Tiền thuê lấy từ `Contract.rentPrice`, KHÔNG lấy `Room.price`** — hợp đồng là căn cứ
        pháp lý; phòng đã tăng giá sau ngày ký thì lấy giá phòng là thu sai số tiền.
      - **BR-004 do service suy, không phải component tính.** `deriveInvoiceStatus` nằm trong
        `invoicesService` đóng vai backend, có ghi `// XÓA khi nối API thật`.
      - **`packages/utils/src/invoiceNote.ts` + 7 test** — đóng lại cạm bẫy 25 ký tự VietQR:
        rút gọn theo thang bậc có định nghĩa, và **không bao giờ cắt kỳ** (cắt mã phòng thay).
      - Thêm `packages/schemas/src/invoice.ts` (4 enum + 4 schema thực thể).
      - `ModalShell` có thêm `size="lg"` cho nội dung hai cột (khoản thu cạnh mã VietQR).
      - **Hoãn:** gửi in-app thật (cần A11 hộp thư + `Notification`) — thay bằng đánh dấu đã
        gửi + bản in qua `window.print()`. B18 duyệt chỉ số từ người ở (BR-033) và B13 route
        chi tiết riêng cũng để sau; chi tiết hóa đơn hiện là modal.

- [x] **Tiện ích cho phòng** — `feat/room-amenities` (PR #22)
      - `DATA_ENTITIES` đã có `Room n-n Amenity` nhưng repo mới chỉ dựng nửa phía tin đăng.
      - Catalog 11 tiện ích **nâng** từ `features/marketplace/constants/` lên `src/constants/`
        vì ESLint cấm import chéo feature. **Không chép sang workspace** — chính file đó ghi
        lại bài học prototype có hai danh sách lệch nhau khiến icon rơi hết về Wifi.
      - Lưới chọn tách thành `components/ui/AmenityPicker` cho B5 và B8 dùng chung.
      - Mảng rỗng là dữ liệu **thật** (phòng thô), nên hiện hẳn câu giải thích thay vì để trống.

- [x] **B9 chi tiết phòng** — `feat/port-room-detail-workspace`, route `/chu-tro/phong/{id}`
      - **Trang tổng hợp, không nhân bản thao tác.** Người ở sửa ở B10, hợp đồng ở B11, hóa đơn
        và chỉ số ở B12; B9 chỉ tóm tắt rồi dẫn sang. Ngoại lệ duy nhất: sửa thông tin phòng.
        Prototype gộp hết vào drawer 4 tab **vì nó không có màn nào khác để đi** — repo này có.
      - Prototype `RoomDetailTabs` vốn đã **chỉ đọc** (không có nút thao tác nào). Khác biệt
        thật nằm ở nghiệp vụ: nó lấy **một** `activeOccupancy` rồi hiện "N người", còn ở đây
        liệt kê **đủ từng người** kèm SĐT và `linkStatus` riêng (BR-029).
      - **Đơn giá nói rõ nguồn**: "3.500 đ/kWh · theo giá khu" so với "3.700 đ/kWh · riêng
        phòng"; `0` hiện thành "Miễn phí". Prototype hiển thị `null` thành "Chưa cấu hình" —
        sai, vì `null` là quyết định thừa hưởng giá khu chứ không phải quên khai.
      - **Không tính lại trạng thái hóa đơn.** `getInvoicesByRoom` dùng lại `toListItem` nên
        `deriveInvoiceStatus` chỉ chạy một chỗ.
      - Gắn cờ hợp đồng `Active` đã **qua `endDate`** — `daysRemaining` âm nên điều kiện "sắp
        hết hạn" bỏ lọt đúng hợp đồng đáng lo nhất.
      - Thêm lọc `?phong=` cho B12; nhân đó sửa luôn số trên chip trạng thái để đếm theo phạm
        vi đang lọc (trước đó chip ghi "Tất cả 4" trong khi danh sách chỉ có 1 dòng).
      - Drawer B8 **giữ nguyên** làm xem nhanh, thêm lối "Xem chi tiết" sang B9.

- [x] **Tài liệu theo đặc tả mới** — `docs/spec/dac-ta-ky-thuat.md` là nguồn chân lý; `.agents/`
      viết theo bản cũ, đang cập nhật theo 6 nhóm (1 vai trò · 2 thuế · 3 liên kết người ở ·
      4 stack NestJS · 5 dữ liệu 37 bảng · 6 BR-036..038). Không sửa file spec; mâu thuẫn nội
      tại của spec lấy 1.8 + BR-013 + Mục 8 làm chuẩn, chủ dự án sửa spec riêng cuối đợt.
      - 21/09/2026 — **nhóm 1, 1b, 2** xong: `role` một giá trị `TENANT|LANDLORD|STAFF|ADMIN`
        (bỏ `roles[]` cộng dồn, Renter/Seller/Moderator); `workspaceStatus` →
        `subscriptionStatus`; bỏ tính năng thuế (B14, AS-012, `AnalyticsTaxService`).
      - 22/09/2026 — **nhóm 4 (stack)** xong: gom guidance tự nạp về `AGENTS.md` gốc (Claude
        Code đọc qua `CLAUDE.md` = `@AGENTS.md`; Codex đọc thẳng) — một nguồn, có git. Toàn bộ
        `.agents/*`, `README`, `HELP`, `SOURCE_CODE_GUIDELINES` đổi sang: backend **NestJS tại
        `apps/api`** cùng monorepo, **Prisma + migration đánh số**, **Zod ở `packages/schemas`**
        thay `openapi.json`, **PayOS**, SMS chỉ OTP; `*Service` → `*Module`; endpoint
        `POST /me/become-landlord`; mutation web đi qua API (Server Actions chỉ cho cookie
        phiên/revalidate). `BACKEND_PROPOSALS.md` đổi khung thành "khoảng trống chờ chốt vào
        đặc tả". Hai file `docs/DATABASE_DESIGN.md`, `docs/BUSINESS_RECONCILIATION.md` chỉ gắn
        ghi chú lịch sử, không viết lại. `docs/DEVELOPMENT_SETUP.md` để lúc dựng `apps/api`.
      - 22/09/2026 — **nhóm 3 (liên kết người ở)** xong: liên kết **có hiệu lực ngay** khi chủ
        trọ gắn, không còn bước Tenant chấp nhận/từ chối; bỏ `Occupancy.linkStatus`
        (Pending/Confirmed/Rejected) và `residencyStatus = PENDING`; C2 đổi thành "Thông báo
        được thêm vào phòng" (`/nguoi-o/lien-ket`, nút "Không phải tôi"); API chỉ còn
        `PATCH /residency/me/occupancies/{id}/unlink`. Sửa `USER_FLOWS` (kèm 4.3 theo
        `POST /me/become-landlord`, 7 bước form, PayOS), `SCREENS_RESIDENCY`, `STATUS_ENUMS`
        (thêm `role` đơn, `subscriptionStatus`, bỏ `TaxDeclaration`), `API_CONTRACT`,
        `ASSUMPTIONS` AS-006, `NON_FUNCTIONAL`, `REBUILD_PLAN`, `FEATURE_MODULES`,
        `ROADMAP_AND_RATIONALE`; quét sạch Renter/Seller/Moderator trong các file đó.
      - 22/09/2026 — **nhóm 5 (dữ liệu 37 bảng)** xong: `DATA_ENTITIES` chép lại theo Mục 6 —
        thêm `AuthMethod`, `ListingType`, `ListingCost`, `ListingNearbyPlace`, `BoostPackage`;
        xóa hẳn `TaxSetting`/`TaxDeclaration`; `User` chỉ còn `phoneNumber` (bỏ `email`,
        `passwordHash`) + `roleId` (bỏ bảng nối n-n); xóa mềm `isDeleted` + `createdBy/updatedBy`
        (bỏ `deletedAt`); địa chỉ `provinceCode + wardCode` (lọc) / `wardName + addressDetail`
        (hiển thị); đẩy tin chỉ giữ `boostExpireAt`; đơn giá ba tầng khu → phòng → chép vào
        `UtilityReading` (BR-036); `Occupancy` nhiều bản ghi mỗi phòng, `isPrimary`, `endDate` =
        ngày đầu không còn ở (BR-037); **`Invoice.invoiceCode` unique, sinh một lần, không đổi**
        (quyết định riêng — Module 9 cho phép hai hóa đơn cùng phòng cùng kỳ khi đổi người ở, và
        đổi `roomCode` không được làm đổi mã đã nằm trong nội dung chuyển khoản; spec Mục 6 cần
        bổ sung cột này); `VALIDATION_RULES` theo Mục 9 + BR-036..038; `STATUS_ENUMS` bỏ enum
        `propertyType` (nay là FK `ListingType`), thêm `AuthMethod.provider`,
        `Conversation.status`, `Amenity.type`, `Notification.type`. Đã dùng `landlordReply`,
        `initiatorId` (spec Mục 6 có lỗi find-replace `chủ trọReply` và index `renterId` — chủ
        dự án sửa spec riêng).
      - 22/09/2026 — **nhóm 6 (quy tắc nghiệp vụ)** xong: `BUSINESS_RULES` chép lại theo Mục 5
        của đặc tả **v3.4** — bảng mục lục 38 dòng rồi 37 mục chi tiết, mỗi quy tắc có tên
        riêng, thứ tự mã tăng dần. Thêm **BR-036** (đơn giá ba tầng: khu → phòng → bản ghi chỉ
        số, bảng ba tầng của v3.4), **BR-037** (nhiều bản ghi người ở, `isPrimary`, ngày kết
        thúc = ngày đầu không còn ở), **BR-038** (mã hóa đơn lưu cố định `P203-202603`, hậu tố
        chống trùng `-2`, nội dung chuyển khoản 25 ký tự — rút mã phòng trước, không cắt kỳ,
        không cắt hậu tố). BR-021 giữ khoảng trống, đánh dấu "(không dùng)" ở bảng mục lục và
        **không có mục chi tiết** — giống đặc tả, không đánh số lại. Viết lại BR-013 (một vai
        trò, bốn tầng quyền), BR-016 (không email, không đăng nhập MXH), BR-029 (liên kết có
        hiệu lực ngay), BR-023 (chủ trọ được báo cáo đánh giá), BR-024 theo **v3.4**: người ở
        **viết được đánh giá bất kể khu bật hay tắt công khai**, bật/tắt chỉ quyết định hiển
        thị. Bỏ định danh kỹ thuật khỏi file (`sellerId`, `linkStatus`, `boostExpireAt`,
        `Cancelled`, `UtilityReadingSubmission`…) — đã có ở `DATA_ENTITIES`/`STATUS_ENUMS`/
        `VALIDATION_RULES`, giữ một nguồn; quét sạch Renter/Seller/Moderator/Guest. Cập nhật
        `README` (BR-001 → BR-038).
      - 23/09/2026 — **đồng bộ đặc tả v3.5** xong: `BUSINESS_RULES` thêm **BR-039** (webhook
        tới muộn: tác vụ 15 phút chỉ dọn giao diện, `Failed` → `Success` chỉ qua webhook đã xác
        thực chữ ký), **BR-040** (chữ ký hợp lệ mà mã không khớp thì trả thành công + ghi cảnh
        báo; chữ ký sai thì chặn), **BR-041** (tiền và chỉ số lưu số nguyên, làm tròn **từng
        dòng** hóa đơn, không tự làm tròn lên hàng nghìn). Ba mục "đã chốt — chờ vào đặc tả"
        trong `skills/critical-path-testing/references/TEST_CASES.md` (1.3, 4.2, 4.3) nay dẫn
        thẳng BR-041/BR-039/BR-040; bảng vùng trong `SKILL.md` cũng dẫn theo.
        `VALIDATION_RULES` gắn ba mã mới vào ràng buộc: `UtilityReading` (chỉ số số nguyên) và
        `Invoice` (tổng = Σ dòng **đã làm tròn**) dẫn BR-041; `PlatformTransaction` dẫn
        BR-039/BR-040.
      - 23/09/2026 — **đồng bộ đặc tả v3.6** xong, **đợt cuối — tài liệu đóng băng**: bốn khoảng
        trống dữ liệu mở lâu nay ở `BACKEND_PROPOSALS.md` đã chốt vào đặc tả. `BUSINESS_RULES`
        thêm **BR-042** (ba cách tính nước: theo khối / theo đầu người / khoán cố định; cài ở
        **cấp khu**; hai cách sau không nhập chỉ số; cách tính + đơn giá + số người **chốt cứng
        vào bản ghi chỉ số**) và **BR-043** (danh mục hành chính **gói sẵn trong mã nguồn**, cả
        ba app dùng chung, **không làm endpoint**; tên phường/xã do máy chủ suy từ mã).
        `DATA_ENTITIES` thêm `RentalListing.latitude/longitude` (rỗng được),
        `Room.maxOccupants`, `Property.waterPricingMethod` (nguồn chính),
        `ListingCost.waterPricingMethod` (hiển thị trên tin), `UtilityReading.pricingMethod` +
        `occupantCount`, và `UtilityReading.currentReading` **thành nullable**. `STATUS_ENUMS`
        thêm enum `PerCubicMeter/PerPerson/FlatRate`. `VALIDATION_RULES` thêm `maxOccupants > 0`,
        ràng buộc **Địa chỉ** (mã phải có trong danh mục gói sẵn, tên suy ở server) và điều kiện
        chỉ số nước theo cách tính. `FEATURE_MODULES` (M3/M5/M6/M9), `SCREENS_WORKSPACE`
        (B7 cài đặt khu, B9 `maxOccupants`, B12 ẩn ô chỉ số nước), `USER_FLOWS` 4.6 và
        `TEST_CASES` §1.7 (9 ca cho ba cách tính nước) theo đó.
        **Hai mục chuyển sang hoãn:** `otherFees` (quan hệ một-nhiều, chưa xứng chi phí cấu trúc;
        ô nhập ở B5 vẫn còn nhưng không có chỗ lưu) và **đếm lượt xem tin** (phải chọn giữa cột
        đếm và bảng sự kiện — quyết trên số liệu thật khi dựng `AnalyticsModule`; lượt liên hệ
        thì suy được từ `ContactEvent` sẵn có). **Đề xuất endpoint `GET /public/wards` bị bác** —
        ghi rõ trong `BACKEND_PROPOSALS.md` để không ai dựng lại.
        Sửa **một chỗ trong đặc tả** (được chủ dự án cho phép): xóa mảnh câu lơ lửng
        `được giữ lại** — bật lại thì hiện lại như cũ.` sót lại ở Module 5, không đụng gì khác.
      - **Tồn đọng sau nhóm 6 đã hết:** v3.5 sửa BR-024 theo hướng `SCREENS_PUBLIC` A4 vốn
        đang ghi — trang khu công khai **có** tin đang cho thuê của khu. A4 giữ nguyên,
        `BUSINESS_RULES` chép lại theo bản mới. Thuật ngữ vai trò còn sót trong tiêu đề mục
        (`RENTER SHELL` → `TENANT SHELL`, `MODERATOR AREA` → `STAFF AREA`) đã đổi.

### Đang làm

- [ ] **Dựng backend NestJS theo lát cắt dọc** — mỗi lát: Zod schema → module NestJS (Prisma,
      migration) → nối ngay với frontend thay mock. **Lát 1 = xác thực:** `AuthModule`
      (`/auth/register`, `/verify-otp`, `/login`, `/refresh`, `/logout`, `GET /me`,
      `POST /me/become-landlord`) + migration đầu tiên (`User`, `AuthMethod`, `RefreshToken`,
      `Profile`), rồi `AuthContext` phía web thay `MOCK_SELLER_ID`/`MOCK_RENTER_ID` (mọi trang
      đã ghi sẵn `// TODO: nối AuthContext khi có`). **Thay quyết định cũ "A7 để cuối cùng"** —
      chủ dự án đảo lại ngày 22/09/2026 vì backend nay cùng repo, xác thực là nền cho mọi lát
      sau. Lập kế hoạch riêng cho lát này (cấu trúc thư mục `apps/api`, DB, cách chạy local)
      trước khi viết code.
- [ ] **Giai đoạn 4 — phần còn lại của Workspace.** Kế tiếp: **B3 dashboard** — 4/5 nhóm số
      lấy từ Contract/Invoice/Payment, giờ đã có đủ nguồn. Rồi B1/B2 onboarding,
      B15 gói dịch vụ, B16 đánh giá, B17 sự cố, B18 duyệt chỉ số.
- [ ] Nút **"Tạo tin từ phòng"** (điểm nối Room → RentalListing) — chưa làm: B5 chưa đọc
      `?roomId=` để prefill. Badge "Có tin đang chạy" thì đã có. Làm thành nhánh riêng chạm
      cả hai feature.
- [ ] Dọn nhánh: `chore/handoff-project-state` trên origin **đã thừa** — nội dung của nó đi
      theo PR #20 vào `feat/rebuild` rồi (PR merge kiểu squash nên mã commit không trùng, đừng
      nhìn `--contains` mà tưởng chưa merge). Xóa được. Local còn 14 nhánh cũ đã merge, cũng
      chỉ là rác.

### Tồn đọng

- [ ] **`packages/access` lệch tài liệu** — còn `roles[]` cộng dồn, `workspaceStatus`, gọi
      `GET /me/context`; tài liệu nay là `role` đơn, `subscriptionStatus`, `GET /me`. Đồng bộ
      khi làm lát xác thực (là lúc `features/session` nhận dữ liệu thật); 26 test phải viết lại
      theo bảng quyết định mới.
- [ ] **Dấu vết cầu nối OpenAPI cũ trong code** — gỡ khi dựng `apps/api`: tên package
      `tro-nhanh-fe` trong `package.json` gốc; script `api:gen`; devDependency
      `openapi-typescript`; file `openapi.json`; `packages/types/src/api.ts` (stub rỗng).
- [ ] **Code B9/B10 còn `linkStatus`** — 7 file trong `apps/web/src/features/workspace`
      (`types/occupancy.ts`, `constants/mockOccupancies.ts`, `services/occupanciesService.ts`,
      `components/occupancy/OccupancyCard.tsx`, `components/occupancy/OccupantLinkBadge.tsx`,
      `components/room-detail/RoomOccupantsSection.tsx`, `components/rooms/RoomDetailDrawer.tsx`)
      vẫn mô hình Pending/Confirmed/Rejected; tài liệu nay chỉ còn `userId` null/khác null. Đồng
      bộ khi làm lát Occupancy của `apps/api` (badge "đã liên kết"/"chưa liên kết", bỏ nhánh
      chờ xác nhận).
- [ ] **Code marketplace còn mô hình dữ liệu cũ** — 26 file (`packages/schemas/src/rentalListing.ts`,
      `property.ts` và 24 file `apps/web/src/features/marketplace/*` + 2 file `components/style-guide`)
      vẫn dùng enum `propertyType` (`BoardingRoom/ServicedApartment/Apartment`), `district`
      chuỗi, chi phí cố định `electricityPrice/waterPrice/servicePrice/deposit` trên tin; tài liệu
      nay là FK `typeId` → danh mục `ListingType`, `provinceCode + wardCode` + `wardName +
      addressDetail`, bảng `ListingCost` riêng. Đồng bộ khi làm lát Listing của `apps/api`
      (`catalog.ts` đổi sang tra danh mục từ API; schema tách `ListingCost`).

### Tiếp theo

- [ ] Phần công khai còn thiếu: A11 hộp thư, A5/A9/A10 tin nhu cầu, A4 trang khu trọ public,
      A12–A14
- [ ] Dashboard chủ trọ và phần SaaS còn lại
- [ ] Khu Admin (D1–D6)
- [ ] Khu người ở `/nguoi-o/*` (C1–C10) — phần lớn **viết mới**, prototype chưa có
- [ ] App mobile Expo

---

## Quyết định đã chốt (không tự ý đổi)

| Quyết định | Lý do |
|---|---|
| Tailwind **v3**, không phải v4 | NativeWind bản ổn định cần v3; dùng v4 thì web và mobile không chung được preset |
| Next.js cho web | SSR để Google index trang tin đăng — SEO là kênh thu hút người thuê |
| Expo React Native cho mobile | Cùng React/TypeScript với web, dùng chung type và API client |
| Backend NestJS trong cùng monorepo (`apps/api`) | Cùng ngôn ngữ nên dùng chung Zod schema — đổi một trường là cả ba app báo lỗi biên dịch; không cần OpenAPI làm cầu nối |
| Prisma + migration có đánh số là nguồn chân lý | Không sửa tay DB; lịch sử cấu trúc nằm trong git, ai clone cũng dựng lại được đúng schema |
| Mọi thao tác ghi đi qua `apps/api` | Server Actions ghi thẳng DB thì quy tắc nghiệp vụ và kiểm tra quyền phải viết hai lần; Server Actions chỉ cho việc thuần server của web (cookie phiên, revalidate) |
| Cổng thanh toán PayOS | Không đòi giấy phép kinh doanh; mô hình tạo link ở máy chủ + webhook khớp luồng đã thiết kế |
| SMS chỉ cho mã xác thực | Nhắc hạn đi qua thông báo trong ứng dụng — rẻ hơn và không phụ thuộc nhà mạng |
| Hai bounded context + Shared Kernel | Giữ transaction đơn giản, vẫn có ranh giới sạch để tách service sau |
| Residency là module trong SaaS | Tách thành context thứ ba sẽ tạo phụ thuộc vòng |
| Không có role "Resident" | Người ở vẫn là Tenant, chỉ khác ở `residencyStatus` suy từ dữ liệu |
| App người ở là lớp cộng thêm | Nghiệp vụ chủ trọ phải chạy đủ kể cả khi không ai cài app |
| Đánh giá verified-only | Cần Contract làm bằng chứng; đây là USP so với review tự do |

## Cạm bẫy đã gặp

**Class Tailwind sai tên không gây lỗi build.** Tailwind lặng lẽ không sinh CSS, typecheck
vẫn xanh, giao diện sai âm thầm. ESLint rule là hàng rào duy nhất — nếu nghi ngờ, thử viết
một class bịa và chạy `pnpm lint`, phải thấy báo lỗi.

**Thang bo góc khác mặc định.** Preset đè `md` = 12px; Tailwind mặc định `rounded-lg` là 8px.
Dùng theo thói quen sẽ lệch mà rất khó thấy bằng mắt.

**Node phải đúng 22.14.0** theo `.nvmrc`. Chạy `nvm use` trong repo; mỗi người một phiên bản
sẽ sinh lỗi kiểu "máy tôi chạy được".

**Prototype dựng trước khi chốt nghiệp vụ mới.** Không port nguyên hành vi cũ ở: gating
Workspace, đánh giá verified, liên kết người ở có hiệu lực ngay (BR-029), báo cáo vi phạm bắt
buộc đăng nhập.

**GitHub hay tự nhớ base branch của lần tạo PR gần nhất, không phải nhánh mình vừa mở compare
tới.** Từng khiến một PR merge nhầm thẳng vào `dev` thay vì `feat/rebuild`. Luôn nhìn kỹ dòng
`base:` ngay trước khi bấm "Create pull request", đừng tin theo mặc định.

**Bảng ánh xạ route trong `REBUILD_PLAN.md` từng SAI, và tài liệu cũng sai được.** Bảng đó
ghi B4 = `/chu-tro/tin-dang`, B5 = `/chu-tro/dang-tin`; tôi tin theo rồi sửa navbar sang route
đó, hoá ra **đúng là chiều ngược lại**: router thật của prototype đăng ký
`tai-khoan/tin-cho-thue` và `dang-tin-cho-thue`, còn hai đường `/chu-tro/*` kia chỉ tồn tại để
redirect, kèm comment "đường cũ, xóa được sau khi docs cập nhật hết". Đã sửa bảng và code
(PR #10). **Khi route đáng ngờ, đọc `prototype/src/routes/index.tsx` — nó là sự thật, tài liệu
tóm tắt có thể lạc hậu.**

**`Date.now()` không đủ để sinh id.** Nó phân giải tới mili-giây, nên bấm "Thêm dòng" vài lần
liên tiếp tạo ra các dòng **cùng id**: xoá một dòng thì xoá cả nhóm, sửa một dòng thì sửa cả
nhóm, React nhận key trùng nên vẽ lại thất thường. Dùng `createLocalId()`
(`features/marketplace/utils/localId.ts`, bọc `crypto.randomUUID`).

**Đừng đọc mảng từ `watch()` bên trong hàm xử lý sự kiện.** Đó là ảnh chụp lúc render; hai cú
bấm trong cùng một khung hình sẽ cùng đọc giá trị cũ và cái sau ghi đè cái trước — bấm nhanh
hai tiện ích chỉ giữ được một. Đọc bằng `getValues()` tại thời điểm gọi. Lỗi này **không hiện
ra khi thử tay chậm**.

**`AppSelect` cố ý không có viền** (`bg-transparent p-0`) để nơi dùng tự quyết khung. Đặt nó
cạnh ô `<input>` có viền mà quên bọc thì trông như hai hệ giao diện. Dùng `FieldBox`.

**`MapContainer` (react-leaflet) chỉ đọc `center` lúc gắn lần đầu.** Đổi prop sau đó không làm
bản đồ dời, ghim văng ra ngoài khung và trông như không có gì xảy ra. Cần một component gọi
`map.setView()` khi toạ độ đổi từ bên ngoài.

**Chỉ một file được chạm thư viện bản đồ.** Mọi nơi đi qua `ListingLocationMap`; phần Leaflet
nằm sau `LeafletMap`. Cùng nguyên tắc với `loadVnWards()` cho dữ liệu hành chính — đổi nhà
cung cấp sau này chỉ sửa một file.

**Truyền `propertyId` xuống hook để invalidate là cái bẫy im lặng.** Màn danh sách hợp đồng
trải khắp các khu nên luôn truyền `undefined`, và lưới phòng **không bao giờ** được nạp lại —
BR-031 đổi `Room.status` mà màn phòng vẫn hiện trạng thái cũ. Khi không biết trước phạm vi,
invalidate cả nhánh key (`ROOM_QUERY_KEYS.all`).

**Đo bằng full reload thì kho mock reset, không kết luận được gì.** Kiểm mutation phải điều
hướng bằng **link trong app** (client-side), không `location.href`.

**`endDate` là ngày BẮT ĐẦU không còn ở, không phải ngày ở cuối cùng.** Dùng `endDate >= today`
để tính "đang ở" thì chủ trọ bấm "Kết thúc ở", chọn hôm nay, rồi thấy người đó vẫn nằm ở mục
"Đang ở" — trông như thao tác không ăn. Dùng `>`. Người có `endDate` ở tương lai vẫn là đang ở
nhưng phải hiển thị khác ("Sắp rời DD/MM"), vì báo trước một tháng là chuyện bình thường.

**Bộ đếm trên chip lọc phải đếm theo phạm vi đang lọc.** Chip trạng thái ở B12 từng đếm trên
toàn bộ hóa đơn, nên khi lọc theo phòng thì chip ghi "Tất cả 4" trong khi danh sách bên dưới
chỉ có một dòng — người đọc không có cách nào biết vì sao. Đếm trên tập đã lọc **trừ chính bộ
lọc đó**, nếu không chọn một chip xong mọi chip khác về 0.

**Ghi cache sau mutation: cẩn thận khi một thao tác chạm NHIỀU bản ghi.** Đổi người đại diện
hợp đồng sửa hai `Occupancy` (người cũ mất vai trò, người mới nhận). Ghi mỗi bản ghi mà
mutation trả về vào cache sẽ hiện **hai người cùng làm đại diện**. Cho mutation trả về trạng
thái mới của cả nhóm rồi `setQueryData` một lần.

**Sau mutation, `invalidate` để lộ khoảng một giây hai chỗ nói ngược nhau.** Thông báo "đã
lưu" hiện ngay còn dữ liệu trên màn thì đợi refetch xong mới đổi. Khi service đã trả về bản
ghi mới, ghi thẳng vào cache bằng `setQueryData` rồi mới `invalidate` các query dạng gộp.

**Giới hạn 25 ký tự của nội dung chuyển khoản VietQR cắn vào nội dung thật.** "Tiền phòng P101
kỳ 2026-08" dài 26 ký tự sau khi bỏ dấu và bị cắt cụt. B12 phải tự rút gọn chủ động (VD
"P101 2026-08"), có test ghi lại ở `packages/utils`.

**Kho mock nằm trong bộ nhớ TỪNG TIẾN TRÌNH — server prefetch không thấy mutation của trình
duyệt.** Thêm phòng ở B8 rồi quay lại B6 vẫn thấy số cũ, vì `staleTime: 30s` của app coi dữ
liệu server vừa ghi đè là còn tươi nên không refetch. Hook của workspace đặt `staleTime: 0`
để refetch khi mount hòa giải lại; bỏ khi nối API thật. Cạm bẫy này áp cho **mọi** feature
đang chạy mock có mutation.

**Ô số để trống ≠ số 0, mà schema thực thể không phân biệt được.** `roomPriceSchema` cố ý cho
`price ≥ 0` (phòng cho người nhà ở nhờ là dữ liệu thật), nhưng `Number('')` ra `0` nên bỏ
trống ô giá thuê **lặng lẽ** lưu phòng giá 0 đ/tháng — sai số chảy thẳng xuống hóa đơn. Ràng
buộc "phải khai" thuộc về **form**, không thuộc thực thể; kiểm chuỗi rỗng trước khi parse.
Cùng một cái bẫy với `electricityPrice: null` (theo giá khu) so với `0` (miễn phí).

**Ô nhập để rỗng khi đã có dữ liệu là lời nói dối im lặng.** Bảng ghi chỉ số ban đầu chỉ đổ
giá trị người dùng vừa gõ vào ô, nên kỳ đã ghi rồi thì ô trông như chưa nhập — trong khi dòng
bên dưới vẫn tính "88 kWh × 3.500" và tổng cuối bảng vẫn cộng số đó. Chủ trọ đọc thành "phần
mềm tự bịa ra một con số". Ô nhập phải đổ **giá trị đang lưu** khi chưa có gì gõ đè.

**Điều kiện `disabled` sai vế thì không có gì báo.** Nút Lưu chỉ số từng kiểm
`currentReading < 0` — chỉ số công tơ luôn dương nên vế đó **không bao giờ đúng**, nút mở suốt
dù ô đang báo đỏ. Phải so với chỉ số cũ của chính ô đó. Loại lỗi này typecheck và lint đều
không thấy; chỉ lộ ra khi bấm thật vào đúng ca sai.

**Ghép class Tailwind bằng nội suy chuỗi (`md:${size}`) không bao giờ sinh ra CSS.** Tailwind
quét mã nguồn bằng văn bản. Build xanh, typecheck xanh, chỉ có modal là đột nhiên rộng hết màn
hình. Viết đủ cả hai biến thể vào một `Record`.

**Banner lỗi đặt ở trang nền sẽ nằm SAU lớp phủ modal.** Bấm Lưu bị trùng mã phòng thì dialog
đứng im không rõ lý do — lỗi có render, chỉ là người dùng không thấy. Lỗi của thao tác trong
modal phải hiển thị **bên trong** modal đó. Chỉ lộ ra khi bấm thật, không lộ khi đọc code.

**Prototype có nhiều bản triển khai trùng logic bị lệch nhau** (ví dụ màu trạng thái phòng
giữa `theme.ts` và `statusMaps.ts` khác giá trị nhau). Khi port, ưu tiên tài liệu
`business/STATUS_ENUMS.md` của repo mới làm chuẩn, không mặc định tin code prototype là đúng
tuyệt đối.

---

## Cách làm việc đang áp dụng

- **Lập kế hoạch trước, chờ duyệt, rồi mới viết code.** Kế hoạch nêu rõ: file sẽ tạo, quyết
  định kiến trúc, và những điểm mơ hồ cần chủ dự án chốt — không tự quyết thay.
- **Kiểm thật trên trình duyệt trước khi báo xong**, không dừng ở "build xanh". Nhiều lỗi chỉ
  lộ ra khi bấm thật (bấm nhanh mất lựa chọn, bản đồ không dời, viền chìm).
  ⚠️ Số đo có thể đánh lừa nếu bắt sai thời điểm (hoạt ảnh đang chạy, ảnh chưa render, mốc trễ
  tự lưu) — đo lại trước khi kết luận có lỗi.
- **Tắt dev server sau khi kiểm xong**, nếu không sẽ chiếm cổng 3000 và chủ dự án không chạy
  `pnpm dev` được.
- **Tạo PR bằng `gh` CLI**: `"C:\Program Files\GitHub CLI\gh.exe" pr create --base feat/rebuild
  --head <nhánh> --title ... --body-file ...` (gh chưa vào PATH của shell nên gọi đường dẫn đầy
  đủ). Base **luôn** là `feat/rebuild`, không phải `dev`.
- Quality gate trước khi bàn giao: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`,
  `pnpm format:check`.

## Cách cập nhật file này

Sau mỗi nhánh hoàn thành: chuyển mục tương ứng từ "Đang làm" sang "Đã xong", kéo mục kế tiếp
lên, ghi lại cạm bẫy mới nếu có. Giữ ngắn — đây là bản đồ, không phải nhật ký.
