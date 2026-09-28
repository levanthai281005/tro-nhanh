import { MOCK_SAVED_LISTING_RECORDS } from '@/features/marketplace/constants/mockSavedListings';
import type {
  SavedListingCardView,
  SavedListingRecord,
} from '@/features/marketplace/types/savedListings';

const MOCK_REQUEST_DELAY_MS = 180;
const savedListingIds = new Set(
  MOCK_SAVED_LISTING_RECORDS.map((record) => record.favorite.listingId),
);

function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

function toSavedListingCard(record: SavedListingRecord): SavedListingCardView {
  return {
    favoriteId: record.favorite.id,
    id: record.listing.id,
    title: record.listing.title,
    price: record.listing.price,
    area: record.listing.area,
    location: `${record.listing.district}, TP.HCM`,
    imageUrl: record.media[0]?.url ?? '',
    status: record.listing.status,
  };
}

// TODO: nối API thật khi có endpoint thật:
// GET /marketplace/me/favorites qua @tronhanh/api, không gửi renterId lên backend.
export async function getSavedListings(
  renterId: string | undefined,
): Promise<readonly SavedListingCardView[]> {
  await waitForMockRequest();
  if (!renterId) return [];

  return MOCK_SAVED_LISTING_RECORDS.filter(
    (record) =>
      record.favorite.renterId === renterId && savedListingIds.has(record.favorite.listingId),
  )
    .toSorted((left, right) => right.favorite.createdAt.localeCompare(left.favorite.createdAt))
    .map(toSavedListingCard);
}

// TODO: nối API thật khi có endpoint thật; endpoint danh sách Favorite sẽ là nguồn
// duy nhất cho cả list và tập id, TanStack Query giữ hai projection theo query key riêng.
export async function getSavedListingIds(renterId: string | undefined) {
  await waitForMockRequest();
  if (!renterId) return [] as readonly string[];

  return MOCK_SAVED_LISTING_RECORDS.filter(
    (record) => record.favorite.renterId === renterId && savedListingIds.has(record.listing.id),
  ).map((record) => record.listing.id);
}

// TODO: nối API thật khi có endpoint thật:
// POST /marketplace/listings/{id}/favorite; danh tính lấy từ session, không từ payload.
export async function saveListing(renterId: string, listingId: string) {
  await waitForMockRequest();
  const belongsToRenter = MOCK_SAVED_LISTING_RECORDS.some(
    (record) => record.favorite.renterId === renterId && record.listing.id === listingId,
  );
  if (belongsToRenter) savedListingIds.add(listingId);
}

// TODO: nối API thật khi có endpoint thật:
// DELETE /marketplace/listings/{id}/favorite; danh tính lấy từ session, không từ payload.
export async function unsaveListing(renterId: string, listingId: string) {
  await waitForMockRequest();
  const belongsToRenter = MOCK_SAVED_LISTING_RECORDS.some(
    (record) => record.favorite.renterId === renterId && record.listing.id === listingId,
  );
  if (belongsToRenter) savedListingIds.delete(listingId);
}

export function reportSavedListingsError(scope: string, error: unknown) {
  console.error(`[marketplace/saved-listings] ${scope}`, error);
}
