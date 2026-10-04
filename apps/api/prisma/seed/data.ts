import type { Prisma } from '../../src/generated/prisma/client';

/**
 * Dữ liệu danh mục khởi tạo — **dữ liệu, không phải cấu trúc**, nên không nằm trong migration
 * (`.agents/tasks/ADD_DB_MIGRATION.md`).
 *
 * Mỗi dòng có **id cố định** để mọi môi trường chung một id, và để seed chỉ **chèn dòng còn thiếu,
 * không bao giờ ghi đè**: quản trị viên sửa giá hay tên ở D6 rồi chạy seed lại cũng không mất.
 * `subscription_plans` không có cột mã nên id cố định là cách duy nhất để nhận ra dòng đã có.
 *
 * id theo dạng UUIDv7 (chữ số 7 ở nhóm thứ ba, 8 ở đầu nhóm thứ tư), đánh số theo nhóm:
 * vai trò 0x, loại hình 1x, tiện ích 2x–3x, gói đẩy tin 4x, gói dịch vụ 5x.
 */
const seedId = (sequence: number) =>
  `01990000-0000-7000-8000-${sequence.toString(16).padStart(12, '0')}`;

/** Bốn vai trò, tên theo Mục 0 của đặc tả (BR-013). */
export const ROLES = [
  {
    id: seedId(0x01),
    code: 'TENANT',
    name: 'Người thuê',
    description: 'Mặc định sau khi đăng ký',
  },
  {
    id: seedId(0x02),
    code: 'LANDLORD',
    name: 'Chủ trọ',
    description: 'Nâng cấp qua "Trở thành chủ trọ", một chiều',
  },
  {
    id: seedId(0x03),
    code: 'STAFF',
    name: 'Nhân viên vận hành',
    description: 'Kiểm duyệt tin, xử lý báo cáo',
  },
  {
    id: seedId(0x04),
    code: 'ADMIN',
    name: 'Quản trị viên',
    description: 'Kiểm duyệt, cộng quản lý tài khoản, danh mục, gói dịch vụ',
  },
] satisfies Prisma.RoleCreateManyInput[];

/** Ba loại hình của bộ lọc ở Module 12. Mã là slug tiếng Việt vì nó nằm trên đường dẫn (BR-044). */
export const LISTING_TYPES = [
  { id: seedId(0x11), code: 'phong-tro', name: 'Phòng trọ', description: null },
  { id: seedId(0x12), code: 'can-ho-dich-vu', name: 'Căn hộ dịch vụ', description: null },
  { id: seedId(0x13), code: 'can-ho-chung-cu', name: 'Căn hộ chung cư', description: null },
] satisfies Prisma.ListingTypeCreateManyInput[];

/**
 * Tiện ích trong phòng, lấy từ `apps/web/src/constants/amenities.ts`; icon là tên icon Lucide.
 *
 * Cố ý **bỏ "Giờ giấc tự do"**: nó trùng `accessPolicy` (BR-025), hai nguồn sẽ nói ngược nhau.
 * Không có tiện ích loại `Surrounding` — tiện ích xung quanh nay là tập cố định của
 * `ListingNearbyPlace` (BR-044).
 */
export const AMENITIES = [
  { id: seedId(0x21), code: 'may-lanh', name: 'Máy lạnh', icon: 'wind', type: 'Room' },
  { id: seedId(0x22), code: 'wifi', name: 'Wifi', icon: 'wifi', type: 'Room' },
  { id: seedId(0x23), code: 'gac-lung', name: 'Gác lửng', icon: 'layers', type: 'Room' },
  { id: seedId(0x24), code: 'cho-de-xe', name: 'Chỗ để xe', icon: 'car', type: 'Room' },
  { id: seedId(0x25), code: 'wc-rieng', name: 'WC riêng', icon: 'bath', type: 'Room' },
  { id: seedId(0x26), code: 'tu-lanh', name: 'Tủ lạnh', icon: 'refrigerator', type: 'Room' },
  {
    id: seedId(0x27),
    code: 'may-giat-rieng',
    name: 'Máy giặt riêng',
    icon: 'washing-machine',
    type: 'Room',
  },
  {
    id: seedId(0x28),
    code: 'khoa-van-tay',
    name: 'Khóa vân tay',
    icon: 'fingerprint',
    type: 'Room',
  },
  { id: seedId(0x29), code: 'ham-de-xe', name: 'Hầm để xe', icon: 'circle-parking', type: 'Room' },
  {
    id: seedId(0x2a),
    code: 'cho-nuoi-thu-cung',
    name: 'Cho nuôi thú cưng',
    icon: 'paw-print',
    type: 'Room',
  },
] satisfies Prisma.AmenityCreateManyInput[];

/** Lấy từ bảng giá mock đang chạy ở B4 (`MOCK_BOOST_PACKAGES`). */
export const BOOST_PACKAGES = [
  {
    id: seedId(0x41),
    code: 'noi-bat-7-ngay',
    name: 'Nổi bật 7 ngày',
    description: null,
    durationDays: 7,
    price: 20_000,
    isActive: true,
  },
  {
    id: seedId(0x42),
    code: 'noi-bat-15-ngay',
    name: 'Nổi bật 15 ngày',
    description: null,
    durationDays: 15,
    price: 35_000,
    isActive: true,
  },
  {
    id: seedId(0x43),
    code: 'noi-bat-30-ngay',
    name: 'Nổi bật 30 ngày',
    description: null,
    durationDays: 30,
    price: 60_000,
    isActive: true,
  },
] satisfies Prisma.BoostPackageCreateManyInput[];

/**
 * Gói dùng thử theo AS-003 (30 ngày, 1 khu, 5 phòng). Hai gói trả phí: giá 36 tháng theo AS-003,
 * còn lại là đề xuất chủ dự án đã duyệt làm seed — quản trị viên sửa được ở D6.
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: seedId(0x51),
    name: 'Dùng thử',
    durationMonths: 1,
    price: 0,
    renewalPrice: 0,
    trialDays: 30,
    maxProperties: 1,
    maxRooms: 5,
    isTrialPlan: true,
    isActive: true,
  },
  {
    id: seedId(0x52),
    name: 'Gói 12 tháng',
    durationMonths: 12,
    price: 250_000,
    renewalPrice: 180_000,
    trialDays: 30,
    maxProperties: 10,
    maxRooms: 200,
    isTrialPlan: false,
    isActive: true,
  },
  {
    id: seedId(0x53),
    name: 'Gói 36 tháng',
    durationMonths: 36,
    price: 600_000,
    renewalPrice: 450_000,
    trialDays: 30,
    maxProperties: 10,
    maxRooms: 200,
    isTrialPlan: false,
    isActive: true,
  },
] satisfies Prisma.SubscriptionPlanCreateManyInput[];
