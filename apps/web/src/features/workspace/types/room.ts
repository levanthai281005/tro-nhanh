import type { RoomStatus } from '@tronhanh/schemas';
import type { Occupancy } from '@/features/workspace/types/occupancy';

/** Phòng — entity `Room`, `DATA_ENTITIES.md`. */
export interface Room {
  id: string;
  propertyId: string;
  roomCode: string;
  floor: number;
  area: number;
  price: number;
  status: RoomStatus;
  note: string | null;
  /**
   * Nội thất và tiện ích sẵn có — **nhãn** lấy từ catalog `constants/amenities`.
   *
   * Mảng rỗng là dữ liệu thật, không phải thiếu dữ liệu: phòng thô không có gì cả là trường
   * hợp phổ biến, và chủ trọ cần phân biệt nó với phòng chưa kịp khai.
   */
  amenities: readonly string[];
  /** `null` = thừa hưởng đơn giá của khu (khác `0` = miễn phí). */
  electricityPrice: number | null;
  waterPrice: number | null;
  servicePrice: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Người ở của phòng.
 *
 * Một `Room` có **nhiều Occupancy Active đồng thời** (bạn cùng phòng, cả gia đình). Không phải
 * "một người ở kèm số lượng người": mỗi người là một bản ghi riêng, có SĐT riêng và trạng thái
 * liên kết tài khoản riêng (BR-029). Quản lý đầy đủ ở B10.
 */
export type RoomOccupant = Occupancy;

export interface RoomListItem extends Room {
  /** **Chỉ người đang ở** — bản ghi đã kết thúc nằm ở lịch sử, xem `getOccupancyHistory`. */
  occupants: readonly Occupancy[];
  /**
   * BR-027 — phòng đang có `RentalListing` ở trạng thái `Active` gắn với nó. Dùng cho badge
   * "Có tin đang chạy" và để chặn tạo tin thứ hai từ cùng một phòng.
   */
  hasActiveListing: boolean;
  /** BR-006 — có hợp đồng `Active` không; ảnh hưởng quyền xóa phòng. */
  hasActiveContract: boolean;
}

export interface RoomsResult {
  items: readonly RoomListItem[];
  counts: Record<RoomStatus | 'all', number>;
}

export type RoomFilter = RoomStatus | 'all';

export const ROOM_SORT_VALUES = ['recent', 'code', 'price-desc', 'status'] as const;
export type RoomSort = (typeof ROOM_SORT_VALUES)[number];

export interface RoomFormValues {
  propertyId: string;
  roomCode: string;
  floor: string;
  area: string;
  price: string;
  status: RoomStatus;
  note: string;
  amenities: string[];
  hasCustomPricing: boolean;
  electricityPrice: string;
  waterPrice: string;
  servicePrice: string;
}
