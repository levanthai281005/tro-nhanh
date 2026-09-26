import { z } from 'zod';

/**
 * Địa chỉ hành chính hai cấp: tỉnh/thành → phường/xã (BR-043, AS-027).
 *
 * Lưu **mã** để lọc và **tên** để hiển thị. Mã trả lời "đơn vị hành chính nào" một cách
 * chuẩn xác; tên là ảnh chụp tại thời điểm đăng, dùng để hiển thị đúng lịch sử sau những lần
 * đổi địa giới.
 *
 * **Mã là chuỗi chữ số, không phải số.** Mã của Tổng cục Thống kê có số 0 đứng đầu ("01" là
 * Hà Nội) — lưu thành số là mất số 0 đó. `@tronhanh/constants` giữ mã dưới dạng `number` vì
 * file sinh tự động tối ưu kích thước; đổi qua lại ở ranh giới (`AreaSelect` của web đã làm
 * đúng bằng `String(ward.code)`).
 */

export const provinceCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}$/, 'Mã tỉnh/thành không hợp lệ');

export const wardCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,5}$/, 'Mã phường/xã không hợp lệ');

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
  .max(255, 'Địa chỉ tối đa 255 ký tự');

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
  provinces: readonly { code: number | string }[],
  wards: readonly { code: number | string; provinceCode: number | string }[],
): AddressCatalog {
  return {
    provinceCodes: provinces.map((province) => String(province.code)),
    wardToProvince: new Map(
      wards.map((ward) => [String(ward.code), String(ward.provinceCode)] as const),
    ),
  };
}
