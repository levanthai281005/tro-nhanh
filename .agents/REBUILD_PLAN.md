# Lộ trình rebuild từ prototype

Kế hoạch chuyển giao diện từ bản demo cũ sang repo này. Quy trình thao tác cho từng trang nằm
ở `tasks/PORT_PAGE_FROM_PROTOTYPE.md`; bảng tra chuyển đổi nằm ở
`skills/porting-prototype-ui/`.

---

## Điểm xuất phát

| | Prototype | Repo này |
|---|---|---|
| Framework | Vite + React + react-router (hash router) | Next.js App Router |
| Backend | Supabase | Spring Boot qua `@tronhanh/api` |
| Styling | Inline `style={{}}` (~2.590 lần) + token trong `shared/theme.ts` | Tailwind v3 + preset dùng chung |
| Form | Formik + Yup (chỉ ở `DangTinPage`) | React Hook Form + Zod |
| Mobile | Không có | Expo React Native |

Quy mô prototype: 150 file TypeScript, 33.898 dòng, 57 trang.

## Nguyên tắc

**Refactor TRONG lúc port, không refactor trước.** Dọn code ở repo prototype là công toi vì
mỗi file sắp được viết lại cả về framework, styling lẫn tầng dữ liệu. Mỗi trang chỉ chạm một
lần: vừa chuyển framework, vừa chuyển styling, vừa tách nhỏ.

**Giữ nguyên bố cục và câu chữ.** Thiết kế của prototype đã được người dùng thật đánh giá tốt
ở buổi bảo vệ. Không "cải thiện" khi port.

---

## Phân loại tài sản

| Giữ gần như nguyên | Chuyển đổi khi port | Bỏ hẳn |
|---|---|---|
| Bố cục JSX, câu chữ tiếng Việt, luồng UX | `style={{}}` → Tailwind class | `shared/services/*` (Supabase) |
| Token màu (đã chuyển sang preset) | Supabase → `@tronhanh/api` | `shared/types/database.types.ts` |
| `vn-wards.generated.ts` (3.345 dòng dữ liệu phường xã) | react-router → `next/navigation` | `shared/utils/dbSeeder.ts` |
| Catalog constants (loại phòng, khoảng giá, tiện ích) | Formik/Yup → RHF/Zod | `routes/` (`createHashRouter`) |
| `StyleGuidePage` (làm tham chiếu design system) | Component chung → bản Tailwind | Thư mục `supabase/` |

---

## Sáu giai đoạn

**Giai đoạn 0 — Nền thiết kế.** Preset token, ESLint guard. ✅ Xong ở `feat/design-tokens`.

**Giai đoạn 1 — Component chung + StyleGuide.** Mọi trang phụ thuộc vào đây. Cổng nghiệm thu:
StyleGuide bản mới nhìn giống bản prototype.

**Giai đoạn 2 — Trang chuẩn vàng.** Port một trang cỡ vừa thật kỹ, có giám sát. Trang này
thành chuẩn cấu trúc cho mọi trang sau.

**Giai đoạn 3 — Lát cắt dọc MVP.** Ba luồng lõi, mỗi luồng xong trọn vẹn rồi mới sang luồng
kế: xem tin → đăng tin → dashboard chủ trọ.

**Giai đoạn 4 — Phần còn lại.** Quản lý phòng, hóa đơn, hợp đồng, đánh giá, khu Admin.

**Giai đoạn 5 — Viết mới + mobile.** Residency shell (prototype chưa có), hộp thư sự cố và
duyệt chỉ số phía chủ trọ, rồi app Expo.

---

## Bảng ánh xạ trang

Mã màn hình tra ở `business/SCREENS_*.md`.

| Trang prototype | Mã | Route mới |
|---|---|---|
| `HomePage` | A1 | `/` |
| `SearchResultsPage`, `AllListingsPage` | A2 | `/tim-phong` |
| `RoomDetailPage` | A3 | `/phong/[id]` |
| `PropertyDetailPage` | A4 | `/khu-tro/[slug]` |
| `DemandListPage`, `DemandDetailPage` | A5 | `/tin-tim-phong`, `/tin-o-ghep` |
| `LoginPage`, `RegisterPage` | A7 | `/dang-nhap`, `/dang-ky` |
| `SavedListingsPage` | A8 | `/tai-khoan/da-luu` |
| `MyDemandPostsPage` | A9 | `/tai-khoan/tin-cua-toi` |
| `PostDemandPage` | A10 | `/tai-khoan/dang-tin-nhu-cau` |
| `InboxPage` | A11 | `/tin-nhan` |
| `AccountPage` | A14 | `/tai-khoan/ho-so` |
| `ChuTroDashboardPage` | B3 | `/chu-tro/tong-quan` |
| `QuanLyPage` | B4 | `/tai-khoan/tin-cho-thue` |
| `DangTinPage` | B5 | `/dang-tin-cho-thue` (không có tiền tố `/chu-tro`) |
| `QuanLyPhongPage` (các view) | B6–B10 | `/chu-tro/khu-tro/*` |
| `LandlordBillingPage` | B12, B13 | `/chu-tro/hoa-don` |
| `LandlordReviewsPage` | B16 | `/chu-tro/danh-gia` |
| `MyStaysPage` | C1, C10 | `/nguoi-o`, `/nguoi-o/lich-su` |
| `admin/pages/*` | D1–D6 | `/admin/*` |

**Phải viết mới, prototype không có:** C2–C9 (xác nhận liên kết, hóa đơn của tôi, hợp đồng,
báo sự cố, gửi chỉ số, thông báo), B15 (gói SaaS), B17 (hộp thư sự cố), B18 (duyệt chỉ số),
toàn bộ app mobile.

---

## Ba trang nặng cần chia nhỏ

Port từng khối, commit sau mỗi khối. Không port một lượt.

| Trang | Số dòng | Ghi chú |
|---|---|---|
| `RoomDetailPage` | 1.098 | Chứa 17 component định nghĩa trong cùng file |
| `HomePage` | 1.079 | Nhiều section độc lập, dễ tách |
| `SearchResultsPage` | 836 | Bộ lọc phức tạp, tách phần lọc thành component riêng |

Mẫu tách tốt đã có sẵn trong prototype: `DangTinPage/` (chia 5 bước) và `QuanLyPhongPage/`
(chia theo view) — làm theo hai thư mục này.

---

## Rủi ro và cách xử lý

**Lệch giao diện khi đổi styling.** Đổi ~2.590 inline style rất dễ sai lệch màu hoặc khoảng
cách mà không ai nhận ra. Cách phòng: dùng StyleGuide làm mốc; khi port mỗi trang thì mở
prototype song song mà so.

**Port trang nặng bị sa lầy.** Tách trước theo khối rồi port từng khối, commit sau mỗi khối.

**Backend chưa sẵn sàng.** Không chờ — dùng dữ liệu mẫu khớp đúng type đã sinh, đánh dấu
`TODO`. Khi API thật xong chỉ đổi nguồn.

**Port nguyên nghiệp vụ lỗi thời.** Prototype dựng trước khi chốt gating 4 trạng thái, đánh
giá verified, consent liên kết người ở. Khi port phải đối chiếu mã BR trong
`business/BUSINESS_RULES.md`.

**Port cả thứ đã bỏ khỏi phạm vi.** Trước khi port một trang, kiểm tra nó có trong danh sách
màn hình `business/SCREENS_*.md` hay không.
