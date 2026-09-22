# ĐẶC TẢ KỸ THUẬT DỰ ÁN — TRỌ NHANH
## Technical Project Specification

**Quy ước ngôn ngữ của tài liệu:** viết bằng tiếng Việt. Những khái niệm có tên tiếng Anh dùng
trong mã nguồn được ghi tiếng Việt trước, tên tiếng Anh trong ngoặc ở lần nhắc đầu tiên của
mỗi mục — ví dụ *khu trọ (`Property`)* — các lần sau chỉ dùng tiếng Việt. Riêng phần danh sách
dữ liệu và danh sách đường dẫn API giữ nguyên tên tiếng Anh vì đó là tên định danh thật trong
mã nguồn.

Trọ Nhanh là nền tảng Web/Mobile tìm thuê và quản lý phòng trọ, căn hộ dịch vụ — gồm hai trụ cột **Marketplace** (tìm & đăng tin) và **SaaS quản lý vận hành** cho chủ trọ. Tài liệu này là **nguồn chân lý** của dự án: đặc tả toàn bộ chức năng, dữ liệu, luồng nghiệp vụ, phân quyền và lộ trình. Khi tài liệu khác mâu thuẫn với tài liệu này, theo tài liệu này. Mỗi lựa chọn thiết kế đi kèm lý do và trade-off.

---

## 0. THUẬT NGỮ

Bảng này giải thích các từ dùng xuyên suốt tài liệu. Đọc trước để khỏi hiểu nhầm.

### Hai phần của sản phẩm

| Từ dùng | Nghĩa |
|---|---|
| **Chợ tin đăng** (Marketplace) | Nơi đăng tin, tìm kiếm và liên hệ giữa người thuê và người cho thuê. Miễn phí với người thuê; chủ trọ đăng tin cũng miễn phí. |
| **Khu quản lý vận hành** (SaaS) | Bộ phần mềm dành cho chủ trọ: quản lý khu trọ, phòng, người ở, hợp đồng, điện nước, hóa đơn, báo cáo. Cần mua gói dịch vụ. |
| **Khu người ở** | Phần dành cho người đang thuê: xem phòng, hóa đơn, hợp đồng của mình, báo sự cố, gửi chỉ số điện nước. Có trên web và ứng dụng di động. |

### Các đối tượng chính

| Từ dùng | Nghĩa |
|---|---|
| **Khu trọ** (Property) | Một khu hoặc tòa nhà chứa nhiều phòng. Cấp quản lý thứ nhất. |
| **Phòng** (Room) | Một phòng cụ thể bên trong khu trọ. Cấp quản lý thứ hai. |
| **Người ở** (Occupancy) | Bản ghi "ai đang ở phòng nào" do chủ trọ tạo và quản lý. Có thể gắn với một tài khoản, hoặc chỉ gồm tên và số điện thoại. **Đây là bản ghi dữ liệu, không phải một vai trò tài khoản.** |
| **Tin cho thuê** | Tin do chủ trọ đăng để tìm khách thuê. |
| **Tin của người tìm thuê** | Tin do người thuê đăng: tin tìm phòng, hoặc tin tìm người ở ghép. |

### Vai trò tài khoản

| Từ dùng | Nghĩa |
|---|---|
| **Khách chưa đăng nhập** | Chưa có phiên làm việc. Đây là một trạng thái, không phải vai trò. |
| **người thuê** | Vai trò của bên thuê: người tìm phòng và người đang thuê. Mặc định sau khi đăng ký. |
| **chủ trọ** | Vai trò của bên cho thuê. Có thêm quyền cho thuê và quản lý vận hành, **không kế thừa** vai trò nào. |
| **nhân viên vận hành** | Nhân viên vận hành nền tảng: kiểm duyệt tin, xử lý báo cáo. |
| **quản trị viên** | Quản trị hệ thống. Làm được các việc kiểm duyệt như nhân viên vận hành, cộng thêm quản lý tài khoản, danh mục và gói dịch vụ. |

### Các khái niệm khác

| Từ dùng | Nghĩa |
|---|---|
| **Liên kết người ở** | Gắn một tài khoản người thuê vào bản ghi người ở của một phòng. Chủ trọ thực hiện; người được gắn nhận thông báo và tự gỡ được nếu bị gắn nhầm. |
| **Dùng thử** | Chủ trọ dùng khu quản lý vận hành miễn phí có thời hạn (mặc định một tháng) trước khi mua. |
| **Chế độ chỉ xem** | Khi gói dịch vụ hết hạn: vẫn xem và xuất được dữ liệu, nhưng không tạo, sửa, xóa. Dữ liệu được giữ nguyên. |
| **Đẩy tin nổi bật** (Boost) | Trả phí để tin đăng được ưu tiên hiển thị. |
| **Đánh giá xác thực** | Đánh giá khu trọ chỉ người từng ở thật mới viết được, nhằm chống đánh giá giả. |
| **Báo cáo sự cố** | Người ở báo hỏng hóc kèm ảnh; chủ trọ tiếp nhận và xử lý theo các bước có sẵn. |
| **Xóa mềm** | Đánh dấu đã xóa và ẩn khỏi danh sách, nhưng vẫn giữ trong cơ sở dữ liệu để khôi phục hoặc đối chiếu. |
| **Danh mục** | Bảng dữ liệu do quản trị viên quản lý, thêm sửa được mà không phải đổi mã nguồn — loại hình cho thuê, tiện ích, gói đẩy tin, gói dịch vụ. |
| **`residencyStatus`** | Tình trạng ở trọ của một tài khoản, **suy từ dữ liệu người ở**, không lưu thành cột riêng. Ba giá trị: `NONE` — chưa được liên kết vào phòng nào; `ACTIVE` — đang ở; `PAST` — đã rời đi, chỉ xem lại lịch sử và vẫn viết được đánh giá khu từng ở. |
| **Mã hành chính** | Mã tỉnh và mã phường/xã dùng để lọc khi tìm kiếm; tên dùng để hiển thị. Theo mô hình hai cấp áp dụng từ 01/07/2025. |

### Thuật ngữ kỹ thuật (dành cho team phát triển)

| Từ dùng | Nghĩa |
|---|---|
| **Domain** | Một vùng nghiệp vụ có ranh giới rõ, dữ liệu và quy tắc riêng. Hệ thống chia thành hai domain: chợ tin đăng và quản lý vận hành. |
| **Shared Kernel** | Nhóm chức năng dùng chung cho cả hai domain: tài khoản, hồ sơ, tệp tin, thông báo, nhắn tin. |
| **Shell** | Một khu giao diện riêng biệt trên web, có bố cục và điều hướng riêng. Hệ thống có ba shell: công khai, chủ trọ, người ở. |
| **Entity** | Một bảng dữ liệu trong hệ thống, ví dụ Phòng hay Hợp đồng. Khác với vai trò tài khoản. |
| **Webhook** | Cổng thanh toán gọi ngược về máy chủ để báo kết quả giao dịch. Đây là nơi **duy nhất** kích hoạt quyền lợi sau khi trả tiền, vì người dùng có thể đóng trình duyệt giữa chừng. |

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Hai trụ cột của hệ thống

Trọ Nhanh là nền tảng Web/Mobile gồm **hai trụ cột** chạy trên cùng một hệ thống tài khoản và dữ liệu:

**Trụ cột A — Marketplace (đăng tin & tìm kiếm):**
Kết nối nhu cầu thuê và cho thuê bất động sản lưu trú (phòng trọ, căn hộ dịch vụ, căn hộ chung cư). Gồm: tin cho thuê do Landlord đăng (tin cho thuê), tin tìm phòng và tin tìm người ở ghép do Tenant đăng, cùng tìm kiếm/lọc, yêu thích, **đánh giá khu trọ (verified)**, kiểm duyệt và báo cáo vi phạm. Người dùng liên hệ với người đăng qua **hai kênh: nhắn tin trong app và gọi điện**.

**Trụ cột B — SaaS quản lý vận hành (cho Landlord):**
Công cụ quản lý việc cho thuê theo hai cấp: **khu trọ** (`Property`) rồi tới từng **phòng**
(`Room`). Chủ trọ quản lý người ở, hợp đồng (lưu bản chụp, không ký điện tử), chỉ số điện
nước, hóa đơn, ghi nhận thu tiền, nhắc hạn và báo cáo kinh doanh. Cần gói dịch vụ còn hiệu lực
mới dùng được.

Hai trụ cột liên kết qua hành động **"Tạo tin đăng từ phòng trống"** và cơ chế **gắn tin đăng vào khu** (`RentalListing.propertyId`). Room và RentalListing là hai entity độc lập về vòng đời, nhưng có **quy tắc đồng bộ chống tin ảo**: phòng đã có người thuê thì tin gắn với phòng đó không được tiếp tục hiển thị như phòng trống.

### 1.2 Cơ chế thanh toán (nền tảng KHÔNG giữ tiền)

Nền tảng **không cầm, không trung chuyển tiền thuê** giữa người ở và chủ trọ (tránh nghĩa vụ pháp lý của trung gian thanh toán — AS-002). Hai dòng tiền tách bạch bằng **hai entity khác nhau**:

- **Tiền thuê (Tenant/người ở → chủ trọ), ngoài nền tảng:** mỗi **Property** lưu thông tin nhận tiền riêng (ngân hàng, STK, tên chủ TK → sinh **VietQR**). Hóa đơn xuất kèm STK + VietQR (QR nhúng **số tiền** và **nội dung chuyển khoản = mã hóa đơn** để chủ trọ đối chiếu tay dễ). Người ở chuyển khoản thẳng hoặc trả tiền mặt; chủ trọ bấm "Đã thu" → ghi bản ghi khoản thu (`Cash`/`BankTransfer`). App chỉ **ghi nhận**, không đối soát ngân hàng (để dành tương lai).
- **Phí nền tảng (Landlord → Trọ Nhanh), qua payment gateway:** boost và gói SaaS đi qua cổng thanh toán/cổng nội địa, ghi vào entity giao dịch phí nền tảng (trạng thái `Pending/Success/Failed`, có `idempotencyKey` chống tính phí trùng, kích hoạt quyền lợi **chỉ tại webhook** — mục 4.9).

> **Lý do tách 2 entity:** hai nghiệp vụ khác hẳn nhau — một bên là *ghi chép tay* của chủ trọ (không có gateway, không có trạng thái chờ), một bên là *giao dịch điện tử* (có Pending/Failed, webhook, idempotency). Gộp chung một bảng khoản thu với FK nullable chéo nhau dễ sinh bản ghi "mồ côi" và validation rối.

### 1.3 Ranh giới hệ thống (System Boundary)

**Trong phạm vi:** 19 module ở Mục 3; web responsive (3 shell) + **app mobile cho người ở**; backend API; database; lưu trữ file (ảnh tin, bản chụp hợp đồng, ảnh sự cố, ảnh chỉ số đồng hồ, file hóa đơn); nhắn tin trong app; đánh giá khu trọ; **báo cáo sự cố**; hiển thị số tài khoản kèm mã QR và ghi nhận thu tiền.

**Ngoài phạm vi:** ký hợp đồng điện tử; đặt lịch xem phòng có cấu trúc; cầm/thu hộ tiền thuê và đối soát ngân hàng tự động; eKYC; dịch vụ môi giới; **mọi hình thức hỗ trợ kê khai hay tính thuế**; **tích hợp Zalo** (không nút, không deep link — AS-001).

### 1.4 Hệ thống ngoài cần tích hợp (External Systems)

| Hệ thống ngoài | Mục đích | Ghi chú |
|---|---|---|
| Dịch vụ gửi tin nhắn SMS | **Chỉ dùng để gửi mã xác thực khi đăng ký và khôi phục mật khẩu** | Mọi nhắc hạn đều đi qua thông báo trong ứng dụng, không gửi SMS |
| Map service | Hiển thị vị trí phòng, tính khoảng cách tiện ích | Geocoding địa chỉ khi đăng tin (AS-018) |
| Cổng thanh toán — **PayOS** | Thu **phí dịch vụ của nền tảng**: đẩy tin nổi bật và gói phần mềm quản lý | Không xử lý tiền thuê nhà. Chọn PayOS vì mô hình tạo link ở máy chủ rồi nhận kết quả qua webhook khớp đúng luồng đã thiết kế, và không đòi hỏi giấy phép kinh doanh như các cổng truyền thống |
| Lưu trữ tệp | Ảnh tin, bản chụp hợp đồng, ảnh sự cố, ảnh chỉ số, file hóa đơn | Cơ sở dữ liệu chỉ lưu đường dẫn; tệp riêng tư có phân quyền |

### 1.5 Cơ chế liên hệ giữa người dùng

Đúng hai kênh: **nhắn tin trong ứng dụng** và **gọi điện**.

Điểm hay bị hiểu nhầm: tin đăng **có** hiển thị số điện thoại, vậy nhắn tin để làm gì? Vì hai
phía có nhu cầu trái ngược nhau.

*Người đăng tin chủ động công khai số của mình* — họ muốn khách gọi tới, nên số điện thoại là
thông tin họ tự nguyện đưa lên. Khách chưa đăng nhập chỉ thấy số bị che một phần, đăng nhập
rồi mới thấy đầy đủ.

*Người đi hỏi phòng thì ngược lại* — mới hỏi vài câu mà đã phải để lại số thì có nguy cơ bị
gọi lại nhiều lần hoặc số bị dùng vào việc khác. Nhắn tin cho họ hỏi trước, khi nào thấy ưng
mới đưa số của mình.

Nói gọn: **nhắn tin bảo vệ số điện thoại của người đi hỏi, không phải của người đăng tin**.

Hệ thống **không tích hợp Zalo**; ai muốn dùng Zalo thì tự lấy số hiển thị trên tin. Không mở
được hội thoại với tin đăng của chính mình.

### 1.6 Kiến trúc 2 Domain + Shared Kernel; frontend 2 shell + 2 zone

Để hai nhóm Dev phát triển song song mà ít giẫm chân, hệ thống tách rõ thành **2 bounded context** và **1 shared kernel**. Đây là tách **logic** (cùng 1 codebase backend, cùng 1 database) — KHÔNG phải tách 2 service/2 DB riêng.

> **Lý do không tách hẳn 2 service + 2 DB:** nhiều flow đi xuyên 2 domain trong một thao tác (vd tạo hợp đồng → đổi trạng thái phòng → sinh thông báo). Nếu 2 DB riêng, các thao tác này mất tính `transaction` (đảm bảo "thành công hết hoặc rollback hết"), phải xử lý bằng saga/event — phức tạp gấp nhiều lần, quá sức cho team nhỏ. Tách logic giữ được transaction đơn giản mà vẫn có ranh giới sạch để **sẵn sàng tách service sau này**.

**Domain A — Marketplace** (hướng người thuê, public): tin cho thuê + tin nhu cầu (Module 3, 4); tìm kiếm & lọc (12); yêu thích (11); đánh giá khu trọ (18); kiểm duyệt & báo cáo (13 phần tin, 14).

**Domain B — Property Management / SaaS** (hướng chủ trọ, có gating): khu & phòng (5, 6); người ở & hợp đồng (7, 8); hóa đơn/điện nước/thu tiền (9); gói SaaS (15); báo cáo kinh doanh (16); **khu dành cho người ở (19)**.

**Shared Kernel** (dùng chung): Auth & User (1); Profile (2); Notification & Reminder (10); Messaging (17); Media (xuyên suốt).

> **Lý do Residency là module trong SaaS, không phải bounded context thứ ba:** (a) *phụ thuộc* — người ở chỉ sinh ra từ người ở do chủ trọ tạo, không có SaaS thì không tồn tại người ở; (b) *tránh phụ thuộc vòng* — nếu tách riêng, hộp thư sự cố của chủ trọ phải đọc báo cáo sự cố (SaaS → Residency) trong khi màn "hóa đơn của tôi" phải đọc hóa đơn (Residency → SaaS), khóa vòng thì mất luôn khả năng tách service sau này; (c) *không cắt quy trình* — chỉ số người ở gửi lên là giai đoạn nháp của chỉ số điện nước, tách context thì thao tác duyệt phải ghi xuyên context; (d) *cùng ngôn ngữ nghiệp vụ* — sự cố, bảo trì, hóa đơn đều là ngôn ngữ vận hành BĐS. Nguyên tắc: **bounded context chia theo quyền sở hữu dữ liệu, không chia theo đối tượng người dùng**; khác đối tượng thì tách ở tầng giao diện và API namespace.

**Nguyên tắc phụ thuộc:** Marketplace và SaaS **được phép gọi xuống** Shared Kernel, nhưng **không gọi chéo trực tiếp** vào table của nhau — giao tiếp qua *interface* nội bộ. Các điểm nối hợp lệ giữa 2 domain (một chiều, qua interface): (a) "Tạo tin từ phòng trống" (SaaS → Marketplace); (b) đồng bộ trạng thái tin khi Room đổi trạng thái (SaaS → Marketplace); (c) Marketplace đọc dữ liệu Review/avgRating gắn Property; (d) ReviewService đọc Contract/Occupancy để xác minh quyền review.

**Frontend — tách 3 shell, shell Workspace chia 2 zone:**

| Shell | Phạm vi route | Người dùng | Nhóm Dev |
|---|---|---|---|
| **Public/Tenant shell** | `/`, `/tim-phong`, `/phong/{id}`, `/khu-tro/{slug}`, `/tai-khoan/*` | Guest, Tenant | Nhóm A |
| **Management Workspace shell** | `/chu-tro/*` | Landlord | Nhóm B |
| **Khu người ở** | `/nguoi-o/*` | Tài khoản đã được liên kết với một phòng (đang ở hoặc đã rời) | Nhóm C |

**App mobile người ở** dùng chung API với Residency shell; chủ trọ dùng web (Workspace là dashboard nhiều bảng biểu, hợp màn hình lớn).

> **Nguyên tắc bất biến — app người ở là lớp cộng thêm, không phải điều kiện tiên quyết:** mọi nghiệp vụ của chủ trọ phải chạy trọn vẹn ngay cả khi **không một người ở nào có tài khoản**. Occupancy fallback (`userId` null) luôn hoạt động đầy đủ. Giữ được điều này thì việc mở giao diện cho người ở chỉ nâng cấp trải nghiệm, không tạo điểm gãy phụ thuộc vào việc người ở chịu cài app.

Bên trong shell Workspace:

| Zone | Màn hình | Điều kiện vào | Gating? |
|---|---|---|---|
| **Đăng tin** (thuộc chợ tin đăng) | B4 Quản lý tin, B5 Đăng tin cho thuê — route nằm ngoài `/chu-tro` | Vai trò chủ trọ | **Không** — đăng tin luôn miễn phí |
| **Zone Quản lý vận hành** (SaaS) | B1–B3, B6–B16 | Role Landlord + `subscriptionStatus ∈ {TRIAL, ACTIVE}` | Có; `READ_ONLY` chỉ đọc; `NONE` thấy màn mời dùng thử |

Sidebar Workspace hiển thị đúng 2 nhóm ("Tin đăng — miễn phí" / "Quản lý vận hành — SaaS") để chủ trọ luôn thấy rõ cái gì free, cái gì thuộc gói — vừa minh bạch vừa là điểm chạm upsell tự nhiên.

Ba shell **chung component library, chung API client, chung 1 web app** (route-prefix khác nhau) — chưa tách subdomain để khỏi tốn nhiều build/deploy. Ranh giới thiết kế sao cho **về sau tách `app.tronhanh.vn` chỉ là đổi routing**, không phải viết lại.

**Stack frontend & mobile:**

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Web (cả 3 shell) | **Next.js (App Router)** | SSR cho trang tin đăng để Google index được — SEO là kênh thu hút người thuê; hệ sinh thái UI phong phú |
| App người ở | **Expo React Native** | Cùng React và TypeScript với web: dùng chung kiểu dữ liệu, Zod schema và tư duy định tuyến theo thư mục |
| Backend | **NestJS · TypeScript · Node 22 LTS** | Cùng ngôn ngữ với web và mobile nên dùng chung được định nghĩa dữ liệu; cấu trúc module của NestJS ánh xạ thẳng sang hai domain nghiệp vụ |
| Tổ chức mã nguồn | **Một monorepo `tro-nhanh`** (pnpm workspace + Turborepo): `apps/web`, `apps/mobile`, `apps/api` cùng `packages/schemas`, `types`, `constants`, `utils`, `config` | Cả ba ứng dụng cùng hệ TypeScript nên dùng chung được định nghĩa dữ liệu; sửa một trường là cả ba báo lỗi biên dịch ngay |
| Định nghĩa dữ liệu dùng chung | **Zod schema** trong `packages/schemas` | Một nguồn chân lý duy nhất: backend dùng để kiểm tra dữ liệu đầu vào, web và mobile dùng cho biểu mẫu, kiểu dữ liệu suy ra từ chính schema. Tài liệu API sinh từ NestJS chỉ để người đọc, không còn là cầu nối kỹ thuật |
| Styling | **Tailwind CSS (web) + NativeWind (mobile)** | Chung ngôn ngữ utility-first và **chung một file preset** (màu, font, spacing) đặt trong `packages/config` — đổi màu thương hiệu một chỗ, cả web lẫn app đổi theo |

> **Ràng buộc version cần tuân thủ:** NativeWind bản ổn định yêu cầu **Tailwind v3** (`tailwindcss@^3.4.17`) cùng peer dependency `react-native-reanimated` và `react-native-safe-area-context`; cấu hình theo kiểu v3 (`tailwind.config.js` + `presets: [require("nativewind/preset")]`). Vì `create-next-app` mặc định cài Tailwind v4 (cấu hình CSS-first bằng `@theme`, bỏ file config), **phải chỉ định Tailwind v3 khi khởi tạo web** — nếu không sẽ không dùng chung được preset. NativeWind v5 (hỗ trợ Tailwind v4) còn ở giai đoạn pre-release, để dành cho lần nâng cấp sau.

> **Kỳ vọng đúng về mức chia sẻ:** NativeWind cho **chung ngôn ngữ thiết kế và preset**, KHÔNG cho dùng chung component — `View`/`Text` của React Native khác `div`/`p` của web, và React Native không có CSS grid thật. Giao diện vẫn viết riêng cho từng nền tảng.

Cấu trúc chống lỗi lan: mỗi shell là một **route group** riêng của App Router (`(public)`, `(workspace)`, `(residency)`) với layout và error boundary riêng — lỗi ở layout Workspace không kéo sập trang công khai. Thêm **ESLint rule chặn import chéo** giữa các thư mục `features/*` (nguyên tắc giống hệt "không gọi chéo domain" ở backend), **CODEOWNERS** theo thư mục, và CI bắt buộc typecheck + lint + build trước khi merge. Thư mục `shared/` là vùng nhạy cảm — sửa cần hai người review vì đây là chỗ duy nhất thực sự có thể gây lỗi toàn cục.

### 1.7 Gói dịch vụ của chủ trọ và quyền vào khu quản lý

Chủ trọ dùng nền tảng ở hai mức, tách bạch rõ:

**Đăng tin cho thuê là miễn phí.** Ai đã là chủ trọ thì đăng tin, sửa tin, đẩy tin nổi bật
không cần mua gì. Đây là phần thuộc chợ tin đăng.

**Khu quản lý vận hành cần mua gói.** Quản lý khu trọ, phòng, người ở, hợp đồng, hóa đơn,
điện nước, báo cáo — những việc này nằm trong bộ phần mềm quản lý và cần gói dịch vụ còn hiệu
lực. Chủ trọ được dùng thử miễn phí một thời gian trước khi quyết định mua.

**Bốn trạng thái gói dịch vụ:**

| Trạng thái | Khi nào | Làm được gì trong khu quản lý |
|---|---|---|
| Chưa dùng | Chưa từng mở khu quản lý | Chỉ thấy lời mời dùng thử |
| Dùng thử | Đã bấm dùng thử | Dùng gần như đầy đủ, giới hạn nhẹ về số khu và số phòng; thời hạn mặc định một tháng |
| Đang hiệu lực | Đã mua gói, còn hạn | Đầy đủ theo hạn mức của gói đã mua |
| Hết hạn | Hết thời gian dùng thử hoặc hết hạn gói | Chỉ xem và xuất dữ liệu, không tạo sửa xóa. **Dữ liệu được giữ nguyên** |

Khi hết hạn, phần chợ tin đăng và nhắn tin **không bị ảnh hưởng** — chủ trọ vẫn đăng tin và
nhận khách bình thường. Chỉ khu quản lý vận hành chuyển sang chế độ chỉ xem. Giữ nguyên dữ
liệu là điều bắt buộc: xóa dữ liệu vận hành của khách hàng vì họ quên gia hạn là cách nhanh
nhất để mất họ vĩnh viễn.

**Luồng chủ trọ mở khu quản lý lần đầu:**

1. Tài khoản đang là người thuê, bấm "Trở thành chủ trọ" → tài khoản chuyển thành chủ trọ.
2. Vào khu quản lý, hệ thống mời chọn: dùng thử miễn phí hoặc mua gói ngay.
3. Nếu mua: thanh toán qua cổng thanh toán — đây là **phí dịch vụ của nền tảng**, không dính
 dáng gì tới tiền thuê nhà.
4. Làm ba bước khởi tạo: tạo khu trọ kèm thông tin tài khoản ngân hàng để sinh mã QR, thêm
 phòng, rồi tùy chọn thêm người ở và hợp đồng.
5. Gần hết hạn, hệ thống nhắc gia hạn. Hết hạn thì chuyển sang chế độ chỉ xem.

Gia hạn có thể chọn lại **thời hạn** khác với lần trước (ví dụ lần đầu mua một năm, gia hạn
mua ba năm) — đây là đổi thời hạn, không phải đổi sang một loại gói có tính năng khác.

*Quy tắc áp dụng: BR-013, BR-015 — xem Mục 5.*

### 1.8 Vai trò tài khoản

Hệ thống có bốn vai trò. **Mỗi tài khoản mang đúng một vai trò**, không có chuyện một tài
khoản vừa là người này vừa là người kia.

| Vai trò | Là ai |
|---|---|
| `TENANT` | Người tìm phòng và người đang thuê |
| `LANDLORD` | Chủ trọ, người cho thuê phòng |
| `STAFF` | Nhân viên vận hành nền tảng |
| `ADMIN` | Quản trị hệ thống |

#### Quyền chia theo bốn tầng, không tầng nào chồng lấn

Đây là điểm cốt lõi của mô hình. Thay vì để vai trò này kế thừa vai trò kia, hệ thống **đẩy
các quyền mà nhiều bên cùng cần xuống tầng "đã đăng nhập"**:

| Tầng | Điều kiện | Gồm những gì |
|---|---|---|
| **Đã đăng nhập** | Vai trò `TENANT` hoặc `LANDLORD` | Xem tin, tìm kiếm, lưu tin, nhắn tin, báo cáo vi phạm, đăng tin tìm phòng và tin ở ghép |
| **Chủ trọ** | Vai trò `LANDLORD` | Đăng tin cho thuê, đẩy tin nổi bật, quản lý khu trọ, phòng, người ở, hợp đồng, hóa đơn |
| **Người đang ở** | **Suy từ dữ liệu** — có bản ghi người ở đã liên kết | Xem phòng đang thuê, hợp đồng và hóa đơn của mình, báo sự cố, gửi chỉ số, viết đánh giá khu |
| **Nội bộ** | Vai trò `STAFF` hoặc `ADMIN` | Kiểm duyệt tin, xử lý báo cáo; quản trị viên thêm quyền quản lý tài khoản, danh mục, gói dịch vụ |

**Tài khoản nội bộ không thuộc tầng "đã đăng nhập".** Nhân viên vận hành và quản trị viên
không lưu tin, nhắn tin hay đăng tin trên chợ — họ là người kiểm duyệt hoạt động đó, để họ
tham gia sẽ lẫn lộn giữa người chơi và trọng tài. Ai trong đội vận hành muốn đi thuê phòng thì
dùng một tài khoản cá nhân riêng.

Nhờ cách chia này, **không cần cơ chế kế thừa vai trò nào cả**. Chủ trọ vẫn lưu tin và nhắn
tin được, vì đó là quyền của tầng "đã đăng nhập" chứ không phải quyền riêng của người thuê.

Tầng "người đang ở" cố ý **không gắn với vai trò**. Một chủ trọ đang đi thuê nhà nơi khác vẫn
xem được phòng mình thuê, vì điều kiện là *có bản ghi người ở đã liên kết*, không phải *mang
vai trò người thuê*.

#### Nâng cấp thành chủ trọ

Tài khoản mặc định sau khi đăng ký là `TENANT`. Khi muốn cho thuê, người dùng bấm "Trở thành
chủ trọ" và vai trò đổi thành `LANDLORD`.

Đây là thao tác **một chiều, không có đường quay lại** — vì quay lại sẽ khiến các khu trọ và
hợp đồng đang quản lý bơ vơ. Người nâng cấp **không mất gì**: tin đã lưu, tin tìm phòng đã
đăng, phòng đang thuê vẫn truy cập được, vì những quyền đó nằm ở tầng "đã đăng nhập" và tầng
dữ liệu.

Sau khi đổi vai trò **phải cấp lại phiên đăng nhập**, vì phiên cũ vẫn đang mang vai trò cũ.
Giao diện gọi làm mới phiên ngay sau khi nâng cấp thành công rồi mới chuyển trang.

#### Ba thứ hay bị nhầm là vai trò nhưng không phải

**Gói dịch vụ không phải vai trò.** Chủ trọ mua gói hay chưa mua thì vai trò vẫn là
`LANDLORD`; chỉ khác nhau ở phạm vi chức năng mở ra, như mô tả ở mục 1.7.

**"Người đang ở" không phải vai trò.** Đó là một bản ghi ghi nhận tài khoản nào đang ở phòng
nào. Làm thành vai trò sẽ đẻ ra câu hỏi khó trả lời: hết hợp đồng thì có gỡ vai trò không, mà
gỡ rồi thì còn xem lại lịch sử và viết đánh giá được nữa không.

**Quyền sở hữu dữ liệu không phải vai trò.** Hai chủ trọ cùng mang vai trò `LANDLORD` nhưng
mỗi người chỉ đụng được khu của chính mình. Đây là kiểm tra ở tầng dữ liệu, tách hẳn khỏi tầng
vai trò. Trộn hai tầng này là nguồn gốc của mọi mô hình phân quyền rối rắm.

#### Nguồn thông tin cho giao diện

Sau khi đăng nhập, giao diện gọi **`GET /me`** một lần để biết tài khoản này mang vai trò gì,
gói dịch vụ đang ở trạng thái nào, và có đang ở trọ chỗ nào không — rồi dựa vào đó mà hiển
thị menu. Không tự suy đoán từ dữ liệu lưu trong trình duyệt.

`GET /me` trả về ba nhóm thông tin, tương ứng ba tầng độc lập:

| Trường | Ý nghĩa | Giá trị |
|---|---|---|
| `role` | Vai trò của tài khoản — **một giá trị duy nhất** | `TENANT` / `LANDLORD` / `STAFF` / `ADMIN` |
| `subscriptionStatus` | Trạng thái gói dịch vụ — chỉ có nghĩa với chủ trọ | `NONE` / `TRIAL` / `ACTIVE` / `READ_ONLY` |
| `residencyStatus` | Tình trạng ở trọ — suy từ dữ liệu người ở | `NONE` / `ACTIVE` / `PAST` |
| `limits` | Hạn mức của gói đang dùng — số khu, số phòng tối đa | Để giao diện khóa nút tạo mới khi chạm hạn mức |

Vai trò nằm trong phiên đăng nhập vì gần như không đổi. Hai trạng thái còn lại **không nằm
trong phiên** mà luôn tính lại từ dữ liệu mỗi lần gọi — vì chúng thay đổi theo thời gian, nhét
vào phiên sẽ có khoảng thời gian hệ thống mở hoặc khóa sai.

Không có giá trị `PENDING` cho `residencyStatus`: liên kết người ở có hiệu lực ngay (BR-029),
nên không tồn tại trạng thái chờ.

**Khi giao diện chặn, hệ thống vẫn kiểm tra lại.** Việc ẩn nút hay chặn đường dẫn ở giao diện
chỉ để trải nghiệm mượt; mọi yêu cầu gửi lên đều được kiểm tra quyền lại từ đầu.

**Quy ước quay lại sau đăng nhập:** mọi tình huống khách chưa đăng nhập bị yêu cầu đăng nhập —
nhắn tin, lưu tin, xem số điện thoại, báo cáo tin — đều ghi nhớ nơi họ đang đứng, đăng nhập
xong quay về đúng chỗ đó, mở lại hộp thoại liên hệ hoặc giữ nguyên biểu mẫu đang nhập dở.

*Quy tắc áp dụng: BR-013, BR-016 — xem Mục 5.*

---

## 2. NGƯỜI DÙNG HỆ THỐNG

### 2.1 Khách chưa đăng nhập

Khách chưa đăng nhập **không phải một vai trò**, mà là trạng thái chưa có phiên làm việc.

Xem được: danh sách tin cho thuê, tìm kiếm và lọc, trang chi tiết tin, trang khu trọ công
khai kèm đánh giá, số điện thoại ở dạng che một phần.

Không làm được: nhắn tin, xem số điện thoại đầy đủ, lưu tin, đăng tin, và **báo cáo vi phạm**.
Việc bắt buộc đăng nhập mới được báo cáo là có chủ đích: cho báo cáo ẩn danh là mở đường cho
spam và cho đối thủ dìm hàng loạt, đồng thời không truy vết được người báo cáo sai sự thật.

### 2.2 Bốn vai trò

**người thuê — bên thuê.** Mọi tài khoản sau khi đăng ký đều là người thuê.

Làm được: tất cả những gì khách chưa đăng nhập làm được, cộng thêm nhắn tin và gọi cho người
đăng tin, lưu tin yêu thích, đăng tin tìm phòng và tin tìm người ở ghép, báo cáo vi phạm.

Nếu đang thuê một phòng có trong hệ thống và tài khoản đã được chủ trọ liên kết vào phòng đó,
người thuê còn xem được khu "Phòng của tôi": thông tin phòng đang ở, hợp đồng, hóa đơn hằng
tháng kèm mã thanh toán, gửi báo cáo sự cố, gửi chỉ số điện nước nếu chủ trọ bật tính năng,
nhận thông báo, và viết đánh giá khu trọ đã ở.

**chủ trọ — bên cho thuê.** Làm được mọi việc của tầng "đã đăng nhập" (xem tin, lưu tin, nhắn tin), cộng thêm:

Đăng và quản lý tin cho thuê, đẩy tin nổi bật. Phần này miễn phí.

Quản lý vận hành khi gói dịch vụ còn hiệu lực: khu trọ, phòng, người ở, hợp đồng, chỉ số điện
nước, hóa đơn, ghi nhận thu tiền, báo cáo kinh doanh. Chủ trọ cũng nhận
và xử lý báo cáo sự cố từ người ở, duyệt chỉ số điện nước người ở gửi lên, và **báo cáo những
đánh giá mà mình cho là sai sự thật** để nhân viên vận hành xem xét.

chủ trọ có thể là chủ bất động sản hoặc người được ủy quyền đăng tin. Nền tảng không đóng
vai trò môi giới.

**nhân viên vận hành — nhân viên vận hành.** Kiểm duyệt tin đăng, xử lý báo cáo vi phạm đối với tin, tin
nhắn và đánh giá, hỗ trợ người dùng. Không quản lý tài khoản, không sửa danh mục, không đụng
gói dịch vụ.

**quản trị viên — quản trị hệ thống.** Làm được các việc kiểm duyệt như nhân viên vận hành, cộng thêm quản lý tài khoản
người dùng, danh mục hệ thống (loại hình cho thuê, tiện ích, khu vực, khoảng giá), gói
dịch vụ và phí đẩy tin, cùng bảng theo dõi toàn hệ thống.

### 2.3 Phân biệt "tài khoản người thuê" và "người đang ở"

Đây là chỗ dễ nhầm nhất, nên nói thật rõ:

| | Tài khoản người thuê | Người đang ở (bản ghi trong hệ thống) |
|---|---|---|
| Bản chất | Một **tài khoản** đăng nhập được | Một **bản ghi dữ liệu** ghi nhận ai đang ở phòng nào |
| Ai tạo ra | Chính người đó tự đăng ký | Chủ trọ nhập khi có người dọn vào |
| Có bắt buộc tài khoản không | Đương nhiên có | Không. Có thể chỉ gồm tên và số điện thoại |
| Thuộc quyền quản lý của ai | Chính chủ tài khoản | Chủ trọ sở hữu khu trọ đó |
| Liên hệ giữa hai bên | — | Bản ghi có thể được **liên kết** tới một tài khoản người thuê |

Nói gọn: *tài khoản người thuê trả lời câu hỏi "ai đang dùng hệ thống", còn bản ghi người
đang ở trả lời câu hỏi "ai đang ở phòng nào"*. Hai thứ này gặp nhau khi chủ trọ liên kết bản
ghi với một tài khoản — lúc đó người thuê mới xem được phòng và hóa đơn của mình trong ứng
dụng.

Chi tiết cách liên kết nằm ở Module 7.

*Quy tắc áp dụng: BR-007, BR-013, BR-032 — xem Mục 5.*

---

## 3. MODULE CHỨC NĂNG CHÍNH (19 MODULE)

> Nhãn cuối mỗi tiêu đề cho biết module thuộc phần nào: `[Dùng chung]` dùng cho cả hệ thống,
> `[Chợ tin đăng]` thuộc phần tìm và đăng tin, `[Quản lý vận hành]` thuộc bộ phần mềm của chủ trọ.

### Module 1 — Đăng ký, đăng nhập và quản lý tài khoản `[Dùng chung]`

**Mục đích:** cho người dùng tạo tài khoản, đăng nhập, và giữ phiên làm việc an toàn.

**Định danh tài khoản là số điện thoại.** Hệ thống **không dùng email** — không đăng ký bằng
email, không khôi phục mật khẩu qua email. Số điện thoại là duy nhất trên toàn hệ thống và là
kênh nhận mã xác thực. Hệ thống cũng **không hỗ trợ đăng nhập bằng Google hay mạng xã hội**.

**Chức năng:**
- Đăng ký bằng số điện thoại, xác thực bằng mã một lần gửi qua tin nhắn
- Đăng nhập, đăng xuất, duy trì phiên và làm mới phiên
- Quên mật khẩu: xác thực lại bằng mã một lần rồi đặt mật khẩu mới
- Đổi mật khẩu khi đang đăng nhập
- Nâng cấp tài khoản người thuê thành chủ trọ
- Quản trị viên khóa hoặc mở khóa tài khoản

**Ba trạng thái tài khoản:** *chờ xác thực* (đã đăng ký nhưng chưa nhập mã, chưa dùng được
gì), *hoạt động* (bình thường), *bị khóa* (không đăng nhập được; tin đăng của tài khoản tự ẩn
khỏi trang công khai, nhưng dữ liệu quản lý vận hành được giữ nguyên để khôi phục sau).

*Quy tắc áp dụng: BR-016, BR-028 — xem Mục 5.*

### Module 2 — Hồ sơ cá nhân `[Dùng chung]`

**Mục đích:** quản lý thông tin hiển thị và cách liên hệ của tài khoản (`Profile`).

**Chức năng:** cập nhật tên, ảnh đại diện, số điện thoại liên hệ; bật tắt các chỉ số nhạy cảm
trên báo cáo kinh doanh; yêu cầu xóa tài khoản.

Số điện thoại liên hệ hiển thị trên tin đăng có thể khác số dùng để đăng nhập; nếu chưa đặt
riêng thì hệ thống lấy luôn số đăng nhập.

Thông tin nhận tiền (ngân hàng, số tài khoản) **không nằm ở hồ sơ cá nhân** mà đặt theo từng
khu trọ — xem Module 5.

### Module 3 — Tin cho thuê `[Chợ tin đăng]`

**Mục đích:** chủ trọ đăng và quản lý tin cho thuê phòng (`RentalListing`).

#### Đăng tin không cần gì cả

Đây là điểm hay bị hiểu sai nhất, nên nói thẳng trước: **đăng tin là chức năng độc lập của chợ
tin đăng**. Ai đã là chủ trọ thì đăng tin được ngay — **không cần tạo khu trọ nào trong hệ
thống, không cần mua gói dịch vụ, không cần dùng phần quản lý vận hành**. Đây là đường vào
chính của nền tảng và nó miễn phí.

Một người chỉ có một phòng cho thuê, không quan tâm phần mềm quản lý, vẫn dùng nền tảng bình
thường như mọi trang đăng tin khác.

#### Các bước đăng tin

Thông tin cơ bản (tiêu đề, loại hình, địa chỉ, diện tích, giá, số liên hệ) → tiện ích trong
phòng và mô tả → ảnh, tối thiểu 3 tấm → các khoản chi phí (điện, nước, dịch vụ, cọc) → tiện
ích xung quanh (trường học, chợ, siêu thị… kèm khoảng cách) → quy định giờ giấc ra vào.

**Loại hình cho thuê là danh mục do quản trị viên quản lý**, không phải danh sách cố định
trong mã nguồn — để thêm loại mới không phải sửa code.

**Địa chỉ lưu hai phần:** mã tỉnh và mã phường/xã dùng để lọc khi tìm kiếm; tên phường/xã và
địa chỉ chi tiết dùng để hiển thị. Tách như vậy vì lọc cần mã ổn định, còn hiển thị cần tên
dễ đọc.

**Các khoản chi phí và tiện ích xung quanh lưu riêng**, không nhét thành cột cố định trên tin
đăng — để thêm loại chi phí hay loại tiện ích mới về sau không phải sửa cấu trúc dữ liệu.

Có thể lưu nháp giữa chừng. Các thao tác khác: sửa, ẩn, xóa, gia hạn, đẩy tin nổi bật.

**Đẩy tin nổi bật** chọn theo gói do quản trị viên định sẵn (mỗi gói có số ngày và giá riêng).
Thanh toán đi qua cùng một cơ chế với gói dịch vụ — xem Module 15. Thời điểm hết hạn đẩy tin
lưu trên tin đăng; **trạng thái đang nổi bật hay không suy ra từ thời điểm đó**, không giữ
thêm cờ riêng để tránh hai chỗ lệch nhau.

#### "Tạo tin từ phòng trống" — lối tắt, không phải điều kiện

Với chủ trọ **đã dùng** phần quản lý vận hành, hệ thống có thêm một lối tắt: bấm ngay từ một
phòng đang trống để tạo tin, các thông tin như diện tích, giá, tiện ích được điền sẵn theo
phòng đó. Chủ trọ sửa lại rồi gửi duyệt.

Đây thuần túy là tiện ích đỡ phải gõ lại. Ai không dùng phần quản lý vận hành thì vào thẳng
biểu mẫu đăng tin như bình thường, không thiếu chức năng nào.

#### Gắn tin vào khu trọ

Ngoài lối tắt trên, chủ trọ cũng có thể chọn thủ công một tin thuộc về khu trọ nào. Tin có gắn
khu thì được thêm hai thứ:

*Điểm đánh giá của khu hiện ngay trên tin*, giúp người thuê yên tâm hơn.

*Tự đồng bộ trạng thái* — phòng gắn với tin đó có người thuê thì tin không còn hiển thị như
phòng trống nữa. Đây là cơ chế chống tin ảo.

Tin không gắn khu vẫn chạy bình thường, chỉ là không có hai thứ trên. Nói cách khác, việc dùng
phần quản lý vận hành làm cho tin đăng **tốt hơn**, chứ không phải điều kiện để đăng tin.

#### Kiểm duyệt

Tin gửi lên qua bộ lọc từ khóa cấm rồi vào hàng đợi cho nhân viên vận hành duyệt. Sửa các
trường quan trọng (giá, địa chỉ, ảnh) thì phải duyệt lại; trong lúc chờ, tin tạm ẩn khỏi trang
công khai và giao diện cảnh báo trước khi lưu.

**Ràng buộc:** mỗi phòng chỉ có một tin đang chạy. Khu trọ và phòng gắn vào tin phải thuộc
chính chủ trọ đó.

*Quy tắc áp dụng: BR-001, BR-003, BR-005, BR-025, BR-026, BR-027 — xem Mục 5.*

### Module 4 — Tin của người tìm thuê `[Chợ tin đăng]`

**Mục đích:** người thuê chủ động đăng nhu cầu để chủ trọ tìm đến, thay vì chỉ đi tìm tin.

**Hai loại tin:**

*Tin tìm phòng* (`RoomWantedPost`) — khu vực mong muốn, khoảng giá, loại hình, diện tích tối thiểu, tiện ích cần
có, và thời điểm mong muốn dọn vào. Thời điểm này do người đăng tự nhập, dùng để chủ trọ lọc
ra những người sắp cần phòng.

*Tin tìm người ở ghép* (`RoommateWantedPost`) — vị trí phòng hiện tại, giá chia sẻ mỗi người, số người còn cần thêm,
yêu cầu với người ở ghép, ảnh phòng.

**Thao tác:** tạo, sửa, ẩn, xóa, gia hạn. Tin hiển thị 30 ngày rồi tự hết hạn; gia hạn thêm
30 ngày, không phải duyệt lại nếu không sửa nội dung. Mỗi người tối đa 2 tin đang hiển thị
cho mỗi loại. Tin nhu cầu cũng qua kiểm duyệt như tin cho thuê và cũng báo cáo được.

*Quy tắc áp dụng: BR-009, BR-010 — xem Mục 5.*

### Module 5 — Quản lý khu trọ `[Quản lý vận hành]`

**Mục đích:** chủ trọ quản lý các khu trọ (`Property`) của mình — đây là cấp quản lý thứ nhất, bên dưới mỗi
khu là các phòng.

**Chức năng:** tạo, sửa, xóa khu trọ (tên, địa chỉ, phường xã, số tầng, ghi chú); xem danh
sách khu kèm tổng số phòng và số phòng trống.

**Đơn giá mặc định của khu:** đơn giá điện, đơn giá nước và phí dịch vụ. Đây là giá dùng chung
cho mọi phòng trong khu, để chủ trọ không phải gõ lại mỗi tháng. Từng phòng có thể đặt giá
riêng đè lên (xem Module 6).

**Thông tin nhận tiền theo từng khu:** tên ngân hàng, số tài khoản, tên chủ tài khoản. Từ đó
hệ thống sinh mã QR để in lên hóa đơn. Đặt theo khu chứ không đặt chung một chỗ, vì chủ trọ
nhiều khu thường muốn tách dòng tiền để dễ đối chiếu.

**Trang khu công khai:** chủ trọ chủ động bật thì khu mới xuất hiện công khai và **đánh giá mới
được hiển thị**. Việc bật tắt chỉ quyết định hiển thị — người ở **vẫn viết được đánh giá bất kể
khu đang bật hay tắt**, đánh giá được lưu và tích lũy dần. Tắt đi thì trang khu và điểm đánh
giá ẩn khỏi trang công khai, nhưng đánh giá vẫn giữ nguyên — bật lại thì hiện lại như cũ.
được giữ lại** — bật lại thì hiện lại như cũ.

**Chức năng bật tắt cho từng khu:** cho phép người ở gửi chỉ số điện nước kèm ảnh đồng hồ hay
không (mặc định tắt) — xem Module 9.

**Ràng buộc:** không xóa được khu còn phòng đang cho thuê, đang giữ cọc, hoặc còn hợp đồng
hiệu lực. Số khu và số phòng tối đa phụ thuộc gói dịch vụ đã mua.

*Quy tắc áp dụng: BR-011, BR-024 — xem Mục 5.*

### Module 6 — Quản lý phòng `[Quản lý vận hành]`

**Mục đích:** quản lý từng phòng (`Room`) bên trong khu trọ — cấp quản lý thứ hai.

**Chức năng:** thêm, sửa, xóa phòng (mã phòng, tầng, diện tích, giá thuê, tiện ích, giờ giấc
ra vào, ghi chú); đổi trạng thái phòng; lọc danh sách theo trạng thái; tạo tin đăng từ phòng
đang trống.

**Bốn trạng thái phòng:** *còn trống*, *đã nhận cọc*, *đang cho thuê*, *tạm ẩn*. Trạng thái tự
đồng bộ với hợp đồng: tạo hợp đồng thì phòng chuyển sang đang cho thuê; hợp đồng kết thúc và
không còn hợp đồng nào hiệu lực thì hệ thống gợi ý chuyển phòng về còn trống. Trạng thái đã
nhận cọc do chủ trọ tự đặt vì việc nhận cọc diễn ra ngoài hệ thống.

**Đơn giá riêng của phòng:** mỗi phòng có thể đặt đơn giá điện, nước, phí dịch vụ riêng để đè
lên giá của khu. **Để trống nghĩa là dùng giá của khu; nhập số 0 nghĩa là miễn phí** — hai ý
này khác nhau, gộp lại là ra sai tiền hóa đơn, nên giao diện không bao giờ hiển thị ô trống
thành "chưa cấu hình".

**Ràng buộc:** mã phòng không trùng nhau trong cùng một khu. Phòng đang có tin chạy thì hiện
dấu hiệu nhận biết và không tạo được tin thứ hai. Chỉ xóa được phòng khi không còn hợp đồng
hiệu lực.

*Quy tắc áp dụng: BR-002, BR-031 — xem Mục 5.*

### Module 7 — Quản lý người ở `[Quản lý vận hành]`

**Mục đích:** ghi nhận ai đang ở phòng nào bằng bản ghi người ở (`Occupancy`), để chủ trọ quản lý và để người thuê theo dõi được
việc thuê của mình.

**Bản ghi người ở thuộc quyền quản lý của chủ trọ**, không phải một người dùng hệ thống. Chủ
trọ ghi được mọi người đang ở, kể cả người không dùng ứng dụng — đây là điều kiện để phần mềm
thay thế được cuốn sổ ghi tay. Ai muốn **dùng dịch vụ** của hệ thống (xem hóa đơn, báo sự cố,
đánh giá) thì bắt buộc phải có tài khoản, không có ngoại lệ.

**Thêm người ở:** chủ trọ nhập số điện thoại của người dọn vào.

- Nếu số đó **đã có tài khoản**: hệ thống hiện tên để chủ trọ đối chiếu, rồi liên kết bản ghi
 với tài khoản đó. Người thuê nhận **thông báo** "Bạn vừa được thêm vào phòng … thuộc khu
 …", kèm nút **"Không phải tôi"** để tự gỡ liên kết nếu bị thêm nhầm.
- Nếu số đó **chưa có tài khoản**: chủ trọ vẫn thêm được bằng tên và số điện thoại. Bản ghi
 hoạt động bình thường cho việc quản lý, chỉ là chưa gắn với tài khoản nào nên người đó chưa
 xem được gì trong ứng dụng. Khi nào họ đăng ký bằng đúng số điện thoại đó thì chủ trọ liên
 kết lại.

Không có bước chờ người thuê bấm đồng ý. Người thuê đã ký hợp đồng và đóng cọc ngoài đời rồi;
bắt họ xác nhận thêm một lần trong ứng dụng vừa thừa vừa tạo ra trạng thái lơ lửng không xử
lý được. Nút "Không phải tôi" đủ để bảo vệ trường hợp chủ trọ gõ nhầm số của người lạ.

**Các chức năng khác:** sửa thông tin người ở, ghi nhận kết thúc ở, xem lịch sử những người đã
từng ở một phòng.

**Một phòng có nhiều người ở.** Phòng ở ghép thì mỗi người là một bản ghi riêng, có tên và số
điện thoại riêng, liên kết tài khoản riêng. Trong số đó **một người là đại diện** đứng tên hợp
đồng và nhận hóa đơn. Mỗi bản ghi cũng ghi số nhân khẩu đi cùng (con nhỏ, người thân) để chủ
trọ nắm tổng số người thực tế trong phòng.

**Ngày kết thúc ở nghĩa là ngày đầu tiên người đó không còn ở nữa.** Chưa tới ngày đó thì vẫn
tính là đang ở; hệ thống hiển thị "sắp rời" kèm ngày để chủ trọ chuẩn bị. Quy ước này phải
thống nhất giữa giao diện và máy chủ, vì mỗi bên hiểu lệch một ngày là ra lệch cả hóa đơn.

**Ràng buộc:** dữ liệu người ở là dữ liệu riêng tư của chủ trọ.

*Quy tắc áp dụng: BR-007, BR-029 — xem Mục 5.*

### Module 8 — Hợp đồng thuê `[Quản lý vận hành]`

**Mục đích:** lưu lại thông tin hợp đồng thuê (`Contract`) giữa chủ trọ và người ở.

**Hệ thống không ký hợp đồng điện tử.** Hai bên vẫn ký hợp đồng giấy ngoài đời như bình
thường; hệ thống chỉ ghi lại các thông tin chính và **lưu bản chụp hợp đồng** để tra cứu, đối
chiếu khi cần. Việc tải bản chụp lên là tùy chọn, không bắt buộc.

**Chức năng:** tạo hợp đồng cho một phòng gắn với một người ở, gồm ngày bắt đầu, ngày kết
thúc, tiền thuê hằng tháng và tiền cọc; tải lên bản chụp hợp đồng dạng ảnh hoặc PDF; xem và
tải về; nhắc trước khi hợp đồng hết hạn; ghi nhận chấm dứt sớm kèm lý do.

**Ai xem được bản chụp:** chỉ chủ trọ sở hữu khu và người thuê được liên kết với hợp đồng đó.
File lưu ở khu vực riêng tư, mỗi lần xem hệ thống cấp một đường dẫn có thời hạn ngắn, không
để lộ ra ngoài.

**Ràng buộc chồng lấn:** một phòng tại một thời điểm chỉ có một hợp đồng đang hiệu lực. Khoảng
thời gian tính **đóng ở cả hai đầu** — hợp đồng cũ kết thúc ngày 31/12 và hợp đồng mới bắt đầu
cũng ngày 31/12 thì **bị coi là chồng lấn**, không tạo được. Nếu chuyển tiếp trong ngày thì
ngày kết thúc của hợp đồng cũ phải lùi lại một ngày. Hợp đồng là căn cứ để mở quyền
viết đánh giá khu trọ.

*Quy tắc áp dụng: BR-006, BR-008, BR-031 — xem Mục 5.*

### Module 9 — Điện nước, hóa đơn và thu tiền `[Quản lý vận hành]`

**Mục đích:** giúp chủ trọ ghi chỉ số điện nước (`UtilityReading`), lập hóa đơn (`Invoice`) và ghi nhận khoản thu (`Payment`) mỗi tháng, gửi hóa đơn
cho người ở và theo dõi ai đã đóng ai chưa.

**Nền tảng không giữ tiền thuê.** Hóa đơn kèm sẵn số tài khoản và mã QR của khu để người ở
chuyển khoản thẳng cho chủ trọ, hoặc trả tiền mặt. Hệ thống chỉ **ghi nhận** khoản đã thu.

#### 9.1 Ghi chỉ số điện nước

Mỗi tháng, với từng phòng đang có hợp đồng, chủ trọ nhập hai con số: **chỉ số cũ** (số trên
đồng hồ kỳ trước) và **chỉ số mới** (số hiện tại). Hệ thống tự lấy chỉ số cũ từ kỳ liền trước
nên chủ trọ thường chỉ cần nhập chỉ số mới.

Cách tính:

```
Số điện tiêu thụ = Chỉ số mới − Chỉ số cũ
Tiền điện = Số điện tiêu thụ × Đơn giá điện của khu
```

Nước tính theo đúng cách đó với đơn giá nước riêng.

**Đơn giá lấy theo ba tầng, tầng dưới đè tầng trên:**

| Tầng | Nơi đặt | Vai trò |
|---|---|---|
| 1 | Khu trọ | Giá mặc định cho mọi phòng trong khu |
| 2 | Phòng | Giá riêng của phòng, để trống thì dùng giá khu |
| 3 | Bản ghi chỉ số | **Chốt cứng tại thời điểm ghi**, không bao giờ đọc ngược lên hai tầng trên |

Tầng thứ ba là bắt buộc và quan trọng nhất: **đổi giá điện tháng 8 không được làm đổi số tiền
hóa đơn tháng 7**. Khi ghi chỉ số, hệ thống chép đơn giá đang áp dụng vào chính bản ghi đó;
sửa giá về sau chỉ ảnh hưởng các kỳ ghi sau.

Hệ thống dùng **một mức giá duy nhất cho mỗi loại**, không áp dụng bậc thang lũy tiến như bên
điện lực. Lý do: chủ trọ thu của người ở theo mức giá thỏa thuận ghi trong hợp đồng, không
phải theo biểu giá nhà nước. Nếu về sau cần tính bậc thang thì đó là một thay đổi riêng.

Hệ thống chặn nhập trùng: mỗi phòng, mỗi loại (điện hoặc nước), mỗi tháng chỉ có một bản ghi
chỉ số.

#### 9.2 Người ở gửi chỉ số kèm ảnh đồng hồ (tùy chọn)

Chủ trọ có thể **bật tính năng này cho từng khu trọ**, mặc định tắt. Khi bật, người ở gửi
được chỉ số ngay trong ứng dụng, kèm **ảnh chụp đồng hồ là bắt buộc**.

Chỉ số người ở gửi lên **chưa được tính vào hóa đơn ngay**. Nó nằm chờ trong hàng đợi để chủ
trọ xem ảnh và quyết định:

- **Xác nhận** — chỉ số trở thành chính thức và được dùng để tính tiền
- **Sửa số rồi xác nhận** — dùng số của chủ trọ, nhưng **vẫn lưu lại số người ở gửi ban đầu**
 để đối chiếu nếu sau này có tranh cãi
- **Từ chối** kèm lý do — người ở nhận thông báo và gửi lại

Người ở **không bao giờ** tự tạo ra chỉ số chính thức. Quyền quyết định cuối cùng luôn thuộc
chủ trọ. Lý do đặt tính năng ở cấp từng khu: một chủ trọ có thể muốn dùng cho khu ở xa mà
không dùng cho khu gần nhà, nơi họ tự đi ghi được.

#### 9.3 Lập hóa đơn

Sau khi có chỉ số, chủ trọ lập hóa đơn cho phòng theo tháng. Một hóa đơn gồm nhiều dòng:

| Dòng | Lấy từ đâu |
|---|---|
| Tiền phòng | Giá thuê ghi trong hợp đồng |
| Tiền điện | Kết quả tính ở mục 9.1 |
| Tiền nước | Kết quả tính ở mục 9.1 |
| Phí dịch vụ | Mức phí cố định của khu (rác, gửi xe, internet…) |
| Tiền cọc | Chỉ xuất hiện ở hóa đơn kỳ đầu, lấy theo hợp đồng |
| Khoản khác | Chủ trọ tự thêm, ví dụ tiền sửa chữa hư hỏng |

Tổng hóa đơn là tổng các dòng. Chủ trọ sửa hoặc thêm dòng trước khi gửi.

**Chỉ lập được hóa đơn cho phòng có hợp đồng đang hiệu lực.** Tiền thuê lấy thẳng từ hợp đồng,
không nhập tay — như vậy hóa đơn luôn khớp với thỏa thuận đã ký. Phòng trống hoặc phòng chưa
có hợp đồng thì không lập hóa đơn được.

Mỗi hợp đồng chỉ có một hóa đơn cho mỗi tháng. Trường hợp giữa tháng đổi người ở thì hai hợp
đồng khác nhau nên vẫn lập được hai hóa đơn cho cùng một phòng trong cùng tháng.

#### 9.4 Gửi hóa đơn cho người ở

Hóa đơn xuất ra dạng ảnh hoặc PDF, **kèm sẵn số tài khoản ngân hàng và mã QR của khu trọ**.
Mã QR đã nhúng sẵn số tiền phải trả và mã hóa đơn, nên người ở chỉ cần quét là chuyển đúng số
tiền, không phải gõ tay.

**Mã QR được sinh ngay tại máy người dùng**, không gọi dịch vụ tạo ảnh QR bên ngoài. Lý do:
mỗi lần gọi dịch vụ ngoài là một lần gửi số tài khoản và số tiền của chủ trọ sang bên thứ ba.

**Nội dung chuyển khoản tối đa 25 ký tự** theo giới hạn của hệ thống chuyển tiền trong nước.
Mã hóa đơn được **lưu cố định** trên hóa đơn, sinh một lần lúc tạo và không bao giờ đổi — kể cả khi chủ trọ đổi mã phòng về sau. Lý do: mã này nằm trong nội dung chuyển khoản của người ở, tức là một tham chiếu ra ngoài hệ thống, nên suy ra lại từ mã phòng sẽ làm hỏng việc đối chiếu.

Mã có dạng *mã phòng - năm tháng*, ví dụ `P203-202603`. Nếu một phòng có hai hóa đơn trong cùng tháng (đổi người ở giữa kỳ), hóa đơn thứ hai thêm hậu tố số thứ tự sau phần kỳ: `P203-202603-2`. Khi phải rút gọn cho vừa 25 ký
tự thì rút phần mã phòng trước, **không bao giờ cắt phần kỳ và không cắt hậu tố** — cắt kỳ sẽ tạo ra một kỳ khác
có thật, khiến chủ trọ đối chiếu nhầm tháng.

Hai cách gửi: nếu người ở đã liên kết tài khoản thì hóa đơn hiện ngay trong ứng dụng kèm
thông báo; nếu chưa liên kết thì chủ trọ tải file về và gửi qua kênh riêng của mình.

#### 9.5 Ghi nhận thu tiền

Người ở chuyển khoản hoặc đưa tiền mặt cho chủ trọ. Chủ trọ bấm **"Đã thu"** và nhập số tiền
thực nhận cùng hình thức (tiền mặt hay chuyển khoản). Một hóa đơn nhận được nhiều lần thu,
phục vụ trường hợp trả góp làm nhiều đợt.

**Trạng thái hóa đơn tự suy ra từ tổng số tiền đã thu** so với tổng phải thu, chủ trọ không
tự đặt trạng thái:

| Trạng thái | Khi nào |
|---|---|
| Chưa thu | Chưa nhận đồng nào |
| Thu một phần | Đã nhận nhưng chưa đủ |
| Đã thu đủ | Tổng đã nhận bằng hoặc vượt tổng phải thu |
| Quá hạn | Qua ngày đến hạn mà vẫn chưa thu đủ |

Hóa đơn đang quá hạn mà thu đủ thì chuyển sang *đã thu đủ*; thu một phần thì **vẫn là quá
hạn**, không lùi về *thu một phần* — để chủ trọ không bỏ sót khoản còn nợ.

Hệ thống tự động rà hóa đơn quá hạn mỗi ngày và gửi nhắc cho cả hai bên.

Hệ thống **không đối soát tự động với ngân hàng**. Việc xác nhận đã nhận tiền do chủ trọ tự
làm — đây là giới hạn có ý thức ở giai đoạn này, vì đối soát tự động đòi hỏi tích hợp ngân
hàng phức tạp hơn nhiều.

*Quy tắc áp dụng: BR-004, BR-033 — xem Mục 5.*

### Module 10 — Thông báo và nhắc hạn `[Dùng chung]`

**Mục đích:** báo cho người dùng biết việc cần làm và việc vừa xảy ra bằng thông báo (`Notification`), để không bỏ sót.

**Thông báo cho chủ trọ:** tin được duyệt hoặc bị từ chối kèm lý do; có tin nhắn mới; hợp đồng
sắp hết hạn; hóa đơn đến hạn hoặc quá hạn; người ở vừa gửi chỉ số điện nước; có báo cáo sự cố
mới; gói dịch vụ sắp hết hạn (nhắc trước 6 tháng, 2 tháng và 1 tháng); thời gian dùng thử sắp
kết thúc; kết quả xử lý đánh giá đã báo cáo.

**Thông báo cho người thuê:** vừa được thêm vào một phòng; có hóa đơn mới; nhắc hạn đóng tiền;
cập nhật tình trạng báo cáo sự cố; tin đã lưu vừa đổi trạng thái; có tin nhắn mới.

**Thông báo tự động của hệ thống:** tin đăng tự chuyển sang đã cho thuê khi phòng gắn với tin
đó có hợp đồng mới.

**Kênh gửi:** thông báo hiển thị trong ứng dụng và trên web; người dùng ứng dụng di động nhận
thêm thông báo đẩy. **Hệ thống không gửi nhắc hạn qua SMS** — tin nhắn SMS chỉ dùng cho mã xác
thực lúc đăng ký và khôi phục mật khẩu, vì chi phí mỗi tin nhắn không phù hợp với việc nhắc
định kỳ.

**Hệ quả cần biết:** nhắc hạn chỉ tới được người **đã có tài khoản và đang dùng ứng dụng hoặc
web**. Người ở không dùng ứng dụng sẽ không nhận được nhắc đóng tiền — chủ trọ vẫn phải nhắc
theo cách của mình. Tài liệu ghi rõ điều này để không hứa quá về mức độ tự động.

Người dùng đánh dấu đã đọc từng thông báo hoặc tất cả.

*Quy tắc áp dụng: BR-017 — xem Mục 5.*

### Module 11 — Tin đã lưu `[Chợ tin đăng]`

**Mục đích:** người thuê đánh dấu những tin quan tâm để xem lại sau, không phải tìm lại từ đầu.

**Chức năng:** lưu và bỏ lưu một tin cho thuê (`Favorite`); xem danh sách tin đã lưu; nhận thông báo khi
tin đã lưu đổi trạng thái, ví dụ phòng đã có người thuê hoặc tin hết hạn.

### Module 12 — Tìm kiếm và lọc `[Chợ tin đăng]`

**Mục đích:** giúp người thuê tìm đúng phòng nhanh nhất có thể.

**Tìm kiếm:** theo từ khóa hoặc theo khu vực.

**Bộ lọc:** khoảng giá, loại hình (phòng trọ, căn hộ dịch vụ, căn hộ chung cư), diện tích,
tiện ích, giờ giấc ra vào, và điểm đánh giá của khu.

**Sắp xếp và hiển thị:** tin được đẩy nổi bật xếp trước, sau đó tới tin mới nhất. Kết quả chia
trang.

**Gợi ý phòng:** hệ thống đối chiếu tin cho thuê với nhu cầu người thuê đã đăng để gợi ý những
phòng phù hợp.

**Lưu ý về lọc theo đánh giá:** khu chưa có đánh giá nào thì không có điểm. Nếu loại thẳng
những tin này ra thì tin mới đăng gần như không ai thấy. Vì vậy bộ lọc kèm một công tắc *"gồm
cả tin chưa có đánh giá"*, **mặc định bật**; còn khi sắp xếp theo điểm thì tin chưa có điểm
xếp xuống cuối chứ không bị loại.

*Quy tắc áp dụng: BR-005, BR-025 — xem Mục 5.*

### Module 13 — Quản trị hệ thống `[Dùng chung]`

**Mục đích:** quản trị viên và nhân viên vận hành điều hành nền tảng.

**Quản lý tài khoản (chỉ quản trị viên):** xem danh sách, khóa hoặc mở khóa tài khoản, điều
chỉnh vai trò. Khóa tài khoản thì tin đăng của họ tự ẩn khỏi trang công khai, nhưng dữ liệu
quản lý vận hành được giữ nguyên.

**Hàng đợi kiểm duyệt (nhân viên vận hành và quản trị viên):** duyệt tin cho thuê, tin tìm
phòng, tin ở ghép; xử lý báo cáo vi phạm; xem xét các đánh giá bị báo cáo.

**Quản lý danh mục (chỉ quản trị viên):** loại hình cho thuê, tiện ích, khu vực, khoảng giá,
bảng giá các gói dịch vụ và thời gian dùng thử, **danh mục gói đẩy tin nổi bật** (mã, tên, số
ngày hiệu lực, giá, bật/tắt), danh sách từ khóa cấm,
danh sách từ khóa cấm.

**Bảng theo dõi hệ thống:** tổng số người dùng, số tin đăng, doanh thu phí nền tảng theo thời
gian.

**Ràng buộc:** mọi thao tác duyệt, từ chối hay khóa đều phải ghi lý do và lưu lại vết để đối
chiếu về sau.

*Quy tắc áp dụng: BR-028 — xem Mục 5.*

### Module 14 — Báo cáo vi phạm `[Chợ tin đăng]`

**Mục đích:** để người dùng phản ánh nội dung sai phạm và để nền tảng xử lý.

**Báo cáo được những gì** (`Report`)**:** tin cho thuê, tin của người tìm thuê, tin nhắn, và đánh giá. Người
báo cáo chọn lý do và mô tả thêm.

**Ai báo cáo được:** chỉ tài khoản đã đăng nhập. Khách chưa đăng nhập thấy nút báo cáo nhưng
bấm vào sẽ được mời đăng nhập trước. Riêng với đánh giá, **chủ trọ cũng báo cáo được** những
đánh giá về khu của mình mà họ cho là sai sự thật.

**Xử lý:** báo cáo vào hàng đợi cho nhân viên vận hành. Các hành động có thể làm: giữ nguyên,
ẩn nội dung, khóa hội thoại, khóa tài khoản vi phạm. Người báo cáo nhận phản hồi về kết quả.

**Tự động:** một tin nhận từ 3 báo cáo chưa xử lý trở lên sẽ tạm ẩn và chuyển về hàng đợi duyệt
lại, để hạn chế thiệt hại trong lúc chờ người xem xét.

*Quy tắc áp dụng: BR-018, BR-032 — xem Mục 5.*

### Module 15 — Gói dịch vụ `[Quản lý vận hành]`

**Mục đích:** chủ trọ xem bảng giá (`SubscriptionPlan`), dùng thử, mua và gia hạn gói phần mềm quản lý (`UserSubscription`).

**Chức năng:** xem bảng giá các gói; bấm dùng thử miễn phí (mỗi chủ trọ một lần duy nhất);
mua gói qua cổng thanh toán; gia hạn; xem thời hạn còn lại và lịch sử giao dịch. Hệ thống
nhắc gia hạn trước khi hết hạn.

**Gói khác nhau ở thời hạn, không khác ở tính năng.** Mọi gói mở ra cùng một bộ chức năng
quản lý; mua thời hạn dài hơn thì đơn giá mỗi năm rẻ hơn. Khi gia hạn, chủ trọ **chọn lại
thời hạn** tùy ý — lần đầu mua một năm, lần sau mua ba năm đều được. Đây là chọn lại thời hạn
cho chu kỳ mới, **không phải** chuyển đổi giữa các loại gói có tính năng khác nhau, cũng
không phải nâng cấp giữa chừng khi gói cũ còn hạn.

Quản trị viên tạo và sửa bảng giá, xem danh sách đăng ký, và hủy một đăng ký khi xử lý khiếu
nại hoặc hoàn tiền.

*Quy tắc áp dụng: BR-015, BR-017 — xem Mục 5.*

### Module 16 — Báo cáo kinh doanh `[Quản lý vận hành]`

**Mục đích:** cho chủ trọ thấy bức tranh tổng thể việc cho thuê của mình.

**Các chỉ số cho chủ trọ:**

| Chỉ số | Cách tính |
|---|---|
| Số phòng trống | Đếm số phòng đang ở trạng thái còn trống |
| Tỷ lệ lấp đầy | Số phòng đang cho thuê chia tổng số phòng |
| **Doanh thu theo kỳ** | **Tổng các khoản đã ghi nhận thu trong kỳ** — tức tiền thực nhận, không phải tổng hóa đơn đã lập |
| Công nợ | Tổng số tiền trên các hóa đơn chưa thu đủ |
| Phòng sắp hết hạn hợp đồng | Hợp đồng còn hiệu lực nhưng sắp tới ngày kết thúc |
| Phòng chưa thanh toán | Phòng có hóa đơn ở trạng thái chưa thu hoặc quá hạn |

Điểm cần nói rõ về **doanh thu**: con số này lấy từ **các khoản chủ trọ đã bấm "Đã thu"**, bao
gồm tiền phòng, điện, nước, phí dịch vụ và các khoản khác trong hóa đơn. **Tiền cọc không
tính vào doanh thu** vì bản chất là khoản giữ tạm sẽ hoàn lại. Hóa đơn đã lập mà chưa thu
được thì nằm ở mục công nợ, không nằm ở doanh thu — cách tính này phản ánh tiền thật đã về
tay chứ không phải tiền trên giấy.

**Ba chỉ số nhạy cảm có thể ẩn:** doanh thu theo kỳ, tổng số phòng và số khách đang ở đều có
công tắc bật tắt và **mặc định tắt**. Lý do: từ ba con số này người khác suy ra được quy mô
kinh doanh, mà chủ trọ thường không muốn lộ. Số phòng trống thì luôn hiện vì đó là thông tin
chủ trọ cần dùng hằng ngày.

**Cho quản trị viên:** tổng số người dùng, số tin đăng, doanh thu phí nền tảng theo thời gian.

Dữ liệu báo cáo của mỗi chủ trọ là riêng tư tuyệt đối.

*Quy tắc áp dụng: BR-007, BR-012 — xem Mục 5.*

### Module 17 — Nhắn tin trong ứng dụng `[Dùng chung]`

**Mục đích:** để người đi hỏi phòng trao đổi được mà chưa phải để lại số điện thoại của mình.

Số điện thoại trên tin là của **người đăng tin**, do họ tự nguyện công khai để nhận cuộc gọi.
Nhắn tin giải quyết nhu cầu phía bên kia: người hỏi muốn nắm thông tin trước khi quyết định có
đưa số của mình hay không.

**Chức năng:** hội thoại (`Conversation`) một đối một gắn với một tin đăng cụ thể, gồm các tin nhắn (`Message`); gửi và nhận tin nhắn văn
bản; dấu hiệu đã đọc; danh sách hội thoại; chặn; báo cáo tin nhắn vi phạm.

**Ràng buộc:** chỉ người đã đăng nhập mới nhắn tin được. Không mở hội thoại với tin đã hết
hạn, đã cho thuê hoặc đang ẩn. **Không nhắn tin với tin đăng của chính mình.** Mỗi người chỉ
có một hội thoại cho mỗi tin — nhắn lại thì mở lại hội thoại cũ chứ không tạo mới. Chặn áp
dụng trong phạm vi một hội thoại.

**Giai đoạn:** giao diện có từ bản demo; nghiệp vụ đầy đủ ở bản chạy thật. Ban đầu tin nhắn
cập nhật bằng cách hỏi máy chủ định kỳ, sau này nâng lên kết nối thời gian thực khi lượng dùng
tăng.

*Quy tắc áp dụng: BR-019, BR-020, BR-030 — xem Mục 5.*


### Module 18 — Đánh giá khu trọ `[Chợ tin đăng]`

**Mục đích:** cho người đã từng ở viết đánh giá (`Review`) về khu trọ, để người đang tìm phòng yên tâm hơn trước
khi đặt cọc.

**Chỉ người ở thật mới đánh giá được.** Điều kiện: tài khoản phải được liên kết với một phòng
thuộc khu đó, và hợp đồng phải đã tồn tại ít nhất 30 ngày **hoặc** đã có ít nhất một lần ghi
nhận thu tiền. Hai mốc này để tránh việc vừa gắn vào phòng đã đánh giá ngay.

**Chủ trọ không được đánh giá khu của chính mình.**

**Cách đánh giá:** chấm sao từ 1 đến 5 kèm nội dung. Mỗi đợt ở chỉ viết được một đánh giá, sửa
được trong thời gian ngắn sau khi gửi. Người đã rời đi vẫn viết được đánh giá cho khu từng ở.

**Hiển thị:** điểm trung bình và số lượt đánh giá hiện trên tin đăng của khu; bấm vào xem
được trang khu trọ với toàn bộ đánh giá. Đánh giá chỉ hiển thị khi chủ trọ đã bật trang khu
công khai. Trang khu công khai chỉ hiện tên khu, khu vực và đánh giá — **không lộ** số phòng,
doanh thu hay thông tin người đang ở.

**Báo cáo đánh giá — cả hai phía đều được.** Người dùng báo cáo đánh giá có nội dung vi phạm.
**Chủ trọ cũng báo cáo được đánh giá mà mình cho là sai sự thật** về khu của mình, để nhân
viên vận hành xem xét. Đây là điểm cân bằng cần thiết: nếu chỉ người thuê được báo cáo thì
chủ trọ không có cách nào tự bảo vệ trước đánh giá ác ý. Quyền quyết định ẩn hay giữ đánh giá
thuộc về nhân viên vận hành, không thuộc chủ trọ.

Đánh giá bị nhiều lượt báo cáo sẽ tự ẩn tạm để chờ xem xét.

**Giới hạn cần thừa nhận:** các biện pháp trên giảm mạnh chứ không loại bỏ hoàn toàn đánh giá
giả. Một chủ trọ quyết tâm vẫn có thể tạo tài khoản bằng số điện thoại mình kiểm soát, lập
hợp đồng và ghi nhận thanh toán khống để đủ điều kiện đánh giá. Chúng tôi chọn nói rõ giới
hạn này thay vì hứa hẹn quá mức.

*Quy tắc áp dụng: BR-022, BR-023, BR-024, BR-030 — xem Mục 5.*

### Module 19 — Khu dành cho người ở `[Quản lý vận hành]`

**Mục đích:** cho người đang thuê theo dõi việc thuê của mình và phản hồi lại chủ trọ. Phục vụ
cả giao diện web và ứng dụng di động dành riêng cho người ở.

**Ai vào được:** tài khoản có `residencyStatus` là `ACTIVE` (đang ở) hoặc `PAST` (đã từng ở). Tài
khoản `NONE` mở ra chỉ thấy màn hình hướng dẫn "chủ trọ cần thêm bạn vào phòng".

**Chức năng:**

- **Tổng quan phòng của tôi** — thông tin phòng đang ở, khu trọ, liên hệ chủ trọ, hợp đồng
 hiện tại gồm ngày bắt đầu, ngày kết thúc, tiền thuê và tiền cọc.
- **Hóa đơn của tôi** — danh sách và chi tiết từng hóa đơn, các dòng chi phí, **số tài khoản
 và mã QR để chuyển khoản**, trạng thái đã thu hay chưa, lịch sử các lần thanh toán.
- **Hợp đồng của tôi** — xem và tải hợp đồng cùng bản chụp giấy tờ mà chủ trọ đã lưu.
- **Báo cáo sự cố** (`Incident`) — gửi báo cáo kèm ảnh khi có hỏng hóc, theo dõi chủ trọ xử lý tới đâu,
 trao đổi qua lại, xác nhận khi đã xong.
- **Gửi chỉ số điện nước** — chỉ hiện khi chủ trọ bật tính năng này cho khu; gửi số kèm ảnh
 đồng hồ, chờ chủ trọ duyệt.
- **Thông báo** — hóa đơn mới, nhắc hạn đóng tiền, cập nhật tình trạng sự cố, và thông báo khi
 được thêm vào một phòng.
- **Gỡ liên kết** — nếu bị chủ trọ thêm nhầm, người dùng bấm "Không phải tôi" để gỡ tài khoản
 của mình ra khỏi phòng đó.
- **Lịch sử ở trọ** — các đợt đã kết thúc, kèm lối vào viết đánh giá khu từng ở.

**Ranh giới truy cập:** người ở chỉ xem được dữ liệu gắn với phòng của chính mình — không thấy
phòng khác, không thấy số liệu vận hành của khu.

**Khi gói dịch vụ của chủ trọ hết hạn:** người ở **vẫn xem được** hợp đồng và các hóa đơn đã
phát hành, nhưng **không gửi được** sự cố hay chỉ số mới. Lý do: chủ trọ đang không thao tác
được để xử lý, nên nhận thêm yêu cầu chỉ tạo ra chờ đợi vô ích. Khóa quyền xem của người ở
chỉ vì chủ trọ quên gia hạn thì vô lý và sẽ đẻ ra khiếu nại.

**Vòng đời một báo cáo sự cố:** *mới gửi* → *chủ trọ đã tiếp nhận* → *đang xử lý* → *đã xử lý
xong* → *đóng*. Chủ trọ là người chuyển trạng thái; người ở xác nhận đóng, hoặc mở lại nếu
thấy chưa ổn. Mỗi lần chuyển trạng thái đều gửi thông báo cho phía còn lại.

*Quy tắc áp dụng: BR-034, BR-035 — xem Mục 5.*

---

## 4. FLOW NGHIỆP VỤ CHI TIẾT

### 4.1 Guest tìm kiếm & xem chi tiết tin
1. Trang chủ → tìm theo khu vực/từ khóa → lọc → kết quả (boost trước).
2. Chi tiết tin: gallery, chi phí, tiện ích, giờ giấc, thời điểm đăng/cập nhật, badge điểm khu (nếu tin gắn Property), khối liên hệ (SĐT che một phần + mời đăng nhập kèm `?redirect=`), nút Báo cáo tin.
- **Ngoại lệ:** không có kết quả → gợi ý nới bộ lọc.

### 4.2 Tenant liên hệ & nhắn tin với người đăng
1. Đăng nhập → "Nhắn tin" (in-app) hoặc "Gọi" (hiện SĐT đầy đủ).
2. Kiểm tra: tin không Expired/Rented/Hidden; **không phải tin của chính mình** → tạo/mở hội thoại → gửi tin nhắn → Notification → polling → đã đọc. Ghi lượt liên hệ.
3. Chặn/báo cáo tin nhắn.

### 4.3 Chủ trọ đăng tin cho thuê
1. Từ header công khai "Đăng tin → Tin cho thuê" → `/dang-tin-cho-thue`. Màn này thuộc chợ tin đăng, **miễn phí, không cần gói dịch vụ**, nhưng **cần vai trò `LANDLORD`**.
2. Người đang là `TENANT` bấm vào sẽ thấy màn mời **"Trở thành chủ trọ"** (giữ `?redirect=` để quay lại đúng chỗ). Đồng ý → giao diện gọi `POST /me/become-landlord`, vai trò đổi thành `LANDLORD`, một chiều → gọi tiếp `POST /auth/refresh` để lấy phiên mới mang vai trò mới → quay lại biểu mẫu đăng tin.
3. Biểu mẫu nhiều bước: (1) cơ bản → (2) tiện ích và mô tả → (3) ảnh, tối thiểu 3 tấm → (4) chi phí → (5) tiện ích xung quanh → (6) giờ giấc → (7) *[chỉ hiện khi chủ trọ đã có khu trọ]* chọn khu, tùy chọn, gắn `propertyId`.
4. Gửi → kiểm tra dữ liệu + lọc từ khóa cấm → `PendingApproval` → nhân viên vận hành duyệt → `Active` (đặt `expireAt = approvedAt + 60 ngày`) hoặc `Rejected` kèm lý do → thông báo.
5. (Tùy chọn) đẩy tin nổi bật → luồng 4.9 → `boostExpireAt = now + durationDays` của gói đã chọn.
6. Nếu đăng từ lối tắt "tạo tin từ phòng trống" → sau khi gửi quay về B4 (Quản lý tin).

> **Không có cơ chế nâng cấp ngầm.** Tạo tin, mở khu quản lý hay bất kỳ thao tác nào khác đều **không** tự đổi vai trò. Chỉ thao tác "Trở thành chủ trọ" mới đổi — để người dùng luôn biết rõ vai trò của mình và không bị đổi vai trò mà không hay.

### 4.4 Chủ trọ mở Workspace lần đầu & dùng thử
1. Chủ trọ (vai trò `LANDLORD`) bấm "Quản lý khu trọ" → B1 với **2 lối**: "Đăng tin (miễn phí)" / "Dùng thử bộ quản lý". Người thuê bấm vào đây sẽ được mời "Trở thành chủ trọ" trước (xem 4.3).
2. Chọn dùng thử → tạo gói đã đăng ký (`Trial`, `expireDate = now + trialDays` của plan Trial) → wizard 3 bước → Dashboard.
3. Muốn dùng tiếp → mua gói (4.9) → `ACTIVE`. Hết hạn → job chuyển `READ_ONLY`.
- **Ngoại lệ:** đã dùng TRIAL → chỉ còn lối mua gói; chạm hạn mức → chặn tạo mới + gợi ý gói lớn hơn.

### 4.5 Chủ trọ quản lý người ở — liên kết có hiệu lực ngay
1. Chi tiết Room → "+ Thêm người ở" → nhập SĐT → tra tài khoản:
 - **Có tài khoản:** hệ thống hiện tên để chủ trọ đối chiếu → bấm gắn → liên kết có hiệu lực ngay, mở "Phòng của tôi" và quyền viết đánh giá cho người thuê → gửi thông báo kèm nút "Không phải tôi"; nếu người thuê bấm nút đó thì gỡ liên kết, bản ghi người ở quay về dạng chỉ có tên và số điện thoại.
 - **Chưa có:** nhập tên + SĐT (`userId` null); khi người đó đăng ký bằng đúng số điện thoại ấy, chủ trọ liên kết lại — cũng có hiệu lực ngay và gửi thông báo như trên.
2. Bổ sung ngày bắt đầu, số người, ghi chú → Lưu. Một phòng có thể nhiều Occupancy Active (ở ghép).
3. Rời đi → "Kết thúc ở" → set `endDate`, `isActive=false` → lịch sử; nếu Contract gắn Occupancy này kết thúc → gợi ý đổi RoomStatus.

### 4.6 Landlord ghi điện nước → hóa đơn → ghi nhận thu (luồng cốt lõi)
1. Người ở gửi chỉ số qua kênh ngoài (thủ công).
2. Nhập chỉ số điện nước cho từng Room có Contract Active (chặn trùng theo unique roomId+type+period; chỉ số mới ≥ cũ).
3. Tạo hóa đơn (unique theo contractId+period) + dòng hóa đơn; reading dùng cho hóa đơn được đánh dấu `invoiceId`.
4. Xuất PDF/ảnh kèm STK + **VietQR nhúng amount + mã hóa đơn** → gửi trong ứng dụng nếu người ở đã liên kết tài khoản, hoặc tải về gửi qua kênh ngoài.
5. Nhận tiền ngoài nền tảng → bấm "Đã thu" (đủ/một phần) → ghi khoản thu → **status Invoice suy tự động** từ ΣPayment: đủ → `Paid`; một phần trước hạn → `PartiallyPaid`; qua `dueDate` chưa đủ → job set `Overdue` (thu tiếp một phần vẫn `Overdue`, thu đủ → `Paid`).

### 4.7 Tenant viết đánh giá khu trọ (V1)
1. Entry: "Phòng của tôi" (đang ở) **hoặc tab "Lịch sử ở trọ"** (từng ở) → mục "Đánh giá khu".
2. Điều kiện: tài khoản đã được liên kết vào phòng thuộc khu đó; có Contract tại Property; **không phải chủ khu**; Contract ≥ 30 ngày tuổi hoặc có ≥ 1 Payment; đợt ở này chưa review.
3. Chọn sao + nội dung → lưu đánh giá đang hiển thị (`Visible`) → cập nhật `avgRating`, `reviewCount` của Property.
4. Hiển thị: trang khu public + badge trên tin gắn `propertyId` — **chỉ khi khu đang bật public**. Khu chưa bật → review vẫn lưu, chờ chủ bật.
- **Ngoại lệ:** đã review đợt này → chặn; sửa được trong 7 ngày.

### 4.8 Admin/Staff kiểm duyệt
- **Duyệt tin:** hàng đợi 3 loại tin → duyệt/từ chối (lý do) → Notification. Tin sửa trường quan trọng quay lại hàng đợi (đang ẩn tạm).
- **Xử lý báo cáo:** hàng đợi Report (tin / tin nhắn / đánh giá) → giữ/ẩn/khóa hội thoại/khóa user (khóa user → tin tự Hidden) → phản hồi + audit.

### 4.9 Thanh toán phí nền tảng (boost & gói SaaS) — MỚI
1. Landlord bấm mua (boost hoặc gói) → BE tạo giao dịch phí nền tảng (`Pending`, kèm `idempotencyKey`) → trả URL thanh toán cổng thanh toán.
2. Chủ trọ thanh toán trên cổng thanh toán → cổng gọi **`POST /payments/webhook`** (máy chủ gọi máy chủ) → BE verify chữ ký → set `Success`/`Failed`. **Chỉ webhook mới kích hoạt quyền lợi** (set `boostExpireAt` hoặc tạo/gia hạn gói đã đăng ký) — return URL trên trình duyệt chỉ để hiển thị kết quả, vì user có thể đóng tab.
3. Giao dịch treo (`Pending` quá 15 phút không có webhook) → job đánh `Failed`; Landlord thấy trạng thái ở màn gói/tin của mình, bấm thử lại (idempotencyKey mới).

### 4.10 Người ở báo cáo sự cố
1. Người ở đang thuê mở ứng dụng hoặc khu người ở trên web → "Báo sự cố" → nhập tiêu đề, mô tả, mức ưu tiên, đính kèm ảnh → gửi.
2. Tạo báo cáo sự cố trạng thái `Open`, gắn `roomId` + `occupancyId` → Notification cho Landlord sở hữu khu.
3. Chủ trọ mở hộp thư sự cố trong Workspace → `Acknowledged` → `InProgress`; trao đổi qua trao đổi trong sự cố (hai chiều, có Notification).
4. Xử lý xong → `Resolved` → người ở xác nhận → `Closed`; nếu chưa ổn, người ở mở lại về `InProgress`.
- **Ngoại lệ:** chủ trọ đang `READ_ONLY` → người ở không tạo mới được, UI báo rõ lý do.

### 4.11 Người ở gửi chỉ số điện nước (tùy chọn, chủ trọ duyệt)
1. Chủ trọ bật `allowOccupantMeterSubmission` cho khu (mặc định tắt).
2. Cuối kỳ, người ở chụp ảnh đồng hồ + nhập số → tạo chỉ số người ở gửi lên trạng thái `Pending` → Notification cho chủ trọ.
3. Chủ trọ mở màn duyệt: xem ảnh, đối chiếu chỉ số cũ → **Xác nhận** (sinh chỉ số điện nước chính thức) hoặc **Sửa số rồi xác nhận** (lưu cả số gốc người ở gửi) hoặc **Từ chối** kèm lý do.
4. Sau khi có chỉ số điện nước, luồng hóa đơn chạy như 4.6.
- **Bất biến:** người ở **không bao giờ** tạo trực tiếp chỉ số điện nước; quyền quyết định cuối luôn thuộc chủ trọ.

---

## 5. QUY TẮC NGHIỆP VỤ

Danh mục tra cứu toàn bộ quy tắc của hệ thống. Nội dung nghiệp vụ đã được mô tả bằng lời ở các
mục trước; phần này phát biểu từng quy tắc một cách ngắn gọn để tiện tham chiếu. Mỗi mục chức
năng ở trên đều có dòng "Quy tắc áp dụng" trỏ về đây.

### Bảng mục lục

| Mã | Tên quy tắc |
|---|---|
| BR-001 | Vòng đời tin đăng |
| BR-002 | Trạng thái phòng |
| BR-003 | Duyệt lại khi sửa tin |
| BR-004 | Điều kiện lập hóa đơn và trạng thái thu tiền |
| BR-005 | Điều kiện hiển thị và thứ tự tin |
| BR-006 | Vòng đời hợp đồng và chống chồng lấn |
| BR-007 | Cô lập dữ liệu theo chủ sở hữu |
| BR-008 | Bảo vệ tệp riêng tư |
| BR-009 | Thời hạn tin của người tìm thuê |
| BR-010 | Giới hạn số tin nhu cầu |
| BR-011 | Điều kiện xóa khu trọ |
| BR-012 | Chỉ số nhạy cảm trên báo cáo |
| BR-013 | Vai trò tài khoản |
| BR-014 | Hai kênh liên hệ |
| BR-015 | Gói dịch vụ và quyền vào khu quản lý |
| BR-016 | Định danh tài khoản |
| BR-017 | Nhắc hạn gói dịch vụ |
| BR-018 | Tự tạm ẩn tin bị báo cáo nhiều |
| BR-019 | Điều kiện mở hội thoại |
| BR-020 | Chặn và báo cáo trong tin nhắn |
| BR-021 | *(không dùng — bỏ cùng tính năng hỗ trợ thuế)* |
| BR-022 | Quyền viết đánh giá |
| BR-023 | Giới hạn và kiểm duyệt đánh giá |
| BR-024 | Hiển thị đánh giá và trang khu công khai |
| BR-025 | Giờ giấc ra vào và thời điểm tin |
| BR-026 | Thời hạn tin cho thuê |
| BR-027 | Đồng bộ phòng và tin đăng |
| BR-028 | Khóa tài khoản và tin đăng |
| BR-029 | Liên kết người ở với tài khoản |
| BR-030 | Cấm tự tương tác |
| BR-031 | Đồng bộ trạng thái phòng với hợp đồng |
| BR-032 | Báo cáo vi phạm bắt buộc đăng nhập |
| BR-033 | Người ở gửi chỉ số điện nước |
| BR-034 | Phạm vi truy cập của người ở |
| BR-035 | Vòng đời báo cáo sự cố |
| BR-036 | Đơn giá điện nước ba tầng |
| BR-037 | Người ở và ngày kết thúc |
| BR-038 | Mã hóa đơn và nội dung chuyển khoản |

---

### BR-001 — Vòng đời tin đăng

Tin đi qua các trạng thái: *nháp* → *chờ duyệt* → *đang hiển thị* → (*hết hạn* / *đã cho
thuê* / *tạm ẩn* / *bị từ chối*). Áp dụng cho cả tin cho thuê và tin của người tìm thuê.

### BR-002 — Trạng thái phòng

Phòng chuyển qua lại giữa *còn trống*, *đã nhận cọc* và *đang cho thuê*; ngoài ra *tạm ẩn*
chuyển qua lại với *còn trống*. Trạng thái đồng bộ với hợp đồng theo BR-031.

### BR-003 — Duyệt lại khi sửa tin

Sửa nội dung quan trọng của tin — giá, địa chỉ, ảnh — thì phải duyệt lại, và **tin tạm ẩn
trong lúc chờ duyệt**. Giao diện cảnh báo trước khi lưu để người đăng biết hậu quả. Gia hạn mà
không sửa nội dung thì không phải duyệt lại.

### BR-004 — Điều kiện lập hóa đơn và trạng thái thu tiền

Hóa đơn **chỉ lập được cho phòng có hợp đồng đang hiệu lực**; tiền thuê lấy từ hợp đồng, không
nhập tay.

Trạng thái hóa đơn **suy tự động từ tổng số tiền đã thu** so với tổng phải thu, chủ trọ không
tự đặt: *chưa thu* → *thu một phần* → *đã thu đủ*. Qua ngày đến hạn mà chưa đủ thì thành *quá
hạn*. Từ *quá hạn*, thu đủ thì thành *đã thu đủ*, còn thu một phần thì **vẫn là quá hạn** —
để chủ trọ không bỏ sót khoản còn nợ.

### BR-005 — Điều kiện hiển thị và thứ tự tin

Chỉ tin *đang hiển thị* mới xuất hiện trên trang công khai. Tin còn hạn đẩy nổi bật xếp trước.
Chỉ đẩy nổi bật được tin *đang hiển thị*.

### BR-006 — Vòng đời hợp đồng và chống chồng lấn

Hợp đồng đi qua: *đang soạn* → *đang hiệu lực* → (*hết hạn* / *chấm dứt sớm*). Mỗi phòng tại
một thời điểm chỉ có một hợp đồng đang hiệu lực; hệ thống tự chuyển sang *hết hạn* khi qua
ngày kết thúc và gửi thông báo.

Khoảng thời gian tính **đóng ở cả hai đầu**: hợp đồng cũ kết thúc ngày 31/12 và hợp đồng mới
bắt đầu cũng ngày 31/12 thì **bị coi là chồng lấn**, không tạo được.

### BR-007 — Cô lập dữ liệu theo chủ sở hữu

Dữ liệu quản lý vận hành riêng tư tuyệt đối theo chủ trọ sở hữu. Người thuê đã liên kết chỉ
xem được dữ liệu của chính mình. Quản trị viên truy cập phải ghi lại vết.

### BR-008 — Bảo vệ tệp riêng tư

Bản chụp hợp đồng và các tệp riêng tư lưu ở khu vực không truy cập trực tiếp được; mỗi lần xem
hệ thống cấp một đường dẫn có thời hạn ngắn. Chỉ chủ trọ sở hữu và người thuê liên quan xem
được.

### BR-009 — Thời hạn tin của người tìm thuê

Tin tìm phòng và tin ở ghép hiển thị 30 ngày rồi tự hết hạn; gia hạn thêm 30 ngày, không phải
duyệt lại nếu không sửa nội dung. *Khác BR-026 — quy tắc đó dành cho tin cho thuê của chủ
trọ.*

### BR-010 — Giới hạn số tin nhu cầu

Mỗi người thuê có tối đa 2 tin đang hiển thị cho mỗi loại (tìm phòng, ở ghép).

### BR-011 — Điều kiện xóa khu trọ

Không xóa được khu còn phòng đang cho thuê, đang giữ cọc, hoặc còn hợp đồng hiệu lực. Xóa hợp
lệ là xóa mềm — ẩn khỏi danh sách nhưng giữ lại dữ liệu.

### BR-012 — Chỉ số nhạy cảm trên báo cáo

Số phòng trống luôn hiển thị. **Tổng số phòng, số khách đang ở và doanh thu có công tắc bật
tắt, mặc định tắt.**

**Lý do:** báo cáo tuy riêng tư nhưng chủ trọ hay mở ở nơi công cộng hoặc chia sẻ màn hình; từ
ba con số này người khác suy ra được quy mô kinh doanh. Để chủ trọ chủ động bật khi cần.

### BR-013 — Vai trò tài khoản

Mỗi tài khoản mang **đúng một vai trò**: `TENANT` (người thuê), `LANDLORD` (chủ trọ), `STAFF`
(nhân viên vận hành) hoặc `ADMIN` (quản trị viên).

Quyền phân theo bốn tầng, **không chồng lấn giữa các vai trò**:

| Tầng | Điều kiện | Gồm những gì |
|---|---|---|
| Đã đăng nhập | Vai trò `TENANT` hoặc `LANDLORD` | Xem tin, tìm kiếm, lưu tin, nhắn tin, báo cáo vi phạm, đăng tin tìm phòng và ở ghép |
| Chủ trọ | Vai trò `LANDLORD` | Đăng tin cho thuê, đẩy tin, quản lý khu, phòng, người ở, hợp đồng, hóa đơn |
| Người đang ở | **Suy từ dữ liệu**, không phụ thuộc vai trò | Xem phòng đang thuê, hóa đơn của mình, báo sự cố, gửi chỉ số, viết đánh giá |
| Nội bộ | Vai trò `STAFF` hoặc `ADMIN` | Kiểm duyệt, xử lý báo cáo; quản trị viên thêm quyền quản lý tài khoản và danh mục |

Tài khoản mặc định sau khi đăng ký là `TENANT`. Nâng cấp thành `LANDLORD` qua thao tác "Trở
thành chủ trọ" — một chiều, không quay lại được, vì quay lại sẽ khiến các khu trọ và hợp đồng
đang quản lý bơ vơ.

**Lý do chia như vậy:** các quyền mà cả người thuê lẫn chủ trọ đều cần được đẩy xuống tầng "đã
đăng nhập", nên không vai trò nào phải kế thừa vai trò nào. Một chủ trọ đang đi thuê nhà nơi
khác vẫn xem được phòng mình thuê, vì quyền đó suy từ dữ liệu người ở chứ không từ vai trò.

### BR-014 — Hai kênh liên hệ

Nhắn tin trong ứng dụng và gọi điện. Khách chưa đăng nhập thấy số điện thoại che một phần;
đăng nhập rồi thấy đầy đủ. Hệ thống không tích hợp Zalo.

Nhắn tin bảo vệ số điện thoại của **người đi hỏi**, không phải của người đăng tin — người đăng
tin vốn chủ động công khai số của mình để nhận cuộc gọi.

### BR-015 — Gói dịch vụ và quyền vào khu quản lý

Bốn trạng thái: *chưa dùng*, *dùng thử*, *đang hiệu lực*, *hết hạn*.

Hết hạn thì khu quản lý vận hành chuyển sang **chỉ xem** — vẫn xem và xuất được dữ liệu, không
tạo sửa xóa; **dữ liệu giữ nguyên**. Chợ tin đăng và nhắn tin **không bị ảnh hưởng**.

Gia hạn xong mở lại quyền ghi ngay. Chạm hạn mức số khu hoặc số phòng của gói thì chặn tạo
mới và gợi ý nâng gói.

**Lý do giữ nguyên dữ liệu:** xóa dữ liệu vận hành của khách hàng vì họ quên gia hạn là cách
nhanh nhất để mất họ vĩnh viễn.

### BR-016 — Định danh tài khoản

Số điện thoại là định danh duy nhất toàn hệ thống và là kênh nhận mã xác thực. Hệ thống
**không dùng email** và **không hỗ trợ đăng nhập bằng Google hay mạng xã hội**.

Tuy vậy, thông tin đăng nhập được lưu ở **một bảng riêng tách khỏi bảng tài khoản**, mỗi dòng
là một cách đăng nhập. Hiện mỗi tài khoản chỉ có một dòng kiểu mật khẩu. Thiết kế như vậy để
nếu sau này bổ sung đăng nhập bên thứ ba thì chỉ là thêm dòng, không phải sửa bảng tài khoản
đang chứa dữ liệu thật.

### BR-017 — Nhắc hạn gói dịch vụ

Nhắc gia hạn trước ngày hết hạn ở ba mốc: 6 tháng, 2 tháng và 1 tháng, kèm giá gia hạn. Thời
gian dùng thử sắp kết thúc thì nhắc trước 7 ngày.

### BR-018 — Tự tạm ẩn tin bị báo cáo nhiều

Tin nhận từ 3 báo cáo chưa xử lý trở lên sẽ tự chuyển về *chờ duyệt* và tạm ẩn, để hạn chế
thiệt hại trong lúc chờ người xem xét.

### BR-019 — Điều kiện mở hội thoại

Chỉ tài khoản đã đăng nhập mới nhắn tin được. Không mở hội thoại với tin đã hết hạn, đã cho
thuê hoặc đang ẩn. Mỗi cặp người khởi tạo và tin đăng chỉ có một hội thoại — nhắn lại thì mở
lại hội thoại cũ.

### BR-020 — Chặn và báo cáo trong tin nhắn

Người dùng chặn và báo cáo được trong hội thoại. Phạm vi chặn tính theo từng hội thoại.

### BR-022 — Quyền viết đánh giá

Chỉ tài khoản đã được liên kết với một phòng thuộc khu đó mới viết được đánh giá, và hợp đồng
phải đã tồn tại **ít nhất 30 ngày** hoặc đã có **ít nhất một lần ghi nhận thu tiền**.

**Chủ trọ không được đánh giá khu của chính mình.**

**Lý do có hai mốc điều kiện:** tránh việc vừa gắn vào phòng đã đánh giá ngay, vốn là cách dễ
nhất để tạo đánh giá giả.

### BR-023 — Giới hạn và kiểm duyệt đánh giá

Mỗi đợt ở chỉ viết được một đánh giá; sửa được trong 7 ngày kể từ khi gửi.

**Cả hai phía đều được báo cáo đánh giá.** Người dùng báo cáo đánh giá vi phạm; **chủ trọ báo
cáo đánh giá mà mình cho là sai sự thật** về khu của mình. Quyền quyết định ẩn hay giữ thuộc
về nhân viên vận hành, không thuộc chủ trọ. Đánh giá bị từ 3 lượt báo cáo trở lên tự ẩn tạm
chờ xem xét.

**Lý do cho chủ trọ quyền báo cáo:** nếu chỉ một phía báo cáo được thì chủ trọ không có cách
nào tự bảo vệ trước đánh giá ác ý, mà vẫn không thể tự ý xóa vì quyết định cuối thuộc nhân
viên vận hành.

### BR-024 — Hiển thị đánh giá và trang khu công khai

Đánh giá lưu gắn với khu trọ. Hiển thị ở hai nơi: điểm và số lượt trên tin đăng của khu, và
toàn bộ danh sách trên trang khu công khai.

Trang khu công khai **chỉ** hiện tên khu, khu vực và đánh giá — **không lộ** số phòng, doanh
thu hay thông tin người đang ở. Người ở **viết được đánh giá bất kể khu đang bật hay tắt trang công khai** — đánh giá luôn được
lưu. Việc bật trang khu công khai **chỉ quyết định hiển thị**: bật thì khu và đánh giá xuất hiện
công khai; tắt thì ẩn, nhưng đánh giá vẫn giữ nguyên để bật lại là hiện như cũ.

**Lý do không để việc bật công khai quyết định có nhận được đánh giá hay không:** nếu vậy, chủ trọ
cứ để khu ở chế độ riêng tư thì không ai đánh giá được, rồi bật lên khi muốn với lý lịch sạch.
Cách làm đúng là để đánh giá tích lũy, chủ trọ chỉ kiểm soát hiển thị — và muốn điểm đánh giá hiện
trên tin đăng thì phải bật công khai, khi đó đánh giá xấu hiện cùng đánh giá tốt.

### BR-025 — Giờ giấc ra vào và thời điểm tin

Tin đăng và phòng có thông tin giờ giấc ra vào (tự do hoặc có khung giờ), dùng làm bộ lọc khi
tìm kiếm. Trang chi tiết hiển thị thời điểm đăng và thời điểm cập nhật gần nhất để người thuê
đánh giá độ mới của tin.

### BR-026 — Thời hạn tin cho thuê

Tin cho thuê hiển thị 60 ngày kể từ khi được duyệt rồi tự hết hạn; gia hạn được. *Khác BR-009
— quy tắc đó dành cho tin của người tìm thuê.*

### BR-027 — Đồng bộ phòng và tin đăng

Phòng gắn với một tin đăng mà chuyển sang *đang cho thuê* thì tin đó không còn hiển thị như
phòng trống nữa.

**Lý do:** đây là cơ chế chống tin ảo — nguồn gốc của nỗi bực nhất mà người thuê gặp phải.

### BR-028 — Khóa tài khoản và tin đăng

Khóa tài khoản thì tin đăng của họ tự ẩn khỏi trang công khai, nhưng dữ liệu quản lý vận hành
được giữ nguyên để khôi phục khi mở khóa.

### BR-029 — Liên kết người ở với tài khoản

Chủ trọ liên kết bản ghi người ở với một tài khoản bằng số điện thoại. Liên kết **có hiệu lực
ngay**, không cần người thuê bấm đồng ý.

Người được liên kết nhận **thông báo** và có nút **"Không phải tôi"** để tự gỡ. Khi gỡ, bản
ghi người ở quay về dạng chỉ có tên và số điện thoại; dữ liệu quản lý của chủ trọ không mất.

Bản ghi người ở **không bắt buộc** phải gắn với tài khoản — chủ trọ vẫn quản lý được người
không dùng ứng dụng. Nhưng ai muốn **dùng dịch vụ** của hệ thống thì bắt buộc phải có tài
khoản và được liên kết.

**Lý do bỏ bước xác nhận:** người thuê đã ký hợp đồng và đóng cọc ngoài đời, bắt xác nhận thêm
lần nữa vừa thừa vừa tạo ra trạng thái lơ lửng không xử lý được — từ chối rồi thì có trả cọc
không, có cho thuê tiếp không. Nút "Không phải tôi" đủ để xử lý trường hợp gõ nhầm số.

### BR-030 — Cấm tự tương tác

Không nhắn tin với tin đăng của chính mình; không đánh giá khu trọ của chính mình. Hệ thống
kiểm tra khi nhận yêu cầu, không chỉ ẩn nút ở giao diện.

### BR-031 — Đồng bộ trạng thái phòng với hợp đồng

Tạo hợp đồng hiệu lực thì phòng tự chuyển sang *đang cho thuê*, trong cùng một giao dịch dữ
liệu. Hợp đồng kết thúc và phòng không còn hợp đồng hiệu lực nào thì hệ thống **gợi ý** chuyển
về *còn trống*, không tự chuyển — vì phòng có thể đang dọn dẹp hoặc sửa chữa.

Trạng thái *đã nhận cọc* do chủ trọ tự đặt, vì việc nhận cọc diễn ra ngoài hệ thống; trạng
thái này bị thay bằng *đang cho thuê* khi có hợp đồng hiệu lực.

### BR-032 — Báo cáo vi phạm bắt buộc đăng nhập

Chỉ tài khoản đã đăng nhập mới gửi được báo cáo. Khách chưa đăng nhập thấy nút báo cáo nhưng
bấm vào sẽ được mời đăng nhập trước, đăng nhập xong quay lại đúng chỗ cũ.

**Lý do:** báo cáo ẩn danh mở đường cho spam và cho đối thủ dìm hàng loạt; gắn báo cáo với tài
khoản cho phép truy vết và xử lý người báo cáo sai sự thật.

### BR-033 — Người ở gửi chỉ số điện nước

Tính năng bật tắt **theo từng khu trọ**, mặc định tắt. Người ở gửi chỉ số kèm **ảnh chụp đồng
hồ bắt buộc**; chỉ số nằm ở trạng thái chờ duyệt.

**Chỉ khi chủ trọ xác nhận mới sinh ra chỉ số chính thức.** Nếu chủ trọ sửa số thì vẫn lưu lại
số người ở gửi ban đầu để đối chiếu.

**Lý do:** người ở có động cơ khai thấp, nên bằng chứng ảnh cộng quyền duyệt của chủ trọ là
bắt buộc. Đặt ở cấp khu vì một chủ có thể muốn dùng cho khu ở xa mà không dùng cho khu gần
nhà.

### BR-034 — Phạm vi truy cập của người ở

Người ở chỉ đọc được dữ liệu gắn với bản ghi người ở đã liên kết của chính mình — phòng đang
ở, hợp đồng của mình, hóa đơn của mình. Không thấy phòng khác, không thấy số liệu vận hành của
khu. Người đã rời đi vẫn xem được lịch sử của chính mình.

**Khi gói dịch vụ của chủ trọ hết hạn:** người ở **vẫn xem được** hợp đồng và hóa đơn đã phát
hành, nhưng **không tạo mới** báo cáo sự cố hay gửi chỉ số.

**Lý do:** chủ trọ đang không thao tác được để xử lý, nên nhận thêm yêu cầu chỉ tạo ra chờ đợi
vô ích. Nhưng khóa quyền xem của người ở chỉ vì chủ trọ quên gia hạn thì vô lý và sẽ đẻ ra
khiếu nại.

### BR-035 — Vòng đời báo cáo sự cố

*Mới gửi* → *đã tiếp nhận* → *đang xử lý* → *đã xử lý xong* → *đóng*. Chỉ chủ trọ sở hữu khu
chuyển được trạng thái; người ở xác nhận đóng hoặc mở lại về *đang xử lý*. Mỗi lần chuyển
trạng thái đều gửi thông báo cho phía còn lại. Ảnh đính kèm lưu riêng tư và phân quyền như bản
chụp hợp đồng.

### BR-036 — Đơn giá điện nước ba tầng

Ba tầng, tầng dưới đè tầng trên:

| Tầng | Nơi đặt | Vai trò |
|---|---|---|
| 1 | Khu trọ | Giá mặc định cho mọi phòng trong khu |
| 2 | Phòng | Giá riêng của phòng; để trống thì dùng giá của khu |
| 3 | Bản ghi chỉ số | **Chốt cứng lúc ghi** — chép đơn giá đang áp dụng vào chính bản ghi, không bao giờ đọc ngược lên hai tầng trên |

Sửa giá ở tầng 1 hay 2 về sau chỉ ảnh hưởng các kỳ ghi sau.

Ở cấp phòng, **để trống nghĩa là dùng giá của khu; số 0 nghĩa là miễn phí**. Giao diện không
được hiển thị ô trống thành "chưa cấu hình".

**Lý do:** đổi giá điện tháng này không được phép làm đổi số tiền hóa đơn các tháng trước.

### BR-037 — Người ở và ngày kết thúc

Một phòng có nhiều bản ghi người ở (phòng ở ghép), trong đó **một người là đại diện** đứng tên
hợp đồng và nhận hóa đơn.

Ngày kết thúc ở là **ngày đầu tiên người đó không còn ở**. Chưa tới ngày đó vẫn tính là đang
ở.

**Lý do:** giao diện và máy chủ hiểu lệch một ngày là ra lệch cả hóa đơn lẫn tình trạng phòng
trống.

### BR-038 — Mã hóa đơn và nội dung chuyển khoản

**Mã hóa đơn lưu cố định**, sinh một lần lúc tạo, không bao giờ đổi. Dạng mặc định *mã phòng - năm tháng*, ví dụ `P203-202603`; nếu cùng phòng có hai hóa đơn trong một tháng thì thêm hậu tố số thứ tự sau phần kỳ: `P203-202603-2`.

Nội dung chuyển khoản **tối đa 25 ký tự** theo giới hạn của hệ thống chuyển tiền trong nước.
Khi phải rút gọn thì rút phần mã phòng trước, **không bao giờ cắt phần kỳ, không cắt hậu tố**.

Mã QR được sinh tại máy người dùng, không gọi dịch vụ tạo ảnh QR bên ngoài.

**Lý do:** mã lưu cố định vì nó là tham chiếu ra ngoài hệ thống — đã nằm trong nội dung chuyển khoản thì không được đổi. Cắt hậu tố thì `P203-202603-2` thành `P203-202603`, trùng đúng mã hóa đơn thứ nhất. Cắt phần kỳ tạo ra một kỳ khác có thật, khiến chủ trọ đối chiếu nhầm tháng. Gọi
dịch vụ ngoài đồng nghĩa gửi số tài khoản và số tiền của chủ trọ sang bên thứ ba.

---

## 6. DANH SÁCH DỮ LIỆU (37 entity)

> **Quy ước chung cho mọi bảng:** khóa chính `id` kiểu uuid, cùng bộ cột kiểm toán
> `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, và `isDeleted` (xóa mềm — đánh dấu đã
> xóa, ẩn khỏi danh sách nhưng giữ lại dữ liệu). Giá trị của các trạng thái xem Mục 5.

| Entity | Mô tả | Field chính | Quan hệ |
|---|---|---|---|
| **User** | Tài khoản | `phoneNumber` (**unique, bắt buộc — mã định danh của hệ thống**), `roleId`, `status` (PendingVerification/Active/Locked) | n-1 Role; 1-1 Profile; 1-n AuthMethod |
| **Role** | Danh mục vai trò | `code` (TENANT/LANDLORD/STAFF/ADMIN, unique), `name`, `description` | 1-n User |
| **AuthMethod** | Cách đăng nhập của một tài khoản | `userId`, `provider` (Password/Google/…), `secretHash` (null với đăng nhập bên thứ ba), `providerUserId` (null), `linkedAt`; unique (`userId`, `provider`) | n-1 User |
| **Profile** | Hồ sơ | `userId`, `fullName`, `avatarUrl`, `contactPhone`, `displaySettings` (jsonb) | 1-1 User |
| **RefreshToken** | Phiên đăng nhập | `userId`, `tokenHash`, `expiresAt`, `revokedAt` (null) | n-1 User |
| **RentalListing** | Tin cho thuê | `landlordId`, `typeId`, `propertyId` (null — gắn để hiện điểm đánh giá khu và bật đồng bộ chống tin ảo), `roomId` (null), `title`, `provinceCode` + `wardCode` (**mã hành chính, dùng để lọc**), `wardName` + `addressDetail` (**dùng để hiển thị**), `area`, `price`, `description`, `accessPolicy` (Free/Restricted), `accessOpenTime`/`accessCloseTime` (null), `contactPhone`, `status`, `rejectReason` (null), `approvedAt` (null), `expireAt` (= approvedAt + 60 ngày), `boostExpireAt` (null — **trạng thái đẩy tin suy từ cột này**, không giữ cờ riêng) | n-1 User/ListingType/Property(null)/Room(null); 1-1 ListingCost; 1-n ListingNearbyPlace/Media/Favorite/Report/Conversation/ContactEvent; n-n Amenity |
| **ListingType** | Danh mục loại hình cho thuê | `code` (unique), `name`, `description` | 1-n RentalListing |
| **ListingCost** | Các khoản chi phí của một tin | `listingId` (unique — quan hệ một-một), `electricityBill`, `waterBill`, `serviceFee`, `deposit` | 1-1 RentalListing |
| **ListingNearbyPlace** | Tiện ích xung quanh tin đăng | `listingId`, `type` (trường học/chợ/siêu thị/bến xe…), `description`, `distance` (km) | n-1 RentalListing |
| **RoomWantedPost** | Tin tìm phòng | `tenantId`, `desiredWards` (jsonb — danh sách mã phường/xã), `priceMin/priceMax`, `typeId`, `minArea`, `desiredAmenities` (jsonb), `moveInDate`, `description`, `status`, `expireAt` | n-1 User; 1-n Conversation/Report |
| **RoommateWantedPost** | Tin ở ghép | `tenantId`, `currentAddress`, `wardName` + `provinceCode` + `wardCode`, `sharePrice`, `neededCount`, `genderRequirement`, `requirements`, `status`, `expireAt` | n-1 User; 1-n Media/Conversation/Report |
| **Property** | Khu trọ + nhận tiền + hồ sơ public | `landlordId`, `name`, `address`, `wardName` + `provinceCode` + `wardCode`, `floorCount`, `note`, `bankName/bankAccountNumber/bankAccountName` (null), `isPublicProfileEnabled` (mặc định false), `publicSlug` (unique, null), `avgRating` (null), `reviewCount` (mặc định 0), `allowOccupantMeterSubmission` (mặc định false), **`electricityUnitPrice`, `waterUnitPrice`, `serviceFee`** (đơn giá mặc định của khu) | n-1 User; 1-n Room/Review |
| **Room** | Phòng | `propertyId`, `roomCode` (unique trong property), `floor`, `area`, `price`, `status`, `accessPolicy`, `accessOpenTime/CloseTime`, `note`, **`electricityPrice`, `waterPrice`, `servicePrice`** (nullable — để trống thì dùng giá của khu; `0` nghĩa là miễn phí)  | n-1 Property; n-n Amenity; 1-n Occupancy/Contract/Invoice/UtilityReading; 0-n RentalListing |
| **Occupancy** | Người ở thực tế | `roomId`, `userId` (null khi chưa liên kết tài khoản), `fullName`, `phoneNumber`, `startDate`, `endDate` (null; **ngày đầu tiên không còn ở**), `occupantCount` (số nhân khẩu của bản ghi này), `isPrimary` (người đại diện đứng hợp đồng), `note` | n-1 Room; n-1 User (null) |
| **Contract** | Hợp đồng | `roomId`, `occupancyId` (đại diện), `startDate`, `endDate`, `rentPrice`, `deposit`, `status`, `terminateReason` | n-1 Room/Occupancy; 1-n Media (scan); tối đa 1 Review |
| **Invoice** | Hóa đơn kỳ | `roomId`, `contractId`, `invoiceCode` (**unique, sinh một lần lúc tạo, không bao giờ đổi** — BR-038), `period` (YYYY-MM), `dueDate`, `totalAmount`, `status`; **unique (contractId, period)** | n-1 Room/Contract; 1-n InvoiceItem/Payment/Media |
| **InvoiceItem** | Dòng hóa đơn | `invoiceId`, `type` (Rent/Electricity/Water/Service/Deposit/Other), `description`, `quantity`, `unitPrice`, `amount` | n-1 Invoice |
| **UtilityReading** | Chỉ số điện nước | `roomId`, `type` (Electricity/Water), `period`, `previousReading`, `currentReading`, `unitPrice`, **`invoiceId` (null — đánh dấu đã lên hóa đơn)**; **unique (roomId, type, period)** | n-1 Room; n-1 Invoice (null) |
| **Payment** | Ghi nhận thu **tiền thuê** (tay) | `invoiceId` (bắt buộc), `amount`, `method` (Cash/BankTransfer), `paidAt`, `note` | n-1 Invoice |
| **PlatformTransaction** | Giao dịch **phí nền tảng** qua cổng thanh toán — dùng chung cho cả đẩy tin và gói dịch vụ | `landlordId`, `type` (Boost/Subscription), `listingId` (null), `boostPackageId` (null), `userSubscriptionId` (null), `amount`, `paymentMethod`, `status` (Pending/Success/Failed), `gatewayTxnId` (null), `idempotencyKey` (unique), `paidAt` (null) | n-1 User; n-1 RentalListing/BoostPackage/UserSubscription (tùy loại) |
| **BoostPackage** | Danh mục gói đẩy tin | `code` (unique), `name`, `description`, `durationDays`, `price`, `isActive` | 1-n PlatformTransaction |
| **Notification** | Thông báo | `userId`, `type` (ListingApproved/Rejected/NewMessage/ContractExpiring/InvoiceDue/InvoiceOverdue/**InvoiceReceived**/SubscriptionRenewal/TrialEnding/ReviewModerated/**OccupancyLinked**/**ListingAutoRented**/FavoriteChanged/System), `title`, `content`, `isRead`, `refType/refId` | n-1 User |
| **Favorite** | Tin đã lưu | `tenantId`, `listingId`; unique (tenantId, listingId) | n-1 User/RentalListing |
| **Report** | Báo cáo vi phạm | `reporterId`, `targetType` (RentalListing/RoomWantedPost/RoommateWantedPost/Conversation/Message/Review), `targetId`, `reason`, `description`, `status`, `resolution`, `handledBy` | n-1 User |
| **Conversation** | Hội thoại | `refType`, `refId`, **`initiatorId`** (người bắt chuyện), **`posterId`** (người đăng tin), `status` (Active/Archived/Blocked), `lastMessageAt`; **unique (initiatorId, refType, refId)** | n-1 User (x2); 1-n Message |
| **Message** | Tin nhắn | `conversationId`, `senderId`, `content`, `isRead`, `readAt` (null) | n-1 Conversation/User |
| **ContactEvent** | Tương tác liên hệ | `listingId`, `userId` (null), `type` (Call/Message) | n-1 RentalListing; n-1 User (null) |
| **SubscriptionPlan** | Gói SaaS | `name`, `durationMonths`, `price`, `renewalPrice`, `trialDays` (default 30), `maxProperties`, `maxRooms`, **`isTrialPlan` (boolean — plan Trial định nghĩa hạn mức dùng thử)**, `isActive` | 1-n UserSubscription |
| **UserSubscription** | Gói của Landlord | `landlordId`, `planId`, `startDate`, `expireDate`, `status` (Trial/Active/Expired/Cancelled) | n-1 User/SubscriptionPlan; 1-n PlatformTransaction |


| **Amenity** | Tiện ích (danh mục) | `name`, `icon`, `type` (Room/Surrounding) | n-n RentalListing/Room |
| **BannedKeyword** | Từ khóa cấm | `keyword`, `isActive` | (danh mục Admin) |
| **Media** | File/ảnh | `ownerType` (RentalListing/RoommateWantedPost/Contract/Profile/Invoice/Incident/UtilityReadingSubmission), `ownerId` (null khi mới upload), `url`, `mimeType`, `sizeBytes`, `isPrivate`, `displayOrder` (thứ tự hiển thị; ảnh đầu tiên là ảnh đại diện của tin) | đa hình; media chưa gắn owner sau 24h bị job dọn |
| **Review** | Đánh giá khu trọ | `propertyId`, `authorUserId`, `contractId` (bằng chứng, unique), `rating` (1–5), `content` (≤1.000), `status` (Visible/Hidden/Reported), `landlordReply` (null, V2) | n-1 Property/User/Contract |
| **UtilityReadingSubmission** | Đề xuất chỉ số từ người ở | `roomId`, `occupancyId`, `submittedByUserId`, `type` (Electricity/Water), `period`, `submittedValue`, `photoMediaId` (bắt buộc), `status` (Pending/Approved/Rejected), `reviewedByUserId` (null), `approvedValue` (null), `rejectReason` (null) | n-1 Room/Occupancy/User |
| **Incident** | Báo cáo sự cố của người ở | `roomId`, `occupancyId`, `reportedByUserId`, `title`, `description`, `priority` (Low/Normal/High/Urgent), `status` (Open/Acknowledged/InProgress/Resolved/Closed), `resolvedAt` (null) | n-1 Room/Occupancy/User; 1-n IncidentComment/Media |
| **IncidentComment** | Trao đổi trong một sự cố | `incidentId`, `authorUserId`, `content`, `isFromLandlord` | n-1 Incident/User |
| **DeviceToken** | Token push cho app mobile | `userId`, `token` (unique), `platform` (iOS/Android), `lastActiveAt` | n-1 User |

**Index đề xuất:** `RentalListing(status, provinceCode, wardCode, price, typeId, approvedAt, boostExpireAt, propertyId)`; `User(phoneNumber unique)`; `AuthMethod(userId, provider unique)`; `Room(propertyId, status)`; `Occupancy(roomId, userId)`; `Invoice(contractId, period unique)`; `Invoice(invoiceCode unique)`; `UtilityReading(roomId, type, period unique)`; `Notification(userId, isRead)`; `Conversation(initiatorId, posterId, refType, refId)`; `Message(conversationId, createdAt)`; `Review(propertyId, status)`; `Property(publicSlug unique, isPublicProfileEnabled)`; `PlatformTransaction(idempotencyKey unique)`; `Incident(roomId, status)`; `ListingCost(listingId unique)`; `ListingNearbyPlace(listingId)`.

---

## 7. API ENDPOINTS (REST) — đề xuất

> Prefix `/api/v1`. Namespace tách theo domain (mục 7.1) để middleware không chặn nhầm. **Chuẩn response/error/pagination ở mục 7.7** (một chuẩn duy nhất cho toàn dự án).

### 7.1 Quy ước namespace — mỗi domain một tiền tố

Middleware **mount theo tiền tố**, nên không thể chặn nhầm route của domain khác. Đây là cách gỡ tận gốc xung đột kiểu "route công khai bị guard của Workspace chặn".

| Tiền tố | Thuộc về | Middleware áp dụng |
|---|---|---|
| `/api/v1/auth/*`, `/me/*`, `/notifications/*`, `/conversations/*`, `/media/*` | Shared Kernel | auth (trừ `/auth/*` công khai) |
| `/api/v1/public/*` | Marketplace — không cần đăng nhập | không |
| `/api/v1/marketplace/*` | Marketplace — cần đăng nhập | auth |
| `/api/v1/management/*` | SaaS — chủ trọ | auth + role Landlord + **gating guard** |
| `/api/v1/residency/*` | Người ở | đăng nhập + kiểm tra đã liên kết với phòng |
| `/api/v1/admin/*` | Admin / Staff | auth + role nội bộ |

### 7.2 Shared Kernel
```
POST /auth/register POST /auth/verify-otp POST /auth/login
POST /auth/refresh POST /auth/logout (thu hồi refresh token)
POST /auth/forgot-password POST /auth/reset-password
GET /me (role, subscriptionStatus, residencyStatus, limits — hạn mức của gói, thông tin hồ sơ)
POST /me/become-landlord (nút "Trở thành chủ trọ": đổi vai trò TENANT → LANDLORD, một chiều; sau đó gọi POST /auth/refresh để lấy phiên mang vai trò mới)
PUT /me/password POST /me/delete-request
GET /me/profile PUT /me/profile PUT /me/display-settings
POST /me/device-tokens DELETE /me/device-tokens/{id} (push cho app mobile)
GET /notifications PATCH /notifications/{id}/read PATCH /notifications/read-all
GET /conversations POST /conversations (chặn self-contact)
GET /conversations/{id}/messages POST /conversations/{id}/messages
PATCH /conversations/{id}/read POST /conversations/{id}/block POST /conversations/{id}/report
POST /media/upload DELETE /media/{id}
```

### 7.3 Marketplace
```
# Công khai — không cần đăng nhập
GET /public/listings GET /public/listings/{id}
GET /public/search/listings GET /public/amenities
GET /public/khu-tro/{slug} (trang khu public + review)
GET /public/properties/{id}/reviews
GET /public/room-wanted-posts GET /public/roommate-wanted-posts
# Cần đăng nhập
POST /marketplace/listings (cần vai trò LANDLORD; tạo tin không tự đổi vai trò)
PUT /marketplace/listings/{id} PATCH /marketplace/listings/{id}/status
DELETE /marketplace/listings/{id} (xóa mềm)
PATCH /marketplace/listings/{id}/renew (gia hạn +60d)
POST /marketplace/listings/{id}/boost (tạo PlatformTransaction → URL thanh toán)
POST /marketplace/listings/{id}/favorite DELETE /marketplace/listings/{id}/favorite
GET /marketplace/me/listings GET /marketplace/me/favorites
GET /marketplace/search/suggest-rooms
POST /marketplace/room-wanted-posts PUT/PATCH/DELETE …/{id}
POST /marketplace/roommate-wanted-posts PUT/PATCH/DELETE …/{id}
POST /marketplace/reviews (body: propertyId, contractId, rating, content)
PUT /marketplace/reviews/{id}
POST /marketplace/reports (body: targetType, targetId, reason, bắt buộc đăng nhập)
```

### 7.4 Property Management (SaaS) — chịu gating
```
# Subscription & thanh toán phí nền tảng
GET /management/subscription/plans GET /management/me/subscription
POST /management/me/subscription/trial POST /management/me/subscription/purchase
POST /management/me/subscription/renew
GET /management/platform-transactions/{id}
POST /payments/webhook                (máy chủ gọi máy chủ, xác thực bằng chữ ký của cổng thanh toán)
# Property & Room (chặn ghi nếu READ_ONLY, lỗi mã WORKSPACE_READ_ONLY)
GET/POST /management/properties GET/PUT/DELETE /management/properties/{id}
PATCH /management/properties/{id}/public
PATCH /management/properties/{id}/settings (bật/tắt allowOccupantMeterSubmission)
GET/POST /management/properties/{id}/rooms GET/PUT/DELETE /management/rooms/{id}
PATCH /management/rooms/{id}/status POST /management/rooms/{id}/create-listing
# Occupancy & Contract
GET/POST /management/rooms/{id}/occupancies PUT/PATCH /management/occupancies/{id}
GET /management/occupancies/lookup?phone=…
GET/POST /management/rooms/{id}/contracts GET/PUT/PATCH /management/contracts/{id}
# Invoice / Utility / Payment
POST /management/rooms/{id}/utility-readings GET /management/rooms/{id}/utility-readings
GET /management/utility-submissions (hàng đợi đề xuất chỉ số từ người ở)
PATCH /management/utility-submissions/{id}/approve|reject
GET/POST /management/rooms/{id}/invoices GET /management/invoices/{id}
PATCH /management/invoices/{id}/send POST /management/invoices/{id}/payments
# Sự cố (phía chủ trọ xử lý)
GET /management/incidents GET /management/incidents/{id}
PATCH /management/incidents/{id}/status POST /management/incidents/{id}/comments
# Báo cáo kinh doanh
GET /management/dashboard
```

### 7.5 Residency — người ở (web shell + app mobile)
```
GET /residency/me/occupancies (đợt ở hiện tại + lịch sử)
PATCH /residency/me/occupancies/{id}/unlink   (nút "Không phải tôi" — người thuê tự gỡ liên kết)
GET /residency/me/room (tổng quan phòng đang ở)
GET /residency/me/contracts GET /residency/me/contracts/{id}
GET /residency/me/invoices GET /residency/me/invoices/{id} (kèm STK + VietQR)
POST /residency/incidents (tạo báo cáo sự cố + ảnh)
GET /residency/incidents GET /residency/incidents/{id}
POST /residency/incidents/{id}/comments PATCH /residency/incidents/{id}/close|reopen
POST /residency/utility-submissions (gửi chỉ số + ảnh đồng hồ — chỉ khi khu bật)
GET /residency/utility-submissions
```

### 7.6 Admin & Moderation
```
GET /admin/users PATCH /admin/users/{id}/lock PATCH /admin/users/{id}/roles
GET /admin/moderation/listings PATCH /admin/listings/{id}/approve|reject
GET /admin/reports PATCH /admin/reports/{id}/resolve
GET /admin/moderation/reviews PATCH /admin/conversations/{id}/block
GET/POST/PUT /admin/plans GET/POST/PUT /admin/amenities /admin/banned-keywords
GET/POST/PUT /admin/banned-keywords PUT /admin/boost-config (boostPrice, boostDays)
GET /admin/subscriptions PATCH /admin/subscriptions/{id}/cancel
GET /admin/dashboard
```

### 7.7 Chuẩn response — MỘT chuẩn duy nhất (các tài liệu khác trích theo đây)
- **Thành công:** `{ "data": …, "meta": {…} }` — không có cờ `success` (HTTP status đã nói điều đó).
- **Lỗi:** `{ "error": { "code": "ROOM_NOT_FOUND", "message": "…", "details": [] } }`. Mã lỗi nghiệp vụ đáng chú ý: `WORKSPACE_READ_ONLY`, `TRIAL_ALREADY_USED`, `REVIEW_NOT_ELIGIBLE`, `SELF_CONTACT_FORBIDDEN`, `RESIDENCY_NOT_LINKED`, `METER_SUBMISSION_DISABLED`.
- **Pagination:** `?page=&pageSize=&sort=`; trả `meta: { page, pageSize, total, totalPages }`. Messaging phân trang con trỏ thời gian (`?before=`/`?after=`).
- **Status codes:** 200/201 thành công; 400 request sai cấu trúc; 401 chưa xác thực; 403 không đủ quyền (RBAC/ownership/gating); 404 không tồn tại; 409 xung đột (trùng roomCode, chồng lấn hợp đồng, trùng period); **422 lỗi validation ngữ nghĩa**; 429 rate limit; 500 hệ thống.

---

## 8. PHÂN QUYỀN (RBAC)

| Nhóm endpoint | Guest | Tenant | Landlord | Staff | Admin |
|---|---|---|---|---|---|
| Xem tin / tìm kiếm / xem review | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nhắn tin, lưu tin, đăng tin nhu cầu | – | ✓ | ✓ | – | – |
| Báo cáo vi phạm (tin/tin nhắn/review) | – | ✓ | ✓ | – | – |
| Viết review (verified) | – | ✓¹ | ✓¹ | – | – |
| Đăng/quản lý tin cho thuê, boost | – | –³ | ✓ | – | – |
| Khu quản lý vận hành | – | – | ✓² | – | – |
| Residency (phòng của tôi, sự cố, gửi chỉ số) | – | ✓⁴ | ✓⁴ | – | – |
| Kiểm duyệt tin / report / review, khóa hội thoại | – | – | – | ✓ | ✓ |
| Quản lý user / danh mục / gói / cấu hình | – | – | – | – | ✓ |

¹ Chỉ khi đã liên kết với phòng thuộc khu đó, không phải chủ khu, và hợp đồng đã đủ 30 ngày hoặc đã có ít nhất một lần ghi nhận thu tiền. ² Chỉ khi gói dịch vụ đang dùng thử hoặc còn hiệu lực; hết hạn thì chỉ đọc. ³ Người thuê bấm "Trở thành chủ trọ" thì vai trò đổi thành chủ trọ (mục 1.8). ⁴ Chỉ khi tài khoản đã được liên kết với một phòng; người đã rời đi chỉ đọc lịch sử; gửi chỉ số còn cần chủ trọ bật tính năng cho khu đó. Mọi truy cập dữ liệu SaaS lọc theo `landlordId`; dữ liệu Residency lọc theo `Occupancy.userId` của chính người gọi; Admin truy cập ghi audit.

**Pipeline kiểm tra endpoint SaaS (thứ tự):** token hợp lệ → role Landlord (claims) → ownership `landlordId` → gating `subscriptionStatus` (DB).

**Trình tự kiểm tra endpoint của người ở:** phiên hợp lệ → tài khoản có liên kết với phòng nào không → bản ghi đang truy cập có đúng thuộc phòng của người đó không.

---

## 9. VALIDATION DỮ LIỆU (điểm chính)

- **Số điện thoại** đúng định dạng Việt Nam và duy nhất toàn hệ thống; **mật khẩu** tối thiểu 8 ký tự.
- **RentalListing:** tiêu đề 10–120 ký tự; giá > 0; ảnh ≥ 3; `accessPolicy=Restricted` bắt buộc `accessOpenTime/CloseTime`; **`propertyId`/`roomId` (nếu có) phải thuộc chính `landlordId`**; nội dung qua lọc từ khóa cấm khi gửi duyệt.
- **Property:** bật public phải có `name` + `wardName` + `provinceCode` + `wardCode`; `publicSlug` tự sinh, unique. Nhận tiền: STK chỉ số; `bankAccountName` IN HOA không dấu (VietQR hợp lệ).
- **Room:** `roomCode` unique trong Property; giá ≥ 0; diện tích > 0.
- **UtilityReadingSubmission:** `submittedValue ≥ previousReading` của kỳ trước; **ảnh đồng hồ bắt buộc**; mỗi (room, type, period) chỉ một submission `Pending`.
- **Báo cáo sự cố:** tiêu đề 5–120 ký tự; mô tả tối đa 2.000 ký tự; tối đa 5 ảnh; chỉ tạo được khi đang ở phòng (đã rời đi thì không gửi mới).
- **Người ở:** ngày kết thúc không sớm hơn ngày bắt đầu; số điện thoại bắt buộc; tên bắt buộc khi chưa liên kết tài khoản.
- **Contract:** `endDate > startDate`; chặn Contract Active thứ hai và chồng lấn thời gian trên cùng Room (409).
- **UtilityReading:** `currentReading ≥ previousReading`; `unitPrice ≥ 0`; unique (roomId, type, period).
- **Invoice:** `period` đúng `YYYY-MM`; tổng = Σ InvoiceItem; unique (contractId, period); `invoiceCode` unique, không sửa được sau khi tạo. VietQR sinh kèm amount + addInfo = `invoiceCode`, tối đa 25 ký tự — rút phần mã phòng trước, không cắt phần kỳ và không cắt hậu tố.
- **Payment:** `amount > 0`; Σ Payment không vượt `totalAmount`.
- **PlatformTransaction:** `idempotencyKey` unique; webhook verify chữ ký gateway; xử lý webhook idempotent (nhận trùng không kích hoạt trùng).
- **Review:** `rating ∈ [1,5]`; `content ≤ 1.000`; `contractId` hợp lệ, thuộc `authorUserId` qua bản ghi người ở đã liên kết; không phải chủ khu; đạt điều kiện mở; chặn trùng theo `contractId`.
- **Conversation:** người khởi tạo ≠ người đăng tin; tin ở trạng thái cho phép.
- **Subscription:** không TRIAL lần 2; `purchase/renew` kiểm `planId` Active.

---

## 10. DANH SÁCH MÀN HÌNH ĐẦY ĐỦ (sản phẩm hoàn chỉnh)

> Phân theo **2 shell**; shell Workspace chia **2 zone** (mục 1.6). Cột **Giai đoạn**: `MVP` (demo, mock data), `V1` (bản chạy thật đầu tiên), `V2` (mở rộng). Phạm vi MVP chuẩn: **A1–A3, A7, A11 (UI), A14, B3, B4, B5, B6 (mock), B8 (mock), B12 (demo luồng)** — mọi tài liệu khác mô tả MVP theo danh sách này.

### 10.A — Khu công khai và người thuê — route gốc `/`

**Khu công khai (khách chưa đăng nhập xem được):**

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| A1 | Trang chủ | `/` | Hero tìm kiếm, tin nổi bật (boost), khu vực hot | MVP |
| A2 | Kết quả tìm phòng | `/tim-phong` | Danh sách + bộ lọc (giá, khu vực, loại hình, diện tích, tiện ích, giờ giấc, điểm đánh giá — kèm toggle "gồm tin chưa có đánh giá") + bản đồ | MVP (lọc cơ bản) → V1 |
| A3 | Chi tiết tin cho thuê | `/phong/{id}` | Gallery, chi phí, tiện ích, giờ giấc, thời điểm đăng/cập nhật, badge điểm khu, liên hệ (redirect có `?redirect=`), nút Báo cáo | MVP → V1 (badge) |
| A4 | Trang khu trọ public | `/khu-tro/{slug}` | Tên khu, khu vực + điểm & danh sách đánh giá + tin đang cho thuê của khu | V1 |
| A5 | Danh sách tin nhu cầu | `/tin-tim-phong`, `/tin-o-ghep` | Tin tìm phòng / ở ghép công khai | V1 |
| A6 | Hồ sơ người đăng (public) | `/nguoi-dung/{id}` | Thông tin cơ bản + tin đang đăng (uy tín chủ khu = V2) | V1 |

**Khu người thuê (đã đăng nhập):**

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| A7 | Đăng ký / Đăng nhập / OTP / Quên MK | `/dang-ky`, `/dang-nhap`, … | Xác thực; hỗ trợ `?redirect=` | MVP |
| A8 | Tin đã lưu | `/tai-khoan/da-luu` | Favorite; cảnh báo tin đổi trạng thái | V1 |
| A9 | Quản lý tin nhu cầu của tôi | `/tai-khoan/tin-cua-toi` | Tạo/sửa/ẩn/gia hạn | V1 |
| A10 | Đăng tin nhu cầu (form) | `/tai-khoan/dang-tin-nhu-cau` | Wizard tìm phòng / ở ghép | V1 |
| A11 | Hộp thư / Chat | `/tin-nhan`, `/tin-nhan/{id}` | Danh sách hội thoại + khung chat | MVP (UI) → V1 |
| A12 | Thông báo | `/thong-bao` | Trung tâm thông báo, gồm thông báo được thêm vào phòng | V1 |
| A13 | **Phòng của tôi** | `/tai-khoan/phong-cua-toi` | Tab **"Đang ở"** (HĐ + danh sách hóa đơn kèm trạng thái, xem VietQR để chuyển khoản) + tab **"Lịch sử ở trọ"** (các đợt đã kết thúc, nút "Đánh giá khu" cho đợt chưa review) + gỡ liên kết nếu bị thêm nhầm | V1 |
| A14 | Hồ sơ & cài đặt | `/tai-khoan/ho-so` | Tên, ảnh đại diện, số điện thoại liên hệ, đổi mật khẩu, yêu cầu xóa tài khoản | MVP |

**Khu đăng tin của chủ trọ (`LANDLORD`, không cần gói dịch vụ):**

> Hai màn này **nằm ngoài khu quản lý vận hành** vì đăng tin là chức năng miễn phí của chợ tin
> đăng, không phụ thuộc gói dịch vụ. Route cũng nằm ngoài `/chu-tro` để phản ánh đúng điều đó.

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| B4 | Quản lý tin cho thuê | `/tai-khoan/tin-cho-thue` | Tin của tôi; tạo, sửa, đẩy nổi bật, gia hạn, xóa | MVP |
| B5 | Đăng tin cho thuê | `/dang-tin-cho-thue` | Biểu mẫu nhiều bước; có thêm bước chọn khu trọ nếu chủ trọ đã tạo khu | MVP |

### 10.B — Khu quản lý vận hành — route gốc `/chu-tro`

> Khu này dành cho chủ trọ và **cần gói dịch vụ còn hiệu lực**. Khi gói hết hạn, các nút ghi
> bị khóa và hệ thống báo lỗi kèm lời mời gia hạn, dữ liệu vẫn xem được.
>
> Hai màn đăng tin (B4, B5) **không thuộc khu này** — xem mục 10.A, vì đăng tin miễn phí.

| # | Màn hình | Route | Zone | Mô tả | Giai đoạn |
|---|---|---|---|---|---|
| B1 | Entry / Onboarding | `/chu-tro` | — | **2 lối:** "Đăng tin (miễn phí)" → B5; "Dùng thử bộ quản lý" → TRIAL → B2 | V1 |
| B2 | Onboarding wizard 3 bước | `/chu-tro/bat-dau` | SaaS | Property + nhận tiền (VietQR) → Room → (tùy chọn) Occupancy/Contract | V1 |
| B3 | Dashboard Landlord | `/chu-tro/tong-quan` | SaaS | Phòng trống (luôn hiện); lấp đầy, doanh thu/tổng phòng/số khách (toggle, mặc định TẮT); sắp hết hạn HĐ; chưa thu | MVP (mock) → V1 |
| B6 | Danh sách khu trọ | `/chu-tro/khu-tro` | SaaS | Danh sách khu + tổng phòng/trống; thêm khu | MVP (mock) → V1 |
| B7 | Chi tiết khu + nhận tiền + public | `/chu-tro/khu-tro/{id}` | SaaS | Sửa khu; STK/VietQR; bật hồ sơ public | V1 |
| B8 | Quản lý phòng | `/chu-tro/khu-tro/{id}/phong` | SaaS | Lưới phòng theo trạng thái; badge "Có tin đang chạy"; "Tạo tin từ phòng" | MVP (mock) → V1 |
| B9 | Chi tiết phòng | `/chu-tro/phong/{id}` | SaaS | Thông tin, người ở hiện tại (nhiều Occupancy), HĐ, hóa đơn gần đây | V1 |
| B10 | Quản lý người ở | `/chu-tro/phong/{id}/nguoi-o` | SaaS | Thêm theo số điện thoại (liên kết ngay hoặc lưu tên + SĐT), kết thúc ở, lịch sử | V1 |
| B11 | Hợp đồng | `/chu-tro/hop-dong`, `…/{id}` | SaaS | Tạo HĐ (chặn chồng lấn), upload scan, nhắc hết hạn, chấm dứt | V1 |
| B12 | Điện nước & Hóa đơn | `/chu-tro/hoa-don` | SaaS | UtilityReading → Invoice → xuất kèm VietQR (amount + mã HĐ) → gửi → "Đã thu" | MVP (demo luồng) → V1 |
| B13 | Chi tiết hóa đơn | `/chu-tro/hoa-don/{id}` | SaaS | Dòng hóa đơn, STK/QR, lịch sử thu | V1 |

| B15 | Gói SaaS của tôi | `/chu-tro/goi-dich-vu` | SaaS* | Xem hạn, dùng thử, mua, gia hạn, trạng thái giao dịch | V1 |
| B16 | Quản lý đánh giá khu | `/chu-tro/danh-gia` | SaaS* | Xem đánh giá khu của mình (phản hồi = V2) | V1 |
| B17 | Hộp thư sự cố | `/chu-tro/su-co`, `…/{id}` | SaaS | Nhận & xử lý báo cáo sự cố từ người ở: đổi trạng thái, trao đổi, xem ảnh | V1 |
| B18 | Duyệt chỉ số từ người ở | `/chu-tro/duyet-chi-so` | SaaS | Hàng đợi chỉ số người ở gửi lên: xem ảnh đồng hồ → xác nhận/sửa số/từ chối | V1 |

\* B15/B16 là màn **đọc** — vẫn xem được ở `READ_ONLY` (B15 phải xem được để còn gia hạn).

### 10.C — Khu dành cho người ở — route gốc `/nguoi-o`

> Giao diện web và ứng dụng di động dùng chung API. Điều kiện vào: tài khoản đã được liên kết với một phòng, đang ở hoặc đã từng ở.

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| C1 | Tổng quan phòng của tôi | `/nguoi-o` | Phòng đang ở, khu trọ, liên hệ chủ trọ, hợp đồng hiện tại | V1 |
| C2 | Thông báo được thêm vào phòng | `/nguoi-o/lien-ket` | Hiện phòng và khu vừa được chủ trọ thêm vào; nút "Không phải tôi" để tự gỡ nếu bị thêm nhầm | V1 |
| C3 | Hóa đơn của tôi | `/nguoi-o/hoa-don` | Danh sách hóa đơn theo kỳ, trạng thái đã/chưa thu | V1 |
| C4 | Chi tiết hóa đơn | `/nguoi-o/hoa-don/{id}` | Các dòng chi phí, **STK + VietQR để thanh toán**, lịch sử thu | V1 |
| C5 | Hợp đồng của tôi | `/nguoi-o/hop-dong` | Xem/tải hợp đồng và bản scan của chính mình | V1 |
| C6 | Báo cáo sự cố | `/nguoi-o/su-co` | Danh sách sự cố đã gửi + tạo mới (mô tả, ưu tiên, ảnh) | V1 |
| C7 | Chi tiết sự cố | `/nguoi-o/su-co/{id}` | Theo dõi trạng thái, trao đổi với chủ trọ, xác nhận đóng | V1 |
| C8 | Gửi chỉ số điện nước | `/nguoi-o/chi-so` | Nhập số + chụp ảnh đồng hồ (chỉ hiện khi khu bật) | V1 |
| C9 | Thông báo | `/nguoi-o/thong-bao` | Hóa đơn mới, nhắc hạn, cập nhật sự cố; push trên mobile | V1 |
| C10 | Lịch sử ở trọ | `/nguoi-o/lich-su` | Các đợt ở đã kết thúc; lối vào viết đánh giá khu từng ở | V1 |

**App mobile (Expo)** có các màn tương ứng C1–C10 với điều hướng tab: Phòng của tôi · Hóa đơn · Sự cố · Thông báo · Tài khoản. Bổ sung so với web: chụp ảnh trực tiếp từ camera cho sự cố và chỉ số đồng hồ, nhận push notification.

### 10.D — Khu quản trị và kiểm duyệt — route gốc `/admin`

| # | Màn hình | Route | Mô tả | Giai đoạn |
|---|---|---|---|---|
| D1 | Dashboard hệ thống | `/admin` | Tổng user/tin/doanh thu phí nền tảng | V1 |
| D2 | Kiểm duyệt tin | `/admin/duyet-tin` | Hàng đợi 3 loại tin, duyệt/từ chối (lý do) | V1 |
| D3 | Xử lý báo cáo | `/admin/bao-cao` | Report tin / tin nhắn / đánh giá; khóa hội thoại | V1 |
| D4 | Kiểm duyệt đánh giá | `/admin/danh-gia` | Hàng đợi review bị báo cáo | V1 |
| D5 | Quản lý người dùng | `/admin/nguoi-dung` | Khóa/mở (khóa → ẩn tin), điều chỉnh vai trò | V1 |
| D6 | Danh mục & cấu hình | `/admin/danh-muc` | Tiện ích, khu vực, khoảng giá, gói dịch vụ và thời gian dùng thử, phí và thời hạn đẩy tin, từ khóa cấm | V1 |

---

## 11. MODULE BACKEND (Modular Monolith — **17 module**)

> Backend là một ứng dụng NestJS duy nhất đặt tại `apps/api`, chia thành các module theo
> ranh giới domain ở mục 1.6. Hai domain nghiệp vụ **không gọi chéo trực tiếp** vào tầng dữ
> liệu của nhau; mọi trao đổi đi qua service công khai của module.

> Một codebase, một database; mỗi service là một module có ranh giới; giao tiếp qua interface nội bộ. **Danh sách này là chuẩn duy nhất** — tài liệu Kiến trúc và cấu trúc thư mục code theo đây. `TENANT` **chỉ** dùng làm giá trị vai trò; **không** dùng `Tenant`/`Tenancy` để đặt tên module, bảng hay khái niệm kỹ thuật, vì dễ nhầm với khái niệm multi-tenant trong ngành phần mềm. Module quản lý người ở và hợp đồng tên là `OccupancyContractModule`.

**Shared Kernel (5):**
| Service | Trách nhiệm |
|---|---|
| `AuthModule` | Đăng ký/đăng nhập, OTP, token + RefreshToken, vai trò (nâng cấp qua "Trở thành chủ trọ"; quản trị viên điều chỉnh), kiểm tra phân quyền |
| `UserProfileModule` | Profile, display settings, xóa tài khoản |
| `MediaModule` | Upload, signed URL, phân quyền file, job dọn media mồ côi |
| `NotificationModule` | Thông báo trong ứng dụng và qua SMS; tác vụ định kỳ (Overdue, Contract Expired, tin Expired, nhắc gói, TRIAL, giao dịch treo) |
| `MessagingModule` | Conversation/Message, chặn, self-contact guard |

**Domain Marketplace (6):**
| Service | Trách nhiệm |
|---|---|
| `ListingModule` | RentalListing: vòng đời, boost, tạo từ phòng, đồng bộ từ Room, ẩn khi user Locked |
| `DemandPostModule` | Tin tìm phòng / ở ghép |
| `SearchModule` | Tìm kiếm/lọc/sắp xếp/phân trang; hành vi lọc điểm đánh giá; gợi ý phòng |
| `FavoriteModule` | Lưu tin, báo đổi trạng thái |
| `ReviewModule` | Verify điều kiện review, avgRating, trang khu public |
| `ModerationModule` | Duyệt tin, lọc BannedKeyword, xử lý Report, khóa hội thoại, audit |

**Domain Property Management / SaaS (6):**
| Service | Trách nhiệm |
|---|---|
| `PropertyRoomModule` | Property (+ nhận tiền, cờ public), Room, trạng thái |
| `OccupancyContractModule` | Người ở (liên kết tài khoản, ngày kết thúc), hợp đồng, bản chụp hợp đồng |
| `BillingModule` | UtilityReading, Invoice/Item (unique mới), Payment, VietQR (amount + mã HĐ), job Overdue |
| `SubscriptionModule` | Plans (+ plan Trial), UserSubscription, **gating guard 4 trạng thái**, hạn mức/over-limit, `PlatformTransaction` + webhook + idempotency |
| `AnalyticsModule` | Báo cáo kinh doanh cho chủ trọ và quản trị viên, thống kê lượt liên hệ |
| `ResidencyModule` | Trải nghiệm người ở: read-view phòng/hợp đồng/hóa đơn của chính mình, `Incident` + `IncidentComment`, `UtilityReadingSubmission`, `DeviceToken` cho push |

> `SubscriptionModule` cung cấp một **lớp kiểm tra chạy trước** mà mọi module quản lý vận hành
> gọi tới trước khi cho ghi dữ liệu, để chặn thao tác khi gói dịch vụ đã hết hạn.

> `ResidencyModule` cung cấp lớp kiểm tra cho nhóm endpoint của người ở: xác minh người gọi có
> bản ghi người ở đã liên kết, và bản ghi đang truy cập đúng là của họ. Module này **chỉ đọc**
> dữ liệu của các module quản lý vận hành khác qua interface công khai — một chiều, không sinh
> phụ thuộc vòng.

---

## 12. NON-FUNCTIONAL REQUIREMENTS (tóm tắt)

- **Hiệu năng:** tìm kiếm < 1.5s giai đoạn đầu; phân trang server-side; index theo Mục 6.
- **Bảo mật:** bcrypt/argon2; JWT access ngắn + refresh (lưu DB, thu hồi khi logout); file riêng tư qua signed URL; cô lập theo `landlordId`; rate limit login/OTP/đăng tin/nhắn tin.
- **Riêng tư:** trang khu công khai không lộ dữ liệu vận hành; các chỉ số nhạy cảm trên báo cáo mặc định ẩn; mã QR sinh tại máy người dùng, không gửi số tài khoản sang bên thứ ba.
- **Độ tin cậy:** thao tác đa bước bọc **transaction** (tạo Contract → RoomStatus → Notification; Room Rented → listing Rented; Invoice từ nhiều Item); webhook idempotent.
- **Khả mở rộng:** ranh giới domain rõ; storage tách khỏi DB; stateless API.
- **Bảo trì:** chuẩn REST 7.5; soft delete; audit Admin.

---

## 13. BẢNG ASSUMPTIONS CHUẨN (duy nhất — các tài liệu khác tham chiếu theo mã ở đây)

| Mã | Giả định |
|---|---|
| AS-001 | Liên hệ qua 2 kênh: nhắn tin in-app + gọi điện; không tích hợp Zalo; không đặt lịch xem phòng |
| AS-002 | Nền tảng KHÔNG cầm/thu hộ tiền thuê; hóa đơn kèm STK/VietQR của khu; chủ trọ tự ghi nhận thu; gateway chỉ thu phí nền tảng qua giao dịch phí nền tảng; đối soát ngân hàng tự động = tương lai |
| AS-003 | Gói SaaS bán đứt 36 tháng ~600.000đ (tham khảo); gia hạn ưu đãi 150.000–180.000đ/năm; nhắc 6/2/1 tháng; Workspace 4 trạng thái; TRIAL theo plan Trial (mặc định 1 tháng, 1 Property, 5 Room); hết hạn → read-only, giữ dữ liệu |
| AS-004 | Mỗi tài khoản mang đúng một vai trò (`TENANT`, `LANDLORD`, `STAFF`, `ADMIN`), không kế thừa; người thuê nâng cấp thành chủ trọ qua thao tác "Trở thành chủ trọ", một chiều (mục 1.8, BR-013) |
| AS-005 | Landlord là chủ BĐS hoặc người được ủy quyền (cò trọ); nền tảng không môi giới, không phân biệt người đăng |
| AS-006 | Occupancy `userId` nullable; chủ trọ liên kết tài khoản bằng số điện thoại, có hiệu lực ngay, người được liên kết có nút "Không phải tôi" để tự gỡ (BR-029); hệ thống single-sided — chủ trọ nhập điện nước |
| AS-007 | Review verified-only; chủ không dùng SaaS → khu không có review (có chủ đích, tạo động lực dùng SaaS) |
| AS-008 | "Phòng của tôi" V1 chỉ xem; người ở tự nhập điện nước + báo sự cố = V2 |
| AS-009 | Người ở gửi chỉ số điện nước cho chủ qua kênh ngoài (thủ công, không tích hợp); ngoài ra có kênh trong app tùy chọn — chủ trọ bật `allowOccupantMeterSubmission` và **phải duyệt** trước khi thành chỉ số chính thức |
| AS-010 | Hồ sơ khu public là opt-in; review viết được trước, hiển thị khi bật |
| AS-011 | Chat: UI từ MVP, nghiệp vụ đầy đủ V1; realtime polling → WebSocket/SSE sau |

| AS-012 | *(không dùng — bỏ cùng tính năng hỗ trợ thuế)* |
| AS-013 | Thông tin nhận tiền (STK/QR) đặt theo từng Property |
| AS-014 | MVP demo = danh sách màn hình chuẩn ở Mục 10 (A1–A3, A7, A11-UI, A14, B3, B4, B5, B6, B8, B12), chạy mock data, chưa xây BE/DB chi tiết |
| AS-015 | Kiểm duyệt = lọc từ khóa (từ khóa cấm) + Staff duyệt tay; chưa AI moderation |
| AS-016 | Con số performance/availability là mục tiêu giả định, tinh chỉnh sau khi đo tải |
| AS-017 | Đơn giá điện/nước do Landlord tự nhập, không lấy biểu giá nhà nước |
| AS-018 | Map dùng bên thứ ba; geocoding khi đăng tin |
| AS-019 | Web (ba khu giao diện) bằng **Next.js App Router**; **ứng dụng di động Expo cho người ở**; cả ba ứng dụng nằm trong monorepo `tro-nhanh` cùng các package dùng chung; styling **Tailwind v3 + NativeWind**. Chủ trọ dùng web, không có ứng dụng riêng |
| AS-021 | App người ở là **lớp cộng thêm, không phải điều kiện tiên quyết** — mọi nghiệp vụ chủ trọ chạy đủ kể cả khi không người ở nào có tài khoản (Occupancy fallback `userId` null) |
| AS-022 | Residency là **module trong domain SaaS**, không phải bounded context thứ ba (lý do ở 1.6) |
| AS-023 | Không tạo vai trò riêng cho người ở; quyền vào khu người ở suy ra từ việc tài khoản có được liên kết với phòng hay không |
| AS-024 | Báo cáo vi phạm bắt buộc đăng nhập, Guest không gửi được |
| AS-020 | Backend viết bằng **NestJS trên TypeScript**, nằm trong cùng monorepo `tro-nhanh` tại `apps/api`. Truy cập dữ liệu qua Prisma; mọi thay đổi cấu trúc dữ liệu đi qua file migration có đánh số, không sửa tay trực tiếp trên cơ sở dữ liệu |
| AS-026 | Cổng thanh toán dùng **PayOS**, chỉ thu phí dịch vụ của nền tảng. Chọn vì không đòi hỏi giấy phép kinh doanh và mô hình webhook khớp luồng đã thiết kế |
| AS-027 | Địa chỉ dùng **mô hình hành chính hai cấp** (tỉnh/thành → phường/xã) theo quy định áp dụng từ 01/07/2025; lọc theo mã, hiển thị theo tên |
| AS-028 | SMS **chỉ dùng cho mã xác thực**; mọi nhắc hạn đi qua thông báo trong ứng dụng và trên web |
| AS-025 | Định nghĩa dữ liệu dùng chung đặt ở `packages/schemas` dưới dạng Zod schema — backend dùng để kiểm tra đầu vào, web và mobile dùng cho biểu mẫu. Không còn bước sinh mã từ tài liệu API |

---

## 14. ROADMAP & ĐỊNH HƯỚNG GIAI ĐOẠN

### 14.1 Phân kỳ tính năng

| Giai đoạn | Trọng tâm |
|---|---|
| **MVP** | Danh sách màn hình chuẩn (Mục 10), chạy mock để demo. **Nguyên tắc:** mock **dữ liệu và trạng thái** (dropdown giả lập vai trò và trạng thái gói), KHÔNG mock **cấu trúc luồng** — route, guard, 2 zone sidebar đúng bản cuối ngay từ MVP; sang V1 chỉ thay nguồn dữ liệu bằng `GET /me` + API thật. Mục tiêu: kiểm chứng nhu cầu & mức sẵn lòng trả. |
| **V1** | Nghiệp vụ thật đầy đủ: Auth/RBAC/gating thật; khu trọ, phòng, người ở, hợp đồng, hóa đơn, ghi nhận thu tiền; giao dịch phí nền tảng + webhook; Messaging đầy đủ; Review verified; bản đồ; **Residency shell + app mobile người ở** (tổng quan phòng, hóa đơn, báo sự cố, gửi chỉ số có duyệt, push); Admin/Moderation. |
| **V2** | Điểm uy tín chủ khu; chủ khu phản hồi review; versioning tin khi duyệt lại; block user toàn cục; đối soát ngân hàng; WebSocket realtime; nâng gói giữa kỳ. |

### 14.2 Defense — vì sao Review chọn verified-only (chuẩn bị phản biện)

**Lập luận lõi:** giá trị của review nằm ở **độ tin cậy**, không ở số lượng — và độ tin cậy là thứ duy nhất Facebook/đối thủ không làm được. Cho đánh giá tự do = tái tạo đúng vấn đề "tin ảo" đang muốn giải.

Bốn trụ đỡ: (1) **Chiến lược** — verified là USP; (2) **Kinh doanh** — review gắn SaaS tạo flywheel: chủ dùng SaaS → khu có nhãn uy tín → tin dễ lấp phòng → hút chủ khác dùng SaaS (flywheel này hoạt động được nhờ tin đăng gắn được `propertyId` từ form — Module 3); (3) **Kỹ thuật** — chống gian lận ở tầng cấu trúc, không cần đội kiểm duyệt lớn; (4) **Lean** — nhóm hạt nhân dùng SaaS nên có review mẫu ngay.

**"Chủ không dùng SaaS thì khu không có review" không phải bug mà là thiết kế có chủ đích** — tương tự "shop không bán trên Shopee thì không có review Shopee". Tin của chủ chưa dùng SaaS vẫn hiển thị đầy đủ & đã kiểm duyệt; review là lớp tin cậy thêm, đồng thời là động lực dùng SaaS.

**Rủi ro gian lận và ba lớp chặn:** (1) cấm chủ khu tự đánh giá khu của mình; (2) điều kiện mở quyền đánh giá — hợp đồng tồn tại ít nhất 30 ngày **hoặc** đã có ít nhất một lần ghi nhận thu tiền, nên tạo hợp đồng khống thôi chưa đủ; (3) báo cáo từ **cả hai phía** — người dùng và chủ trọ — kèm tự ẩn khi có từ 3 báo cáo trở lên và kiểm duyệt bởi nhân viên vận hành.

**Vì sao bỏ bước xác nhận liên kết mà không làm yếu đi khả năng chống giả:** bước xác nhận từng được liệt kê như một lớp chặn — "không gắn được tài khoản chim mồi âm thầm". Nhưng thực tế nó **chưa bao giờ chặn được**: tài khoản chim mồi do chính chủ trọ tạo và kiểm soát, nên chủ trọ tự bấm xác nhận cho nó. Bỏ bước này không mất lớp bảo vệ thật nào; ba lớp còn lại mới là lớp chặn thực sự.

Không hệ thống nào chống giả được 100%. Một chủ trọ quyết tâm vẫn có thể tạo tài khoản bằng số điện thoại mình kiểm soát, lập hợp đồng và ghi nhận thu tiền khống để đủ điều kiện. Nhưng chi phí gian lận ở đây cao hơn hẳn đánh giá tự do, và tài liệu chọn nói rõ giới hạn này thay vì hứa quá.

---

*— Hết —*