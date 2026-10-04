import { catalogCodeSchema, uuidSchema } from '@tronhanh/schemas';
import { describe, expect, it } from 'vitest';
import { AMENITIES, BOOST_PACKAGES, LISTING_TYPES, ROLES, SUBSCRIPTION_PLANS } from '../data';

const ALL_ROWS = [
  ...ROLES,
  ...LISTING_TYPES,
  ...AMENITIES,
  ...BOOST_PACKAGES,
  ...SUBSCRIPTION_PLANS,
];

describe('dữ liệu seed', () => {
  it('mọi id là uuid hợp lệ và không trùng nhau giữa các danh mục', () => {
    const ids = ALL_ROWS.map((row) => row.id);

    for (const id of ids) expect(uuidSchema.safeParse(id).success).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('có đúng bốn vai trò của BR-013', () => {
    expect(ROLES.map((role) => role.code).sort()).toEqual(['ADMIN', 'LANDLORD', 'STAFF', 'TENANT']);
  });

  it.each([
    ['loại hình', LISTING_TYPES],
    ['tiện ích', AMENITIES],
    ['gói đẩy tin', BOOST_PACKAGES],
  ])('mã %s đúng định dạng lọc trên đường dẫn và không trùng (BR-044)', (_name, rows) => {
    const codes = rows.map((row) => row.code);

    for (const code of codes) expect(catalogCodeSchema.safeParse(code).success).toBe(true);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('không có tiện ích "giờ giấc tự do" — đã có accessPolicy (BR-025)', () => {
    expect(AMENITIES.map((amenity) => amenity.code)).not.toContain('gio-giac-tu-do');
    expect(AMENITIES.every((amenity) => amenity.type === 'Room')).toBe(true);
  });

  it('có đúng một gói dùng thử, theo AS-003: 30 ngày, 1 khu, 5 phòng, miễn phí', () => {
    const trialPlans = SUBSCRIPTION_PLANS.filter((plan) => plan.isTrialPlan);

    expect(trialPlans).toHaveLength(1);
    expect(trialPlans[0]).toMatchObject({ trialDays: 30, maxProperties: 1, maxRooms: 5, price: 0 });
  });

  it('giá và thời hạn là số nguyên dương (BR-041)', () => {
    for (const pkg of BOOST_PACKAGES) {
      expect(Number.isInteger(pkg.price) && pkg.price > 0).toBe(true);
      expect(Number.isInteger(pkg.durationDays) && pkg.durationDays > 0).toBe(true);
    }
    for (const plan of SUBSCRIPTION_PLANS.filter((p) => !p.isTrialPlan)) {
      expect(Number.isInteger(plan.price) && plan.price > 0).toBe(true);
      expect(Number.isInteger(plan.renewalPrice) && plan.renewalPrice > 0).toBe(true);
    }
  });
});
