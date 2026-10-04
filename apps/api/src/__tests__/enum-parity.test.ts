import {
  ACCESS_POLICY_VALUES,
  AMENITY_TYPE_VALUES,
  CONTRACT_STATUS_VALUES,
  INVOICE_ITEM_TYPE_VALUES,
  INVOICE_STATUS_VALUES,
  LISTING_NEARBY_TYPE_VALUES,
  LISTING_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  ROOM_STATUS_VALUES,
  UTILITY_TYPE_VALUES,
  WATER_PRICING_METHOD_VALUES,
} from '@tronhanh/schemas';
import { describe, expect, it } from 'vitest';
import {
  AccessPolicy,
  AmenityType,
  ContractStatus,
  InvoiceItemType,
  InvoiceStatus,
  ListingNearbyType,
  ListingStatus,
  PaymentMethod,
  RoomStatus,
  UtilityType,
  WaterPricingMethod,
} from '@/generated/prisma/enums';

/**
 * Enum trong cơ sở dữ liệu (Prisma) và enum trong định nghĩa dùng chung (Zod, `packages/schemas`)
 * là hai bản khai của cùng một tập giá trị — `.agents/business/STATUS_ENUMS.md`. Lệch nhau thì
 * không ai báo lỗi: Zod nhận một giá trị DB không có, ghi xuống mới hỏng; hoặc DB có giá trị mà
 * client không hiển thị được. Test này là chỗ duy nhất bắt được.
 */
const PAIRS = [
  ['ListingStatus', ListingStatus, LISTING_STATUS_VALUES],
  ['AccessPolicy', AccessPolicy, ACCESS_POLICY_VALUES],
  ['ListingNearbyType', ListingNearbyType, LISTING_NEARBY_TYPE_VALUES],
  ['WaterPricingMethod', WaterPricingMethod, WATER_PRICING_METHOD_VALUES],
  ['AmenityType', AmenityType, AMENITY_TYPE_VALUES],
  ['RoomStatus', RoomStatus, ROOM_STATUS_VALUES],
  ['ContractStatus', ContractStatus, CONTRACT_STATUS_VALUES],
  ['InvoiceStatus', InvoiceStatus, INVOICE_STATUS_VALUES],
  ['InvoiceItemType', InvoiceItemType, INVOICE_ITEM_TYPE_VALUES],
  ['UtilityType', UtilityType, UTILITY_TYPE_VALUES],
  ['PaymentMethod', PaymentMethod, PAYMENT_METHOD_VALUES],
] as const;

describe('enum Prisma khớp enum Zod dùng chung (STATUS_ENUMS.md)', () => {
  it.each(PAIRS)('%s có đúng cùng tập giá trị, cùng thứ tự', (_name, prismaEnum, zodValues) => {
    expect(Object.values(prismaEnum)).toEqual([...zodValues]);
  });
});
