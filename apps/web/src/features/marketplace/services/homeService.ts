import { MOCK_HOME_DEMAND_POST_RECORDS } from '@/features/marketplace/constants/mockHomeData';
import { MOCK_LISTING_RECORDS } from '@/features/marketplace/constants/mockListings';
import type {
  DemandPostCardView,
  FeaturedListingCardView,
  HomeDemandPostRecord,
} from '@/features/marketplace/types/home';
import { isFutureDate, sortListingsByBoost } from '@/features/marketplace/utils/listingOrdering';
import { toListingCardView } from '@/features/marketplace/utils/toListingCardView';

const MOCK_REQUEST_DELAY_MS = 180;

function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

// TODO: nối API thật khi có endpoint thật:
// GET /public/listings?status=Active&limit={limit} qua @tronhanh/api.
export async function getFeaturedListings(limit = 4): Promise<readonly FeaturedListingCardView[]> {
  await waitForMockRequest();
  const now = Date.now();

  return sortListingsByBoost(
    MOCK_LISTING_RECORDS.filter(
      (record) =>
        record.listing.status === 'Active' &&
        (!record.listing.expireAt || isFutureDate(record.listing.expireAt, now)),
    ),
    (record) => record.listing.boostExpireAt,
    (left, right) => right.listing.createdAt.localeCompare(left.listing.createdAt),
    now,
  )
    .slice(0, Math.max(0, limit))
    .map((record) => toListingCardView(record, now));
}

function initialsFromName(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase('vi-VN'))
    .join('');
}

const PROPERTY_TYPE_LABELS = {
  BoardingRoom: 'Phòng trọ',
  ServicedApartment: 'Căn hộ dịch vụ',
  Apartment: 'Căn hộ',
} as const;

function toDemandPostCard(record: HomeDemandPostRecord): DemandPostCardView {
  const common = {
    id: record.post.id,
    renterId: record.post.renterId,
    name: record.poster.fullName,
    initials: initialsFromName(record.poster.fullName),
  };

  if (record.kind === 'RoomWanted') {
    return {
      ...common,
      kind: record.kind,
      title: `Tìm ${PROPERTY_TYPE_LABELS[record.post.propertyType]} tại ${record.post.desiredDistricts[0] ?? 'TP. Hồ Chí Minh'}`,
      tags: record.post.desiredAmenities,
      desiredDistricts: record.post.desiredDistricts,
      priceMin: record.post.priceMin,
      priceMax: record.post.priceMax,
      propertyType: record.post.propertyType,
      moveInDate: record.post.moveInDate,
    };
  }

  return {
    ...common,
    kind: record.kind,
    title: `Tìm ${record.post.neededCount} bạn ở ghép tại ${record.post.district}`,
    tags: record.post.requirements,
    district: record.post.district,
    sharePrice: record.post.sharePrice,
    neededCount: record.post.neededCount,
    genderRequirement: record.post.genderRequirement,
  };
}

// TODO: nối API thật khi có endpoint thật:
// GET /public/room-wanted-posts và GET /public/roommate-wanted-posts qua @tronhanh/api.
export async function listActiveDemandPosts(): Promise<readonly DemandPostCardView[]> {
  await waitForMockRequest();
  const now = Date.now();

  return MOCK_HOME_DEMAND_POST_RECORDS.filter(
    (record) => record.post.status === 'Active' && isFutureDate(record.post.expireAt, now),
  )
    .toSorted((left, right) => right.post.updatedAt.localeCompare(left.post.updatedAt))
    .map(toDemandPostCard);
}
