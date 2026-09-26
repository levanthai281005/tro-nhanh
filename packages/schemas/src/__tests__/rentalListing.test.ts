import { describe, expect, it } from 'vitest';
import {
  createRentalListingSchema,
  listingCostSchema,
  saveListingDraftSchema,
  updateRentalListingSchema,
  WATER_PRICING_METHOD_VALUES,
  type CreateRentalListingInput,
} from '../index';

/** Một tin hợp lệ đầy đủ; từng ca chỉ sửa đúng chỗ cần thử. */
function validListing(): CreateRentalListingInput {
  return {
    typeId: '10000000-0000-4000-8000-000000000001',
    propertyId: null,
    roomId: null,
    title: 'Phòng trọ sạch sẽ gần chợ An Đông',
    area: 25,
    price: 3_500_000,
    description: 'Phòng rộng, có gác lửng, gần chợ và trường học.',
    contactPhone: '0901234567',
    amenityIds: [],
    mediaIds: [
      '20000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000003',
    ],
    cost: {
      electricityBill: 3_500,
      waterBill: 100_000,
      waterPricingMethod: 'PerPerson',
      serviceFee: null,
      deposit: 3_500_000,
    },
    nearbyPlaces: [],
    latitude: null,
    longitude: null,
    provinceCode: '79',
    wardCode: '27316',
    addressDetail: '123 An Dương Vương',
    accessPolicy: 'Free',
    accessOpenTime: null,
    accessCloseTime: null,
  };
}

function issuePaths(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.error?.issues.map((issue) => issue.path.join('.')) ?? [];
}

describe('giờ giấc ra vào — phép kiểm chéo Restricted (BR-025)', () => {
  // Hồi quy: schema thực thể từng chép lại ba trường giờ giấc mà bỏ mất phép kiểm này.
  it('chặn Restricted thiếu giờ, gắn lỗi đúng ô giờ mở cửa', () => {
    const result = createRentalListingSchema.safeParse({
      ...validListing(),
      accessPolicy: 'Restricted',
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toEqual(['accessOpenTime']);
  });

  it('chặn Restricted chỉ có giờ mở mà thiếu giờ đóng', () => {
    const result = createRentalListingSchema.safeParse({
      ...validListing(),
      accessPolicy: 'Restricted',
      accessOpenTime: '06:00',
    });

    expect(result.success).toBe(false);
  });

  it('PUT thay toàn bộ tin cũng áp đúng phép kiểm đó', () => {
    expect(
      updateRentalListingSchema.safeParse({ ...validListing(), accessPolicy: 'Restricted' })
        .success,
    ).toBe(false);
    expect(
      updateRentalListingSchema.safeParse({
        ...validListing(),
        accessPolicy: 'Restricted',
        accessOpenTime: '06:00',
        accessCloseTime: '23:00',
      }).success,
    ).toBe(true);
  });
});

describe('cách tính tiền nước trên tin đăng (BR-042)', () => {
  it.each(WATER_PRICING_METHOD_VALUES)('nhận số tiền nước kèm cách tính %s', (method) => {
    const result = listingCostSchema.safeParse({
      ...validListing().cost,
      waterPricingMethod: method,
    });

    expect(result.success).toBe(true);
  });

  it('chặn số tiền nước không có cách tính — "100.000đ" thiếu đơn vị là vô nghĩa', () => {
    const result = listingCostSchema.safeParse({
      ...validListing().cost,
      waterPricingMethod: null,
    });

    expect(result.success).toBe(false);
    expect(issuePaths(result)).toEqual(['waterPricingMethod']);
  });

  it('phân biệt chưa cung cấp (null) với miễn phí (0)', () => {
    const notProvided = { ...validListing().cost, waterBill: null, waterPricingMethod: null };
    const free = { ...validListing().cost, waterBill: 0, waterPricingMethod: 'FlatRate' };

    expect(listingCostSchema.safeParse(notProvided).success).toBe(true);
    expect(listingCostSchema.parse(free).waterBill).toBe(0);
  });
});

describe('lưu nháp khác gửi duyệt (Module 3)', () => {
  it('nháp dở dang lưu được, cùng nội dung đó gửi duyệt thì bị chặn', () => {
    const halfDone = {
      title: 'Phòng trọ gần chợ An Đông',
      accessPolicy: 'Restricted' as const,
      accessOpenTime: null,
      accessCloseTime: null,
      mediaIds: ['20000000-0000-4000-8000-000000000001'],
    };

    expect(saveListingDraftSchema.safeParse(halfDone).success).toBe(true);
    expect(createRentalListingSchema.safeParse({ ...validListing(), ...halfDone }).success).toBe(
      false,
    );
  });

  it('nháp dễ tính với trường còn thiếu, nhưng không nhận giá trị sai định dạng', () => {
    expect(saveListingDraftSchema.safeParse({ contactPhone: '123' }).success).toBe(false);
    expect(saveListingDraftSchema.safeParse({ price: 3_500_000.5 }).success).toBe(false);
  });
});
