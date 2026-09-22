# Kiến trúc domain và các shell giao diện

Cách hệ thống chia thành hai bounded context và một shared kernel, cách frontend tách thành
ba shell và hai zone. Quyết định đặt code ở đâu phải dựa trên tài liệu này.

---

## Kiến trúc 2 Domain + Shared Kernel; frontend 2 shell + 2 zone

Để hai nhóm Dev phát triển song song mà ít giẫm chân, hệ thống tách rõ thành **2 bounded context** và **1 shared kernel**. Đây là tách **logic** (cùng 1 codebase backend, cùng 1 database) — KHÔNG phải tách 2 service/2 DB riêng.

> **Lý do không tách hẳn 2 service + 2 DB:** nhiều flow đi xuyên 2 domain trong một thao tác (vd tạo `Contract` → đổi `RoomStatus` → sinh `Notification`). Nếu 2 DB riêng, các thao tác này mất tính `transaction` (đảm bảo "thành công hết hoặc rollback hết"), phải xử lý bằng saga/event — phức tạp gấp nhiều lần, quá sức cho team nhỏ. Tách logic giữ được transaction đơn giản mà vẫn có ranh giới sạch để **sẵn sàng tách service sau này**.

**Domain A — Marketplace** (hướng người thuê, public): tin cho thuê + tin nhu cầu (Module 3, 4); tìm kiếm & lọc (12); yêu thích (11); đánh giá khu trọ (18); kiểm duyệt & báo cáo (13 phần tin, 14).

**Domain B — Property Management / SaaS** (hướng chủ trọ, có gating): khu & phòng (5, 6); người ở & hợp đồng (7, 8); hóa đơn/điện nước/thu tiền (9); gói SaaS (15); dashboard vận hành (16); **Residency — trải nghiệm phía người ở (19)**.

**Shared Kernel** (dùng chung): Auth & User (1); Profile (2); Notification & Reminder (10); Messaging (17); Media (xuyên suốt).

> **Lý do Residency là module trong SaaS, không phải bounded context thứ ba:** (a) *phụ thuộc* — người ở chỉ sinh ra từ `Occupancy` do chủ trọ tạo, không có SaaS thì không tồn tại người ở; (b) *tránh phụ thuộc vòng* — nếu tách riêng, hộp thư sự cố của chủ trọ phải đọc `Incident` (SaaS → Residency) trong khi màn "hóa đơn của tôi" phải đọc `Invoice` (Residency → SaaS), khóa vòng thì mất luôn khả năng tách service sau này; (c) *không cắt quy trình* — `UtilityReadingSubmission` là giai đoạn nháp của `UtilityReading`, tách context thì thao tác duyệt phải ghi xuyên context; (d) *cùng ngôn ngữ nghiệp vụ* — sự cố, bảo trì, hóa đơn đều là ngôn ngữ vận hành BĐS. Nguyên tắc: **bounded context chia theo quyền sở hữu dữ liệu, không chia theo đối tượng người dùng**; khác đối tượng thì tách ở tầng giao diện và API namespace.

**Nguyên tắc phụ thuộc:** Marketplace và SaaS **được phép gọi xuống** Shared Kernel, nhưng **không gọi chéo trực tiếp** vào table của nhau — giao tiếp qua *interface* nội bộ. Các điểm nối hợp lệ giữa 2 domain (một chiều, qua interface): (a) "Tạo tin từ phòng trống" (SaaS → Marketplace); (b) đồng bộ trạng thái tin khi Room đổi trạng thái (SaaS → Marketplace, BR-027); (c) Marketplace đọc dữ liệu Review/avgRating gắn Property; (d) `ReviewModule` đọc Contract/Occupancy để xác minh quyền review.

**Frontend — tách 3 shell, shell Workspace chia 2 zone:**

| Shell | Phạm vi route | Người dùng | Nhóm Dev |
|---|---|---|---|
| **Public/Tenant shell** | `/`, `/tim-phong`, `/phong/{id}`, `/khu-tro/{slug}`, `/tai-khoan/*` | Guest, Tenant | Nhóm A |
| **Management Workspace shell** | `/chu-tro/*` | Landlord | Nhóm B |
| **Residency shell** | `/nguoi-o/*` | Tài khoản đã liên kết với một phòng — `residencyStatus ∈ {ACTIVE, PAST}` | Nhóm C |

**App mobile người ở** dùng chung API với Residency shell; chủ trọ dùng web (Workspace là dashboard nhiều bảng biểu, hợp màn hình lớn).

> **Nguyên tắc bất biến — app người ở là lớp cộng thêm, không phải điều kiện tiên quyết:** mọi nghiệp vụ của chủ trọ phải chạy trọn vẹn ngay cả khi **không một người ở nào có tài khoản**. Occupancy fallback (`userId` null) luôn hoạt động đầy đủ. Giữ được điều này thì việc mở giao diện cho người ở chỉ nâng cấp trải nghiệm, không tạo điểm gãy phụ thuộc vào việc người ở chịu cài app.

Bên trong shell Workspace:

| Zone | Màn hình | Điều kiện vào | Gating? |
|---|---|---|---|
| **Zone Tin đăng** (Marketplace) | B4 Quản lý tin, B5 Đăng tin cho thuê — route nằm ngoài `/chu-tro` | Vai trò Landlord | **KHÔNG** — Marketplace luôn miễn phí |
| **Zone Quản lý vận hành** (SaaS) | B1–B3, B6–B16 | Vai trò Landlord + `subscriptionStatus ∈ {TRIAL, ACTIVE}` | Có; `READ_ONLY` chỉ đọc; `NONE` thấy màn mời dùng thử |

Sidebar Workspace hiển thị đúng 2 nhóm ("Tin đăng — miễn phí" / "Quản lý vận hành — SaaS") để chủ trọ luôn thấy rõ cái gì free, cái gì thuộc gói — vừa minh bạch vừa là điểm chạm upsell tự nhiên.

Ba shell **chung component library, chung API client, chung 1 web app** (route-prefix khác nhau) — chưa tách subdomain để khỏi tốn nhiều build/deploy. Ranh giới thiết kế sao cho **về sau tách `app.tronhanh.vn` chỉ là đổi routing**, không phải viết lại.

**Stack:**

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Web (cả 3 shell) | **Next.js (App Router)** | SSR cho trang tin đăng để Google index được — SEO là kênh thu hút người thuê; hệ sinh thái UI phong phú |
| App người ở | **Expo React Native** | Cùng React + TypeScript với web: dùng chung type, API client, Zod schema và tư duy file-based routing (Expo Router ≈ App Router) |
| Backend | **NestJS · TypeScript · Node 22 LTS** | Cùng ngôn ngữ với web và mobile nên dùng chung được định nghĩa dữ liệu; cấu trúc module của NestJS ánh xạ thẳng sang hai domain nghiệp vụ |
| Tổ chức mã nguồn | **Một monorepo `tro-nhanh`** (pnpm workspace + Turborepo): `apps/web`, `apps/mobile`, `apps/api` cùng `packages/schemas`, `types`, `constants`, `utils`, `config` (thực tế còn `api` — HTTP client — và `access` — luật truy cập) | Cả ba ứng dụng cùng hệ TypeScript nên dùng chung được định nghĩa dữ liệu; sửa một trường là cả ba báo lỗi biên dịch ngay |
| Định nghĩa dữ liệu dùng chung | **Zod schema** trong `packages/schemas` | Một nguồn chân lý duy nhất: backend dùng để kiểm tra dữ liệu đầu vào, web và mobile dùng cho biểu mẫu, kiểu dữ liệu suy ra từ chính schema (`z.infer`). Tài liệu API sinh từ NestJS chỉ để người đọc, không còn là cầu nối kỹ thuật |
| Styling | **Tailwind CSS (web) + NativeWind (mobile)** | Chung ngôn ngữ utility-first và **chung một file preset** (màu, font, spacing) đặt ở `packages/config` — đổi màu thương hiệu một chỗ, cả web lẫn app đổi theo |

> **Backend là một ứng dụng NestJS duy nhất** đặt tại `apps/api`, chia thành 17 module theo ranh giới domain ở trên (danh sách chuẩn ở `BACKEND_SERVICES.md`). Truy cập dữ liệu qua **Prisma**; mọi thay đổi cấu trúc dữ liệu đi qua **file migration có đánh số** — migration là nguồn chân lý về cấu trúc, không sửa tay trực tiếp trên cơ sở dữ liệu.

> **Ràng buộc version cần tuân thủ:** NativeWind bản ổn định yêu cầu **Tailwind v3** (`tailwindcss@^3.4.17`) cùng peer dependency `react-native-reanimated` và `react-native-safe-area-context`; cấu hình theo kiểu v3 (`tailwind.config.js` + `presets: [require("nativewind/preset")]`). Vì `create-next-app` mặc định cài Tailwind v4 (cấu hình CSS-first bằng `@theme`, bỏ file config), **phải chỉ định Tailwind v3 khi khởi tạo web** — nếu không sẽ không dùng chung được preset. NativeWind v5 (hỗ trợ Tailwind v4) còn ở giai đoạn pre-release, để dành cho lần nâng cấp sau.

> **Kỳ vọng đúng về mức chia sẻ:** NativeWind cho **chung ngôn ngữ thiết kế và preset**, KHÔNG cho dùng chung component — `View`/`Text` của React Native khác `div`/`p` của web, và React Native không có CSS grid thật. Giao diện vẫn viết riêng cho từng nền tảng.

Cấu trúc chống lỗi lan: mỗi shell là một **route group** riêng của App Router (`(public)`, `(workspace)`, `(residency)`) với layout và error boundary riêng — lỗi ở layout Workspace không kéo sập trang công khai. Thêm **ESLint rule chặn import chéo** giữa các thư mục `features/*` (nguyên tắc giống hệt "không gọi chéo domain" ở backend), **CODEOWNERS** theo thư mục, và CI bắt buộc typecheck + lint + build trước khi merge. Thư mục `shared/` là vùng nhạy cảm — sửa cần hai người review vì đây là chỗ duy nhất thực sự có thể gây lỗi toàn cục.
