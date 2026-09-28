import type { ListingRecord, MarketplaceEntityFields } from '@/features/marketplace/types/listings';
import type { BoostPackage } from '@/features/marketplace/types/myListings';
import type {
  RentalListing,
  RentalListingStatus,
  RentalPropertyType,
} from '@/features/marketplace/types/savedListings';

/** Seller đang đăng nhập ở giai đoạn mock. */
export const MOCK_SELLER_ID = '40000000-0000-4000-8000-000000000100';

const NOW_ISO = '2026-08-17T03:00:00.000Z';
const FUTURE_ISO = '2026-10-16T08:00:00.000Z';
const PAST_ISO = '2026-07-20T08:00:00.000Z';

function entityFields(id: string, day: number): MarketplaceEntityFields {
  const timestamp = `2026-08-${String(day).padStart(2, '0')}T08:00:00.000Z`;
  return { id, createdAt: timestamp, updatedAt: timestamp, deletedAt: null };
}

interface MyListingSeed {
  index: number;
  title: string;
  propertyType: RentalPropertyType;
  district: string;
  address: string;
  area: number;
  price: number;
  status: RentalListingStatus;
  imageUrl: string;
  approvedAt?: string | null;
  expireAt?: string | null;
  boostExpireAt?: string | null;
  rejectReason?: string | null;
}

/**
 * Bộ tin của chính seller đang đăng nhập, cố ý phủ đủ 7 trạng thái BR-001 để trang
 * quản lý demo được mọi nhánh giao diện: chip trạng thái, lý do từ chối, gia hạn tin
 * hết hạn, đẩy tin nổi bật. Khác `mockListings.ts` — file đó là kho tin công khai cho
 * tìm kiếm/trang chủ, mỗi tin một seller riêng.
 */
const MY_LISTING_SEEDS: readonly MyListingSeed[] = [
  {
    index: 1,
    title: 'Phòng trọ ban công rộng, gần ĐH Sư phạm',
    propertyType: 'BoardingRoom',
    district: 'Quận 3',
    address: '145 Nguyễn Thượng Hiền, Phường 6',
    area: 26,
    price: 3_600_000,
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    approvedAt: '2026-08-12T08:00:00.000Z',
    expireAt: FUTURE_ISO,
    boostExpireAt: '2026-08-24T08:00:00.000Z',
  },
  {
    index: 2,
    title: 'Căn hộ dịch vụ 1PN, có thang máy và bảo vệ 24/7',
    propertyType: 'ServicedApartment',
    district: 'Bình Thạnh',
    address: '30 Nguyễn Gia Trí, Phường 25',
    area: 34,
    price: 6_200_000,
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    approvedAt: '2026-08-09T08:00:00.000Z',
    expireAt: FUTURE_ISO,
  },
  {
    index: 3,
    title: 'Phòng trọ giá tốt cho sinh viên, gần chợ Thủ Đức',
    propertyType: 'BoardingRoom',
    district: 'Thủ Đức',
    address: '88 Kha Vạn Cân, Phường Linh Tây',
    area: 20,
    price: 2_100_000,
    status: 'PendingApproval',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
  },
  {
    index: 4,
    title: 'Căn hộ mini full nội thất, cửa sổ lớn',
    propertyType: 'Apartment',
    district: 'Gò Vấp',
    address: '210 Quang Trung, Phường 10',
    area: 30,
    price: 4_800_000,
    status: 'Rejected',
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    rejectReason:
      'Ảnh tin đăng chưa phải ảnh thật của phòng. Vui lòng thay bằng ảnh chụp trực tiếp trước khi gửi duyệt lại.',
  },
  {
    index: 5,
    title: 'Phòng trọ có gác lửng, khu dân cư an ninh',
    propertyType: 'BoardingRoom',
    district: 'Quận 10',
    address: '72 Bà Hạt, Phường 9',
    area: 24,
    price: 3_100_000,
    status: 'Expired',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    approvedAt: '2026-05-20T08:00:00.000Z',
    expireAt: PAST_ISO,
  },
  {
    index: 6,
    title: 'Studio yên tĩnh gần công viên Gia Định',
    propertyType: 'ServicedApartment',
    district: 'Bình Thạnh',
    address: '19 Hoàng Minh Giám, Phường 3',
    area: 28,
    price: 5_400_000,
    status: 'Hidden',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
    approvedAt: '2026-08-05T08:00:00.000Z',
    expireAt: FUTURE_ISO,
  },
  {
    index: 7,
    title: 'Phòng trọ mới sơn, sắp hoàn thiện nội thất',
    propertyType: 'BoardingRoom',
    district: 'Quận 12',
    address: '56 Nguyễn Ảnh Thủ, Phường Trung Mỹ Tây',
    area: 22,
    price: 2_600_000,
    status: 'Draft',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
  },
  {
    index: 8,
    title: 'Căn hộ 2PN đã có khách thuê dài hạn',
    propertyType: 'Apartment',
    district: 'Quận 7',
    address: '134 Nguyễn Thị Thập, Phường Tân Phú',
    area: 52,
    price: 8_900_000,
    status: 'Rented',
    imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0',
    approvedAt: '2026-07-01T08:00:00.000Z',
    expireAt: FUTURE_ISO,
  },
];

/**
 * UUID thật là ngẫu nhiên nên 8 ký tự đầu đủ để phân biệt tin — giao diện lấy đoạn đó làm mã
 * ngắn cho người bán đối chiếu. Fixture vì vậy cũng phải khác nhau ngay từ đoạn đầu, không
 * dùng chung một tiền tố rồi mới đánh số ở cuối.
 */
function listingIdOf(index: number) {
  return `6${String(index).padStart(2, '0')}0a4b2-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

function toRentalListing(seed: MyListingSeed): RentalListing {
  const listingId = listingIdOf(seed.index);
  const day = Math.min(16, 2 + seed.index);

  return {
    ...entityFields(listingId, day),
    sellerId: MOCK_SELLER_ID,
    roomId: null,
    propertyId: null,
    title: seed.title,
    propertyType: seed.propertyType,
    address: seed.address,
    district: seed.district,
    area: seed.area,
    price: seed.price,
    description: 'Phòng sạch sẽ, thuận tiện đi lại, sẵn sàng vào ở ngay.',
    electricityPrice: 3_500,
    waterPrice: 100_000,
    servicePrice: 150_000,
    deposit: seed.price,
    accessPolicy: 'Free',
    accessOpenTime: null,
    accessCloseTime: null,
    contactPhone: '0901234567',
    status: seed.status,
    rejectReason: seed.rejectReason ?? null,
    approvedAt: seed.approvedAt ?? null,
    expireAt: seed.expireAt ?? null,
    boostExpireAt: seed.boostExpireAt ?? null,
  };
}

// TODO: nối API thật khi có endpoint thật — nguồn sẽ là GET /marketplace/me/listings.
export const MOCK_MY_LISTING_RECORDS: readonly ListingRecord[] = MY_LISTING_SEEDS.map((seed) => {
  const listing = toRentalListing(seed);

  return {
    listing,
    amenities: [],
    media: [
      {
        ...entityFields(`61000000-0000-4000-8000-${String(seed.index).padStart(12, '0')}`, 2),
        ownerType: 'RentalListing',
        ownerId: listing.id,
        url: seed.imageUrl,
        mimeType: 'image/jpeg',
        sizeBytes: 240_000,
        isPrivate: false,
      },
    ],
  };
});

/**
 * Gói đẩy tin. Prototype từng hardcode "100.000đ / 7 ngày" ngay trong modal, lệch hẳn với
 * cấu hình nền tảng thật — nên giá luôn đọc từ một nguồn duy nhất như ở đây.
 */
// TODO: nối API thật khi có endpoint thật — nguồn sẽ là platform settings của backend.
export const MOCK_BOOST_PACKAGES: readonly BoostPackage[] = [
  { days: 7, price: 20_000 },
  { days: 15, price: 35_000 },
  { days: 30, price: 60_000 },
];

export const MOCK_NOW_ISO = NOW_ISO;
