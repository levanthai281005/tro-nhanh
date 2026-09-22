# Bảng chuyển routing sang Next.js App Router

Prototype dùng `react-router` với hash router (URL dạng `/#/phong/1`). Repo này dùng App
Router.

| Prototype | Next.js |
|---|---|
| `import { useNavigate } from "react-router-dom"` | `import { useRouter } from "next/navigation"` |
| `const navigate = useNavigate()` | `const router = useRouter()` |
| `navigate("/tim-phong")` | `router.push("/tim-phong")` |
| `navigate(-1)` | `router.back()` |
| `navigate("/x", { replace: true })` | `router.replace("/x")` |
| `useParams()` | Server Component: nhận qua prop `params`. Client Component: `useParams()` từ `next/navigation` |
| `useSearchParams()` | `useSearchParams()` từ `next/navigation` |
| `useLocation().pathname` | `usePathname()` từ `next/navigation` |
| `<Link to="/phong/1">` | `<Link href="/phong/1">` từ `next/link` — đổi prop `to` thành `href` |
| Route `/phong/:id` | Thư mục `app/(public)/phong/[id]/page.tsx` |

## Quy tắc `'use client'`

Mặc định mọi component là Server Component. Chỉ thêm `'use client'` khi component thật sự
cần `useState`, `useEffect`, event handler, hoặc các hook `next/navigation` ở trên.

Đặt chỉ thị ở **component lá càng sâu càng tốt**. Không đánh dấu cả trang chỉ vì một nút
bấm, và **không đặt `'use client'` trong `page.tsx`** — tách phần tương tác thành Client
Component riêng rồi import vào page.

## Ánh xạ route group

| Khu | Thư mục | Người dùng |
|---|---|---|
| Marketplace | `app/(public)/` | Guest, Tenant |
| Chủ trọ | `app/(workspace)/chu-tro/` | Landlord |
| Người ở | `app/(residency)/nguoi-o/` | Tài khoản đã liên kết với phòng (`residencyStatus` ACTIVE/PAST) |
