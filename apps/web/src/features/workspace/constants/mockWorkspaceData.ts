import type { Property } from '@/features/workspace/types/property';
import type { Room } from '@/features/workspace/types/room';

/**
 * Dữ liệu mẫu của Workspace.
 *
 * Bản riêng của feature này, **không** import từ `features/marketplace` — ESLint chặn ở mức
 * `error`, và đó là chủ ý: `Property`/`Room` thuộc bounded context Property Management, còn
 * `RentalListing` thuộc Marketplace. Hai bên chỉ gặp nhau qua `roomId` trên tin đăng.
 */

// TODO: nối AuthContext khi có — hiện dùng đúng userId của phiên mock.
export const MOCK_WORKSPACE_SELLER_ID = '10000000-0000-4000-8000-000000000001';

const now = '2026-08-17T00:00:00.000Z';

export const MOCK_PROPERTIES: readonly Property[] = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    sellerId: MOCK_WORKSPACE_SELLER_ID,
    name: 'Nhà trọ Hoàng Diệu',
    address: '123 Hoàng Diệu, Phường 9',
    district: 'Phường 9',
    provinceCode: 79,
    wardCode: 27208,
    floorCount: 3,
    note: null,
    bankName: 'MB',
    bankAccountNumber: '0912345678',
    bankAccountName: 'NGUYEN VAN AN',
    isPublicProfileEnabled: true,
    publicSlug: 'nha-tro-hoang-dieu',
    avgRating: 4.5,
    reviewCount: 8,
    electricityPrice: 3500,
    waterPrice: 15000,
    servicePrice: 100000,
    createdAt: '2026-03-02T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    sellerId: MOCK_WORKSPACE_SELLER_ID,
    name: 'Khu trọ Bình Lợi',
    address: '45/2 Bình Lợi, Phường 13',
    district: 'Phường 13',
    provinceCode: 79,
    wardCode: 27124,
    floorCount: 2,
    note: 'Khu mới nhận, chưa nhập đơn giá điện nước',
    bankName: null,
    bankAccountNumber: null,
    bankAccountName: null,
    isPublicProfileEnabled: false,
    publicSlug: null,
    avgRating: null,
    reviewCount: 0,
    electricityPrice: 3800,
    waterPrice: 18000,
    servicePrice: 80000,
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: now,
  },
];

interface MockRoomSeed extends Room {
  hasActiveListing: boolean;
  hasActiveContract: boolean;
}

function room(seed: {
  id: string;
  propertyId: string;
  roomCode: string;
  floor: number;
  area: number;
  price: number;
  status: Room['status'];
  updatedAt: string;
  note?: string | null;
  hasActiveListing?: boolean;
  hasActiveContract?: boolean;
  electricityPrice?: number | null;
  amenities?: string[];
}): MockRoomSeed {
  return {
    id: seed.id,
    propertyId: seed.propertyId,
    roomCode: seed.roomCode,
    floor: seed.floor,
    area: seed.area,
    price: seed.price,
    status: seed.status,
    note: seed.note ?? null,
    // Mảng rỗng = phòng thô, là dữ liệu thật chứ không phải chưa khai.
    amenities: seed.amenities ?? [],
    electricityPrice: seed.electricityPrice ?? null,
    waterPrice: null,
    servicePrice: null,
    createdAt: '2026-03-02T00:00:00.000Z',
    updatedAt: seed.updatedAt,
    hasActiveListing: seed.hasActiveListing ?? false,
    hasActiveContract: seed.hasActiveContract ?? false,
  };
}

const HOANG_DIEU = '60000000-0000-4000-8000-000000000001';
const BINH_LOI = '60000000-0000-4000-8000-000000000002';

export const MOCK_ROOMS: readonly MockRoomSeed[] = [
  room({
    id: '70000000-0000-4000-8000-000000000001',
    propertyId: HOANG_DIEU,
    roomCode: 'P101',
    floor: 1,
    area: 22,
    price: 3200000,
    status: 'Rented',
    updatedAt: '2026-08-16T09:00:00.000Z',
    hasActiveContract: true,
    amenities: ['Máy lạnh', 'Wifi', 'WC riêng', 'Tủ lạnh', 'Chỗ để xe'],
  }),
  room({
    id: '70000000-0000-4000-8000-000000000002',
    propertyId: HOANG_DIEU,
    roomCode: 'P102',
    floor: 1,
    area: 20,
    price: 3000000,
    status: 'Available',
    updatedAt: '2026-08-15T09:00:00.000Z',
    hasActiveListing: true,
    note: 'Vừa sơn lại, đón khách được ngay',
    amenities: ['Máy lạnh', 'Wifi', 'WC riêng'],
  }),
  room({
    id: '70000000-0000-4000-8000-000000000003',
    propertyId: HOANG_DIEU,
    roomCode: 'P103',
    floor: 1,
    area: 20,
    price: 3000000,
    status: 'Deposited',
    updatedAt: '2026-08-14T09:00:00.000Z',
  }),
  room({
    id: '70000000-0000-4000-8000-000000000004',
    propertyId: HOANG_DIEU,
    roomCode: 'P201',
    floor: 2,
    area: 25,
    price: 3600000,
    status: 'Rented',
    updatedAt: '2026-08-13T09:00:00.000Z',
    hasActiveContract: true,
    electricityPrice: 3700,
    amenities: ['Máy lạnh', 'Wifi', 'Gác lửng', 'WC riêng', 'Máy giặt riêng'],
  }),
  room({
    id: '70000000-0000-4000-8000-000000000005',
    propertyId: HOANG_DIEU,
    roomCode: 'P202',
    floor: 2,
    area: 25,
    price: 3600000,
    status: 'Available',
    updatedAt: '2026-08-12T09:00:00.000Z',
  }),
  room({
    id: '70000000-0000-4000-8000-000000000006',
    propertyId: HOANG_DIEU,
    roomCode: 'P203',
    floor: 2,
    area: 18,
    price: 2800000,
    status: 'Hidden',
    updatedAt: '2026-07-28T09:00:00.000Z',
    note: 'Đang sửa trần, chưa cho thuê lại',
  }),
  room({
    id: '70000000-0000-4000-8000-000000000007',
    propertyId: HOANG_DIEU,
    roomCode: 'P301',
    floor: 3,
    area: 30,
    price: 4200000,
    status: 'Rented',
    updatedAt: '2026-08-11T09:00:00.000Z',
    hasActiveContract: true,
    amenities: ['Máy lạnh', 'Wifi', 'WC riêng', 'Tủ lạnh', 'Máy giặt riêng', 'Khóa vân tay'],
  }),
  room({
    id: '70000000-0000-4000-8000-000000000008',
    propertyId: HOANG_DIEU,
    roomCode: 'P302',
    floor: 3,
    area: 30,
    price: 4200000,
    status: 'Available',
    updatedAt: '2026-08-10T09:00:00.000Z',
    hasActiveListing: true,
  }),
  room({
    id: '70000000-0000-4000-8000-000000000009',
    propertyId: BINH_LOI,
    roomCode: 'A1',
    floor: 1,
    area: 16,
    price: 2400000,
    status: 'Rented',
    updatedAt: '2026-08-09T09:00:00.000Z',
    hasActiveContract: true,
  }),
  room({
    id: '70000000-0000-4000-8000-000000000010',
    propertyId: BINH_LOI,
    roomCode: 'A2',
    floor: 1,
    area: 16,
    price: 2400000,
    status: 'Available',
    updatedAt: '2026-08-08T09:00:00.000Z',
  }),
  room({
    id: '70000000-0000-4000-8000-000000000011',
    propertyId: BINH_LOI,
    roomCode: 'A3',
    floor: 1,
    area: 18,
    price: 2600000,
    status: 'Available',
    updatedAt: '2026-08-07T09:00:00.000Z',
  }),
  room({
    id: '70000000-0000-4000-8000-000000000012',
    propertyId: BINH_LOI,
    roomCode: 'B1',
    floor: 2,
    area: 20,
    price: 2900000,
    status: 'Deposited',
    updatedAt: '2026-08-06T09:00:00.000Z',
  }),
];
