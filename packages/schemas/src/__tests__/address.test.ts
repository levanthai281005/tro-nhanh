import { loadVnWards, VN_PROVINCES, type VnWard } from '@tronhanh/constants';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addressWriteSchema,
  buildAddressCatalog,
  provinceCodeSchema,
  wardCodeSchema,
  withAddressCatalog,
} from '../index';

/**
 * Chạy trên **danh mục thật** của `@tronhanh/constants` (devDependency — không vào runtime
 * của package này), để bắt đúng loại hỏng nguy hiểm nhất: dữ liệu và schema lệch định dạng
 * mã thì bộ lọc im lặng không ra kết quả.
 */
let wards: readonly VnWard[];

beforeAll(async () => {
  wards = await loadVnWards();
});

describe('mã hành chính khớp giữa danh mục và schema (BR-043)', () => {
  it('mọi mã tỉnh và mọi mã phường/xã trong danh mục đều qua schema', () => {
    const badProvinces = VN_PROVINCES.filter(
      (province) => !provinceCodeSchema.safeParse(province.code).success,
    );
    const badWards = wards.filter(
      (ward) =>
        !wardCodeSchema.safeParse(ward.code).success ||
        !provinceCodeSchema.safeParse(ward.provinceCode).success,
    );

    expect(VN_PROVINCES).toHaveLength(34);
    expect(wards).toHaveLength(3321);
    expect(badProvinces).toEqual([]);
    expect(badWards).toEqual([]);
  });

  it('chặn mã thiếu số 0 đứng đầu — "1" không phải Hà Nội, "01" mới là', () => {
    expect(provinceCodeSchema.safeParse('1').success).toBe(false);
    expect(wardCodeSchema.safeParse('4').success).toBe(false);
    expect(provinceCodeSchema.safeParse('01').success).toBe(true);
  });
});

describe('kiểm mã có trong danh mục (withAddressCatalog)', () => {
  const address = (provinceCode: string, wardCode: string) => ({
    provinceCode,
    wardCode,
    addressDetail: '123 An Dương Vương',
  });

  it('nhận phường có thật thuộc đúng tỉnh; chặn phường của tỉnh khác và mã không tồn tại', () => {
    const guarded = withAddressCatalog(
      addressWriteSchema,
      buildAddressCatalog(VN_PROVINCES, wards),
    );

    // 27316 = Phường An Đông, TP.HCM; 00004 = Phường Ba Đình, Hà Nội.
    expect(guarded.safeParse(address('79', '27316')).success).toBe(true);

    const wrongProvince = guarded.safeParse(address('79', '00004'));
    expect(wrongProvince.success).toBe(false);
    expect(wrongProvince.error?.issues[0]?.message).toBe(
      'Phường/xã không thuộc tỉnh/thành đã chọn',
    );

    expect(guarded.safeParse(address('79', '99999')).success).toBe(false);
    expect(guarded.safeParse(address('00', '27316')).success).toBe(false);
  });

  it('giới hạn địa chỉ chi tiết đúng 200 ký tự (Mục 9)', () => {
    expect(
      addressWriteSchema.safeParse({ ...address('79', '27316'), addressDetail: 'a'.repeat(200) })
        .success,
    ).toBe(true);
    expect(
      addressWriteSchema.safeParse({ ...address('79', '27316'), addressDetail: 'a'.repeat(201) })
        .success,
    ).toBe(false);
  });

  it('bỏ tên phường/xã client gửi kèm — tên do máy chủ suy từ mã', () => {
    const parsed = addressWriteSchema.parse({
      ...address('79', '27316'),
      wardName: 'Phường giả mạo',
    });

    expect(parsed).not.toHaveProperty('wardName');
  });
});
