import type {
  RentalListingStatus,
  RentalPropertyType,
  SavedListingRecord,
} from '@/features/marketplace/types/savedListings';

export const MOCK_RENTER_ID = '00000000-0000-4000-8000-000000000001';

interface MockListingSeed {
  favoriteId: string;
  listingId: string;
  mediaId: string;
  sellerId: string;
  title: string;
  propertyType: RentalPropertyType;
  status: RentalListingStatus;
  address: string;
  district: string;
  area: number;
  price: number;
  imageUrl: string;
}

const MOCK_LISTING_SEEDS: readonly MockListingSeed[] = [
  {
    favoriteId: '20000000-0000-4000-8000-000000000001',
    listingId: '10000000-0000-4000-8000-000000000001',
    mediaId: '30000000-0000-4000-8000-000000000001',
    sellerId: '40000000-0000-4000-8000-000000000001',
    title: 'Phòng trọ cao cấp, full nội thất, gần ĐH Bách Khoa',
    propertyType: 'BoardingRoom',
    status: 'Active',
    address: '268 Lý Thường Kiệt, Phường 14',
    district: 'Quận 10',
    area: 25,
    price: 3_200_000,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  },
  {
    favoriteId: '20000000-0000-4000-8000-000000000002',
    listingId: '10000000-0000-4000-8000-000000000002',
    mediaId: '30000000-0000-4000-8000-000000000002',
    sellerId: '40000000-0000-4000-8000-000000000002',
    title: 'Căn hộ dịch vụ ban công đẹp, thang máy, 1PN',
    propertyType: 'ServicedApartment',
    status: 'Rented',
    address: '42 Nguyễn Gia Trí, Phường 25',
    district: 'Bình Thạnh',
    area: 38,
    price: 6_500_000,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  },
  {
    favoriteId: '20000000-0000-4000-8000-000000000003',
    listingId: '10000000-0000-4000-8000-000000000003',
    mediaId: '30000000-0000-4000-8000-000000000003',
    sellerId: '40000000-0000-4000-8000-000000000003',
    title: 'Phòng gác lửng thoáng mát, WC riêng, giờ tự do',
    propertyType: 'BoardingRoom',
    status: 'Expired',
    address: '15 Hà Huy Giáp, Phường Thạnh Lộc',
    district: 'Quận 12',
    area: 22,
    price: 2_400_000,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
  },
  {
    favoriteId: '20000000-0000-4000-8000-000000000004',
    listingId: '10000000-0000-4000-8000-000000000004',
    mediaId: '30000000-0000-4000-8000-000000000004',
    sellerId: '40000000-0000-4000-8000-000000000004',
    title: 'Studio yên tĩnh, cửa sổ lớn, gần trung tâm',
    propertyType: 'ServicedApartment',
    status: 'Hidden',
    address: '81 Trần Quang Diệu, Phường 13',
    district: 'Quận 3',
    area: 30,
    price: 5_800_000,
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
  },
  {
    favoriteId: '20000000-0000-4000-8000-000000000005',
    listingId: '10000000-0000-4000-8000-000000000005',
    mediaId: '30000000-0000-4000-8000-000000000005',
    sellerId: '40000000-0000-4000-8000-000000000005',
    title: 'Căn hộ 2PN đầy đủ tiện nghi, khu dân cư an ninh',
    propertyType: 'Apartment',
    status: 'Active',
    address: '120 Nguyễn Hữu Thọ, Phường Tân Hưng',
    district: 'Quận 7',
    area: 58,
    price: 9_200_000,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  },
  {
    favoriteId: '20000000-0000-4000-8000-000000000006',
    listingId: '10000000-0000-4000-8000-000000000006',
    mediaId: '30000000-0000-4000-8000-000000000006',
    sellerId: '40000000-0000-4000-8000-000000000006',
    title: 'Phòng trọ mới xây, có gác, gần khu công nghệ cao',
    propertyType: 'BoardingRoom',
    status: 'Active',
    address: '36 Lê Văn Việt, Phường Hiệp Phú',
    district: 'Thủ Đức',
    area: 24,
    price: 3_000_000,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
  },
];

// TODO: nối API thật khi có endpoint thật; fixtures này giữ nguyên field entity
// Favorite/RentalListing/Media trong DATA_ENTITIES.md để chỉ thay nguồn, không đổi UI contract.
export const MOCK_SAVED_LISTING_RECORDS: readonly SavedListingRecord[] = MOCK_LISTING_SEEDS.map(
  (seed, index) => {
    const day = String(10 - index).padStart(2, '0');
    const favoriteCreatedAt = `2026-08-${day}T08:00:00.000Z`;
    const listingCreatedAt = `2026-07-${String(index + 1).padStart(2, '0')}T08:00:00.000Z`;

    return {
      favorite: {
        id: seed.favoriteId,
        renterId: MOCK_RENTER_ID,
        listingId: seed.listingId,
        createdAt: favoriteCreatedAt,
        updatedAt: favoriteCreatedAt,
        deletedAt: null,
      },
      listing: {
        id: seed.listingId,
        sellerId: seed.sellerId,
        roomId: null,
        propertyId: null,
        title: seed.title,
        propertyType: seed.propertyType,
        address: seed.address,
        district: seed.district,
        area: seed.area,
        price: seed.price,
        description: 'Không gian sạch sẽ, thuận tiện đi lại và sẵn sàng vào ở.',
        electricityPrice: 3_500,
        waterPrice: 100_000,
        servicePrice: 150_000,
        deposit: seed.price,
        accessPolicy: 'Free',
        accessOpenTime: null,
        accessCloseTime: null,
        contactPhone: '0901234567',
        status: seed.status,
        rejectReason: null,
        approvedAt: '2026-07-01T08:00:00.000Z',
        expireAt:
          seed.status === 'Expired' ? '2026-08-01T08:00:00.000Z' : '2026-08-30T08:00:00.000Z',
        boostExpireAt: index === 0 ? '2026-08-20T08:00:00.000Z' : null,
        createdAt: listingCreatedAt,
        updatedAt: listingCreatedAt,
        deletedAt: null,
      },
      media: [
        {
          id: seed.mediaId,
          ownerType: 'RentalListing',
          ownerId: seed.listingId,
          url: seed.imageUrl,
          mimeType: 'image/jpeg',
          sizeBytes: 240_000,
          isPrivate: false,
          createdAt: listingCreatedAt,
          updatedAt: listingCreatedAt,
          deletedAt: null,
        },
      ],
    };
  },
);
