import {
  MOCK_BOOST_PACKAGES,
  MOCK_MY_LISTING_RECORDS,
} from '@/features/marketplace/constants/mockMyListings';
import type { ListingRecord } from '@/features/marketplace/types/listings';
import type {
  BoostPackage,
  MyListingRow,
  MyListingsResult,
  MyListingStats,
} from '@/features/marketplace/types/myListings';
import type {
  RentalListing,
  RentalListingStatus,
} from '@/features/marketplace/types/savedListings';
import { isFutureDate } from '@/features/marketplace/utils/listingOrdering';

const MOCK_REQUEST_DELAY_MS = 180;

/** BR-026 — tin được duyệt hiển thị 60 ngày, gia hạn cộng thêm đúng 60 ngày. */
const LISTING_VISIBILITY_DAYS = 60;

function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

/**
 * Thay đổi cục bộ chồng lên fixture, để mutation trong phiên demo có hiệu lực thật mà không
 * phải sửa file mock. Khi nối API thật thì bỏ hẳn lớp này.
 */
interface ListingOverride {
  status?: RentalListingStatus;
  boostExpireAt?: string | null;
  expireAt?: string | null;
  isDeleted?: boolean;
}

const listingOverrides = new Map<string, ListingOverride>();

function applyOverride(listing: RentalListing): RentalListing {
  const override = listingOverrides.get(listing.id);
  if (!override) return listing;

  return {
    ...listing,
    status: override.status ?? listing.status,
    boostExpireAt:
      override.boostExpireAt === undefined ? listing.boostExpireAt : override.boostExpireAt,
    expireAt: override.expireAt === undefined ? listing.expireAt : override.expireAt,
  };
}

function mergeOverride(listingId: string, patch: ListingOverride) {
  listingOverrides.set(listingId, { ...listingOverrides.get(listingId), ...patch });
}

function toMyListingRow(record: ListingRecord, now: number): MyListingRow {
  const listing = applyOverride(record.listing);
  const isBoosted = isFutureDate(listing.boostExpireAt, now);

  return {
    id: listing.id,
    title: listing.title,
    district: listing.district,
    price: listing.price,
    area: listing.area,
    status: listing.status,
    imageUrl: record.media[0]?.url ?? '',
    updatedAt: listing.updatedAt,
    createdAt: listing.createdAt,
    expireAt: listing.expireAt,
    boostExpireAt: listing.boostExpireAt,
    rejectReason: listing.status === 'Rejected' ? listing.rejectReason : null,
    isBoosted,
    canRenew: listing.status === 'Expired',
  };
}

function toStats(rows: readonly MyListingRow[]): MyListingStats {
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'Active').length,
    boosted: rows.filter((row) => row.isBoosted).length,
    hidden: rows.filter((row) => row.status === 'Hidden').length,
  };
}

// TODO: nối API thật khi có endpoint thật:
// GET /marketplace/me/listings — trả mọi trạng thái, danh tính seller lấy từ session.
export async function getMyListings(sellerId: string | undefined): Promise<MyListingsResult> {
  await waitForMockRequest();
  if (!sellerId) return { rows: [], stats: toStats([]), districts: [] };

  const now = Date.now();
  const rows = MOCK_MY_LISTING_RECORDS.filter(
    (record) =>
      record.listing.sellerId === sellerId && !listingOverrides.get(record.listing.id)?.isDeleted,
  ).map((record) => toMyListingRow(record, now));

  return {
    rows,
    stats: toStats(rows),
    districts: [...new Set(rows.map((row) => row.district))].sort((left, right) =>
      left.localeCompare(right, 'vi-VN'),
    ),
  };
}

// TODO: nối API thật khi có endpoint thật — gói và giá do backend cấu hình.
export async function getBoostPackages(): Promise<readonly BoostPackage[]> {
  await waitForMockRequest();
  return MOCK_BOOST_PACKAGES;
}

// TODO: nối API thật khi có endpoint thật:
// PATCH /marketplace/listings/{id} — chỉ đổi giữa Active và Hidden.
export async function setListingVisibility(listingId: string, nextStatus: 'Active' | 'Hidden') {
  await waitForMockRequest();
  mergeOverride(listingId, { status: nextStatus });
}

// TODO: nối API thật khi có endpoint thật: DELETE /marketplace/listings/{id}.
export async function deleteListing(listingId: string) {
  await waitForMockRequest();
  mergeOverride(listingId, { isDeleted: true });
}

/**
 * BR-005 — boost cộng dồn nếu tin còn hạn nổi bật, và chỉ boost được tin Active.
 * Ngày hết hạn do tầng service quyết định, client không tự tính rồi gửi lên.
 */
// TODO: nối API thật khi có endpoint thật: POST /marketplace/listings/{id}/boost.
export async function boostListing(listingId: string, days: number): Promise<string> {
  await waitForMockRequest();

  const record = MOCK_MY_LISTING_RECORDS.find((item) => item.listing.id === listingId);
  if (!record) throw new Error('Không tìm thấy tin đăng.');

  const listing = applyOverride(record.listing);
  if (listing.status !== 'Active') {
    throw new Error('Chỉ đẩy nổi bật được tin đang hiển thị.');
  }

  const now = Date.now();
  const base = isFutureDate(listing.boostExpireAt, now)
    ? Date.parse(listing.boostExpireAt as string)
    : now;
  const nextExpiry = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();

  mergeOverride(listingId, { boostExpireAt: nextExpiry });
  return nextExpiry;
}

/**
 * BR-026 — gia hạn +60 ngày, đưa tin trở lại `Active` mà không cần duyệt lại, với điều kiện
 * không sửa nội dung. Sửa trường quan trọng là luồng khác (BR-003) và thuộc form đăng tin.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /marketplace/listings/{id}/renew.
export async function renewListing(listingId: string): Promise<string> {
  await waitForMockRequest();

  const record = MOCK_MY_LISTING_RECORDS.find((item) => item.listing.id === listingId);
  if (!record) throw new Error('Không tìm thấy tin đăng.');

  const listing = applyOverride(record.listing);
  if (listing.status !== 'Expired') {
    throw new Error('Chỉ gia hạn được tin đã hết hạn hiển thị.');
  }

  const nextExpiry = new Date(
    Date.now() + LISTING_VISIBILITY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  mergeOverride(listingId, { status: 'Active', expireAt: nextExpiry });
  return nextExpiry;
}
