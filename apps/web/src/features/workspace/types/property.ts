/** Khu trọ — entity `Property`, `DATA_ENTITIES.md`. */
export interface Property {
  id: string;
  sellerId: string;
  name: string;
  address: string;
  district: string;
  provinceCode: string | null;
  wardCode: string | null;
  floorCount: number | null;
  note: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  isPublicProfileEnabled: boolean;
  publicSlug: string | null;
  /**
   * Điểm và số đánh giá — **giá trị dẫn xuất** từ bảng `Review`, backend tính.
   *
   * Chỉ **hiển thị** công khai khi `isPublicProfileEnabled` bật (BR-024); tắt public thì
   * review vẫn nằm nguyên trong DB. Client không tự tính hai số này.
   */
  avgRating: number | null;
  reviewCount: number;
  /** Đơn giá mặc định của khu; phòng để `null` thì thừa hưởng các giá trị này. */
  electricityPrice: number;
  waterPrice: number;
  servicePrice: number;
  createdAt: string;
  updatedAt: string;
}

/** Một dòng trong danh sách B6 — đã gộp sẵn số liệu phòng để không phải đếm ở component. */
export interface PropertyListItem {
  id: string;
  name: string;
  address: string;
  district: string;
  roomCount: number;
  availableCount: number;
  depositedCount: number;
  rentedCount: number;
  hiddenCount: number;
  isPublicProfileEnabled: boolean;
  /** Đã điền đủ thông tin nhận tiền chưa — thiếu thì chưa xuất được hóa đơn kèm VietQR. */
  hasPayoutInfo: boolean;
}

export interface PropertiesResult {
  items: readonly PropertyListItem[];
  totalRooms: number;
  totalAvailable: number;
}

export interface CreatePropertyInput {
  name: string;
  address: string;
  district: string;
  provinceCode: string | null;
  wardCode: string | null;
}

/** Sửa thông tin nhận dạng khu (B7 — khối "Thông tin khu"). */
export interface UpdatePropertyInfoInput {
  name: string;
  address: string;
  district: string;
  provinceCode: string | null;
  wardCode: string | null;
  floorCount: number | null;
  note: string | null;
}

/**
 * Đơn giá mặc định của khu.
 *
 * Phòng để `null` ở đơn giá riêng thì thừa hưởng ba giá trị này; `UtilityReading` **chốt cứng**
 * đơn giá tại thời điểm ghi chỉ số, nên đổi giá ở đây không làm đổi hóa đơn các kỳ đã ghi.
 */
export interface UpdatePropertyPricingInput {
  electricityPrice: number;
  waterPrice: number;
  servicePrice: number;
}

/** Thông tin nhận tiền — nguồn sinh mã VietQR trên hóa đơn (AS-002). */
export interface UpdatePropertyPayoutInput {
  /** Mã ngân hàng trong `VIETNAM_BANKS`, không phải tên đầy đủ. */
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}
