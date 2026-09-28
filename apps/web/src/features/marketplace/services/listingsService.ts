import {
  MOCK_LISTING_LOCATIONS,
  MOCK_LISTING_RECORDS,
} from '@/features/marketplace/constants/mockListings';
import { MOCK_LISTING_REVIEWS } from '@/features/marketplace/constants/mockListingReviews';
import type {
  ListingCardView,
  ListingRecord,
  ListingSearchParams,
  ListingSearchResult,
} from '@/features/marketplace/types/listings';
import type { ListingDetailData } from '@/features/marketplace/types/listingDetail';
import { normalizeVietnamese } from '@/utils/normalizeVietnamese';
import { matchesAreaRange, matchesPriceRange } from '@/features/marketplace/utils/catalogBounds';
import { isFutureDate, sortListingsByBoost } from '@/features/marketplace/utils/listingOrdering';
import { toListingCardView } from '@/features/marketplace/utils/toListingCardView';

const MOCK_REQUEST_DELAY_MS = 180;

function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

function matchesKeyword(record: ListingRecord, keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedKeyword) return true;

  const searchableText = normalizeSearchText(
    [
      record.listing.title,
      record.listing.address,
      record.listing.district,
      // Mock listings currently store district/address only; include the city users see in the Hero hint.
      'TP.HCM',
    ].join(' '),
  );

  return searchableText.includes(normalizedKeyword);
}

function normalizeSearchText(value: string) {
  return normalizeVietnamese(value)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareListings(
  left: ListingRecord,
  right: ListingRecord,
  sort: ListingSearchParams['sort'],
) {
  if (sort === 'price-asc') return left.listing.price - right.listing.price;
  if (sort === 'price-desc') return right.listing.price - left.listing.price;
  if (sort === 'area-desc') return right.listing.area - left.listing.area;
  return right.listing.createdAt.localeCompare(left.listing.createdAt);
}

function isPublicActiveListing(record: ListingRecord, now: number) {
  return (
    record.listing.status === 'Active' &&
    (!record.listing.expireAt || isFutureDate(record.listing.expireAt, now))
  );
}

// TODO: nối API thật khi có endpoint thật:
// GET /public/listings/{id}. Review giữ nguồn riêng vì A3 chỉ hiển thị empty state trong MVP.
export async function getPublicListingDetail(listingId: string): Promise<ListingDetailData | null> {
  await waitForMockRequest();
  const now = Date.now();
  const record = MOCK_LISTING_RECORDS.find(
    (candidate) => candidate.listing.id === listingId && isPublicActiveListing(candidate, now),
  );

  if (!record) return null;

  return {
    record,
    reviews: record.listing.propertyId
      ? (MOCK_LISTING_REVIEWS[record.listing.propertyId] ?? [])
      : [],
    location: MOCK_LISTING_LOCATIONS[record.listing.id] ?? null,
  };
}

// TODO: nối API thật khi có endpoint thật:
// GET /public/listings/{id}/similar. Trong mock giữ đúng tiêu chí prototype: cùng quận, giá ±30%.
export async function getSimilarListings(
  currentRecord: ListingRecord,
  limit = 3,
): Promise<readonly ListingCardView[]> {
  await waitForMockRequest();
  const now = Date.now();
  const { district, id, price } = currentRecord.listing;
  const minPrice = price * 0.7;
  const maxPrice = price * 1.3;
  const candidates = MOCK_LISTING_RECORDS.filter(
    (candidate) =>
      candidate.listing.id !== id &&
      candidate.listing.district === district &&
      candidate.listing.price >= minPrice &&
      candidate.listing.price <= maxPrice &&
      isPublicActiveListing(candidate, now),
  );
  const sortedRecords = sortListingsByBoost(
    candidates,
    (candidate) => candidate.listing.boostExpireAt,
    (left, right) => compareListings(left, right, 'newest'),
    now,
  );

  return sortedRecords.slice(0, Math.max(0, limit)).map((record) => toListingCardView(record, now));
}

function matchesFilters(record: ListingRecord, filters: ListingSearchParams) {
  if (!matchesKeyword(record, filters.keyword)) return false;
  if (!matchesPriceRange(record.listing.price, filters.priceRange)) return false;
  if (!matchesAreaRange(record.listing.area, filters.areaRange)) return false;
  if (
    filters.propertyTypes.length > 0 &&
    !filters.propertyTypes.includes(record.listing.propertyType)
  ) {
    return false;
  }

  return filters.amenities.every((amenity) =>
    record.amenities.some((listingAmenity) => listingAmenity.name === amenity),
  );
}

// TODO: nối API thật khi có endpoint thật:
// GET /public/search/listings qua @tronhanh/api. Query và response lấy từ
// `listingSearchQuerySchema` / `listingSearchResponseSchema` của @tronhanh/schemas, không tự
// tạo DTO API ở đây.
export async function searchListings(params: ListingSearchParams): Promise<ListingSearchResult> {
  await waitForMockRequest();
  const now = Date.now();
  const page = Math.max(1, params.page);
  const pageSize = Math.max(1, params.pageSize);
  const filteredRecords = MOCK_LISTING_RECORDS.filter(
    (record) => isPublicActiveListing(record, now) && matchesFilters(record, params),
  );
  const sortedRecords = sortListingsByBoost(
    filteredRecords,
    (record) => record.listing.boostExpireAt,
    (left, right) => compareListings(left, right, params.sort),
    now,
  );
  const total = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resolvedPage = Math.min(page, totalPages);
  const pageStart = (resolvedPage - 1) * pageSize;

  return {
    items: sortedRecords
      .slice(pageStart, pageStart + pageSize)
      .map((record) => toListingCardView(record, now)),
    total,
    page: resolvedPage,
    pageSize,
    totalPages,
  };
}
