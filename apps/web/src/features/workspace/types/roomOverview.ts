import type { UtilityType } from '@tronhanh/schemas';
import type { ContractListItem } from '@/features/workspace/types/contract';
import type { InvoiceListItem } from '@/features/workspace/types/invoice';
import type { RoomListItem } from '@/features/workspace/types/room';

/**
 * Đơn giá **đang thực sự áp dụng** cho phòng, kèm nguồn của nó.
 *
 * Ba tầng giá (`DATABASE_DESIGN.md` §10.2): khu → phòng (nullable) → chốt cứng vào
 * `UtilityReading`. Ở tầng phòng, `null` nghĩa là **thừa hưởng giá khu**, khác hẳn `0` nghĩa
 * là **miễn phí**.
 *
 * Vì vậy chỉ trả về con số là chưa đủ — màn hình phải nói được *"3.500 đ/kWh, theo giá khu"*
 * so với *"3.700 đ/kWh, riêng phòng"*. Prototype hiển thị `null` thành "Chưa cấu hình", khiến
 * chủ trọ tưởng mình quên khai rồi đi điền tay vào từng phòng, phá luôn cơ chế thừa hưởng.
 */
export interface ResolvedUnitPrice {
  value: number;
  /** `property` = thừa hưởng giá khu · `room` = phòng khai riêng. */
  source: 'property' | 'room';
}

/** Một kỳ trong bảng chỉ số gần đây, gộp cả điện lẫn nước để không phải tra hai lần. */
export interface RoomReadingPeriod {
  period: string;
  electricity: RoomReadingEntry | null;
  water: RoomReadingEntry | null;
}

export interface RoomReadingEntry {
  previousReading: number;
  currentReading: number;
  consumption: number;
  unitPrice: number;
  amount: number;
  /** Đã lên hóa đơn chưa — kỳ chưa lên hóa đơn là việc còn dang dở. */
  isInvoiced: boolean;
}

/**
 * Toàn bộ dữ liệu màn B9, gộp **một lần** ở tầng service.
 *
 * Để component tự gọi năm nguồn rồi ghép là cách chắc chắn để sinh N+1 và để hai khối trên
 * cùng màn nói hai con số khác nhau.
 */
export interface RoomOverview {
  room: RoomListItem;
  propertyId: string;
  propertyName: string;
  pricing: Record<'electricity' | 'water' | 'service', ResolvedUnitPrice>;
  /** Kỳ chốt số gần nhất theo loại — `null` = chưa ghi kỳ nào. */
  lastReadingPeriod: Record<UtilityType, string | null>;
  activeContract: ContractListItem | null;
  /** Số hợp đồng đã kết thúc — chỉ đếm, chi tiết xem ở B11. */
  pastContractCount: number;
  recentInvoices: readonly InvoiceListItem[];
  /** Tổng còn thiếu của **riêng phòng này**, cộng qua mọi kỳ chưa thu đủ. */
  outstandingAmount: number;
  outstandingCount: number;
  recentReadings: readonly RoomReadingPeriod[];
}

/** Số hóa đơn và số kỳ chỉ số hiện trên B9. Xem đủ thì sang B12. */
export const ROOM_OVERVIEW_INVOICE_LIMIT = 5;
export const ROOM_OVERVIEW_READING_LIMIT = 3;
