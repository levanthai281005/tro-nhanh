# Coding Standards

## Quy tắc dùng chung

- Dùng absolute import qua alias `@/*`; tránh chuỗi import tương đối nhiều cấp.
- Giữ ESLint, Prettier và TypeScript `strict: true` hoạt động trên toàn dự án.
- Không dùng explicit `any`; dùng type cụ thể hoặc `unknown` rồi thu hẹp an toàn.
- Không import chéo giữa các feature domain. Logic thực sự dùng chung phải được chuyển đến
  component, utility hoặc package dùng chung phù hợp.
- Server state thuộc TanStack Query. Zustand chỉ dành cho trạng thái client/UI không có
  nguồn gốc từ server.
- Mọi request phải có trạng thái loading, empty và error phù hợp với trải nghiệm của nền
  tảng.

## Next.js

### Server-first rendering

- Page, layout và component mặc định là Server Component.
- Chỉ thêm `'use client'` khi cần React Hook, event trình duyệt hoặc browser API.
- Đặt client boundary ở phần nhỏ và sâu nhất có thể trong cây giao diện.
- Không đặt `'use client'` trực tiếp trong `page.tsx`; tách phần tương tác thành Client
  Component riêng rồi import vào page.

### Data fetching và caching

- Lấy dữ liệu bằng `async`/`await` trực tiếp trong Server Component, gần nguồn dữ liệu.
- Khai báo chiến lược cache minh bạch cho từng request; dùng `revalidate`, cache tag hoặc
  `cacheLife`/`staleTimes` phù hợp với cơ chế Next.js đang bật.
- **Mọi thao tác ghi đi qua `apps/api`** (service của feature → TanStack Query mutation).
  Server Actions chỉ dành cho việc thuần server của web như đặt cookie phiên hoặc
  revalidate — không ghi thẳng DB, vì quy tắc nghiệp vụ và kiểm tra quyền sẽ phải viết hai lần.
- Server Action nếu có vẫn phải tự xác thực danh tính; không xem việc chỉ được gọi từ giao
  diện là một lớp bảo mật.
- Sau mutation, chủ động revalidate path/tag liên quan khi dữ liệu hiển thị cần được làm mới.

### Performance

- Không dùng thẻ `<img>` thô. Dùng `Image` từ `next/image`, khai báo `sizes`, và dùng
  `priority` cho ảnh biểu ngữ quan trọng khi phù hợp để hạn chế CLS.
- Web sử dụng Google Font `Be Vietnam Pro` qua khai báo `@import` trong `globals.css` và
  shared Tailwind preset; không chuyển sang `next/font` nếu chưa có quyết định kiến trúc mới.
- Dùng `Link` từ `next/link` cho điều hướng nội bộ để tận dụng prefetching.

### Security

- Biến bí mật chỉ được đọc trong code server. Chỉ biến thực sự công khai mới được đặt tiền
  tố `NEXT_PUBLIC_` và truy cập từ Client Component.
- Đặt code server nhạy cảm trong `server/` của feature và cân nhắc đánh dấu bằng
  `server-only` để ngăn import nhầm vào client bundle.
- Không xem việc Server Action chỉ được gọi từ giao diện là một lớp bảo mật.

## Expo và React Native

### Rendering và component boundaries

- Expo không có Server Component mặc định như Next.js; screen và component chạy trong ứng
  dụng client. Không thêm `'use client'` hoặc `'use server'` vào code mobile.
- Route file trong `src/app` chỉ điều phối navigation, layout và screen cấp cao. Đưa UI và
  logic nghiệp vụ vào feature tương ứng để route luôn gọn.
- Dùng component React Native như `View`, `Text`, `Pressable`, `ScrollView` và `FlatList`;
  không dùng thẻ DOM trong code chạy native.
- Tôn trọng safe area bằng `SafeAreaView` hoặc inset từ `react-native-safe-area-context` tại
  screen/layout phù hợp.
- Khi hành vi khác nhau đáng kể giữa nền tảng, ưu tiên platform-specific file; dùng
  `Platform.select` cho khác biệt nhỏ.

### Routing

- Dùng Expo Router và typed routes cho điều hướng nội bộ.
- Dùng `Link`, `router.push`, `router.replace` hoặc API từ `expo-router`; không cài và import
  trực tiếp API tương đương từ `@react-navigation/*` khi Expo Router đã cung cấp.
- Khai báo screen option tại `_layout.tsx` gần route group sở hữu nó.
- Deep link và tham số route phải được parse, kiểm tra và thu hẹp type trước khi sử dụng.

### Data fetching và state

- Dùng TanStack Query cho request, cache, retry, refetch và mutation; không tự sao chép server
  data vào Zustand.
- Service chịu trách nhiệm gọi API và chuẩn hóa lỗi; component không chứa Axios orchestration
  phức tạp.
- Sau mutation, cập nhật hoặc invalidate đúng query key. Query key phải ổn định và thuộc
  feature sở hữu dữ liệu.
- Chỉ fetch khi screen hoặc dữ liệu thực sự cần thiết; cân nhắc trạng thái focus, kết nối mạng
  và pull-to-refresh để tránh request thừa.
- Không dùng Server Actions của Next.js trong mobile; mutation đi qua API backend.

### Performance và trải nghiệm native

- Dùng `FlatList` hoặc `SectionList` cho danh sách dài; cung cấp key ổn định và tránh tạo hàm,
  object hoặc style nặng không cần thiết trong mỗi item render.
- Dùng `expo-image` cho ảnh cần cache, placeholder hoặc transition; luôn khai báo kích thước
  hay aspect ratio để tránh layout shift.
- Dùng Reanimated cho animation phức tạp cần chạy mượt; không thực hiện công việc đồng bộ
  nặng trên JS thread.
- Chỉ memoize sau khi xác định component hoặc phép tính có chi phí đáng kể; không dùng
  `memo`, `useMemo`, `useCallback` theo thói quen.
- Keyboard, trạng thái pressed, loading và accessibility label phải được xử lý cho control
  tương tác.
- Kiểm tra splash screen trên release build vì Expo Go và development build không phản ánh
  đầy đủ hành vi native cuối cùng.

### Font và asset

- Font mobile phải được bundle cùng ứng dụng bằng Expo Font/config plugin hoặc tải bằng
  `useFonts`; không phụ thuộc vào remote Google Fonts CSS khi chạy native.
- Nếu tải font lúc runtime, giữ splash screen cho đến khi font tải xong hoặc trả về lỗi, sau
  đó luôn gọi hide để tránh màn hình bị treo.
- Asset tĩnh dùng `require` hoặc static import để Metro có thể đưa vào bundle.

### Permissions, storage và security

- Cài Expo module bằng `npx expo install` để nhận phiên bản tương thích SDK.
- Cấu hình permission message và config plugin trong app config; chỉ yêu cầu quyền đúng lúc
  người dùng bắt đầu tính năng cần quyền đó.
- Lưu access/refresh token và dữ liệu xác thực nhạy cảm bằng `expo-secure-store` trên native;
  không dùng AsyncStorage cho secret.
- Mọi giá trị `EXPO_PUBLIC_*` đều được nhúng vào client bundle và phải được xem là công khai.
  Không đặt secret, private key hoặc credential backend trong các biến này.
- Truy cập biến Expo bằng dot notation tĩnh, ví dụ `process.env.EXPO_PUBLIC_API_URL`; không
  destructure hoặc dùng bracket notation vì Expo CLI không inline các dạng đó.
- Không log token, thông tin định danh nhạy cảm hoặc payload chứa dữ liệu riêng tư.

## NestJS (`apps/api`)

- Mỗi module NestJS ứng với đúng một dòng trong `../business/BACKEND_SERVICES.md` (17 module,
  hậu tố `*Module`); không tạo module ngoài danh sách khi chưa cập nhật tài liệu.
- Controller mỏng: nhận request, gọi service, trả kết quả. Quy tắc nghiệp vụ nằm trong service.
- Prisma chỉ được gọi bên trong module **sở hữu** bảng đó. Module khác cần dữ liệu thì gọi
  service công khai của module sở hữu — không truy vấn thẳng bảng của domain khác.
- Validate đầu vào bằng Zod schema từ `packages/schemas` qua một validation pipe dùng chung;
  không viết class-validator/DTO song song.
- Guard xếp theo thứ tự: xác thực → vai trò → gating (`SubscriptionModule`) hoặc residency
  (`ResidencyModule`); guard mount theo tiền tố namespace, không gắn lẻ từng handler.
- Response đi qua interceptor và exception filter dùng chung theo
  `../business/API_RESPONSE_STANDARD.md`; service ném lỗi nghiệp vụ kèm `code`, không tự dựng
  HTTP response.
- Thao tác nhiều bước bọc `prisma.$transaction`; webhook PayOS idempotent theo
  `idempotencyKey`.
- Migration Prisma có đánh số là nguồn chân lý về cấu trúc dữ liệu: không `db push` lên môi
  trường chung, không sửa migration đã merge — cần đổi thì thêm migration mới.
- Cấu hình đọc từ biến môi trường và được kiểm tra bằng schema lúc khởi động; secret không
  commit vào repo.
- Cấu trúc thư mục bên trong `apps/api` chốt trong kế hoạch dựng backend, không quy định
  trước ở đây.

## Feature ownership

Một feature có thể chứa các thư mục dưới đây khi cần, không bắt buộc phải có đầy đủ:

```text
features/<feature>/
├── components/
├── hooks/
├── schemas/
├── server/        # Chỉ dùng trong web; không tạo trong feature mobile
├── services/
├── types/
└── constants/
```

Không tạo trước thư mục hoặc abstraction khi feature chưa có nhu cầu thực tế.
