import { z } from 'zod';

/**
 * Địa chỉ hành chính hai cấp: tỉnh/thành → phường/xã (BR-043, AS-027).
 *
 * Lưu **mã** để lọc và **tên** để hiển thị. Mã trả lời "đơn vị hành chính nào" một cách
 * chuẩn xác; tên là ảnh chụp tại thời điểm đăng, dùng để hiển thị đúng lịch sử sau những lần
 * đổi địa giới.
 *
 * **Mã là chuỗi đệm số 0, đúng độ dài chuẩn của Cục Thống kê:** tỉnh 2 chữ số ("01" là Hà
 * Nội), phường/xã 5 chữ số ("00004"). `@tronhanh/constants` giữ đúng dạng này nên không có
 * bước chuyển kiểu nào ở ranh giới. Schema đòi **đủ độ dài** chứ không nhận "1": nhận thì một
 * chỗ quên đệm số 0 sẽ lọt qua kiểm tra rồi lọc không ra kết quả mà không báo lỗi.
 */

export const PROVINCE_CODE_PATTERN = /^\d{2}$/;
export const WARD_CODE_PATTERN = /^\d{5}$/;

export const provinceCodeSchema = z
  .string()
  .trim()
  .regex(PROVINCE_CODE_PATTERN, 'Mã tỉnh/thành phải gồm đúng 2 chữ số');

export const wardCodeSchema = z
  .string()
  .trim()
  .regex(WARD_CODE_PATTERN, 'Mã phường/xã phải gồm đúng 5 chữ số');

/** Tên phường/xã — **chỉ có ở dữ liệu đọc**; xem ghi chú ở `addressWriteSchema`. */
export const wardNameSchema = z
  .string()
  .trim()
  .min(1, 'Thiếu tên phường/xã')
  .max(120, 'Tên phường/xã quá dài');

export const addressDetailSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập địa chỉ cụ thể')
  .max(200, 'Địa chỉ chi tiết tối đa 200 ký tự');

/**
 * Địa chỉ trong **request ghi**. Cố ý **không có `wardName`**: tên phường/xã do máy chủ suy
 * ra từ mã (BR-043).
 *
 * Nhận tên từ client thì có hai đường hỏng: sai chính tả hoặc tên cũ lọt vào cơ sở dữ liệu
 * và bộ lọc hỏng theo; hoặc người ta gửi `wardCode` của một khu rẻ kèm `wardName` của khu
 * đắt để lọt vào kết quả tìm kiếm sai.
 */
export const addressWriteSchema = z.object({
  provinceCode: provinceCodeSchema,
  wardCode: wardCodeSchema,
  addressDetail: addressDetailSchema,
});

/** Địa chỉ trong response — có thêm tên phường/xã máy chủ đã suy ra. */
export const addressViewSchema = addressWriteSchema.extend({
  wardName: wardNameSchema,
});

export type AddressWriteInput = z.infer<typeof addressWriteSchema>;
export type AddressView = z.infer<typeof addressViewSchema>;

/** Một dòng trong danh mục hành chính, đủ để kiểm tra mã. */
export interface AdministrativeUnit {
  readonly code: string;
  readonly provinceCode?: string;
}

export interface AddressCatalog {
  readonly provinceCodes: Iterable<string>;
  /** Mã phường/xã → mã tỉnh chứa nó. */
  readonly wardToProvince: ReadonlyMap<string, string>;
}

/**
 * Kiểm mã có thật trong danh mục và phường/xã có thuộc đúng tỉnh không.
 *
 * **Vì sao là hàm nhận danh mục thay vì tự import:** danh mục gói sẵn trong mã nguồn
 * (BR-043) nên kiểm được mà không cần cơ sở dữ liệu — nhưng bảng phường/xã có 3.321 dòng
 * (~117KB) và `@tronhanh/constants` cố ý chỉ cho nạp lười (`loadVnWards()`). Nếu package này
 * import thẳng bảng đó thì mọi màn nhập khẩu bất kỳ schema nào cũng gánh 117KB, kể cả màn
 * chỉ xem tin.
 *
 * Vì vậy:
 * - `apps/api` nạp danh mục lúc khởi động rồi bọc schema ghi bằng hàm này — **đây là nơi
 *   kiểm tra có hiệu lực**, và nó không cần truy vấn cơ sở dữ liệu nào.
 * - Biểu mẫu web/mobile không cần bọc: `AreaSelect` chỉ cho chọn từ chính danh mục đó nên
 *   không tạo ra được mã sai.
 */
export function withAddressCatalog<TSchema extends z.ZodType<AddressWriteInput>>(
  schema: TSchema,
  catalog: AddressCatalog,
) {
  const provinceCodes = new Set(catalog.provinceCodes);

  return schema.superRefine((value, ctx) => {
    if (!provinceCodes.has(value.provinceCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['provinceCode'],
        message: 'Tỉnh/thành không có trong danh mục',
      });
      return;
    }

    const provinceOfWard = catalog.wardToProvince.get(value.wardCode);
    if (!provinceOfWard) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wardCode'],
        message: 'Phường/xã không có trong danh mục',
      });
      return;
    }

    if (provinceOfWard !== value.provinceCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wardCode'],
        message: 'Phường/xã không thuộc tỉnh/thành đã chọn',
      });
    }
  });
}

/** Dựng `AddressCatalog` từ danh sách phẳng — tiện cho `apps/api` lúc khởi động. */
export function buildAddressCatalog(
  provinces: readonly { code: string }[],
  wards: readonly { code: string; provinceCode: string }[],
): AddressCatalog {
  return {
    provinceCodes: provinces.map((province) => province.code),
    wardToProvince: new Map(wards.map((ward) => [ward.code, ward.provinceCode] as const)),
  };
}
