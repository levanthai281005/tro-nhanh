import { VN_PROVINCES, type VnProvince } from './provinces.generated';
import type { VnWardTuple } from './wards.generated';

/**
 * Tra cứu đơn vị hành chính Việt Nam (sau sáp nhập 01/07/2025 — mô hình 2 cấp tỉnh/thành →
 * phường/xã, không còn cấp quận/huyện).
 *
 * Đây là lối vào **duy nhất** tới dữ liệu phường/xã. Đừng import thẳng `wards.generated` ở
 * component: 3.321 phần tử (~117KB) sẽ nằm luôn trong bundle chính, trong khi phần lớn người
 * xem tin không bao giờ mở ô chọn khu vực.
 */

export type { VnProvince, VnWardTuple };
export { VN_PROVINCES };

/**
 * Mã tỉnh và mã phường/xã là **chuỗi đệm số 0** theo chuẩn Cục Thống kê ("01", "00004"),
 * giống hệt dạng lưu trong cơ sở dữ liệu và dạng `@tronhanh/schemas` kiểm. Không có bước
 * chuyển kiểu nào ở ranh giới — mỗi chỗ chuyển là một chỗ có thể quên, mà quên thì "01" thành
 * "1" và bộ lọc không ra kết quả nhưng cũng không báo lỗi.
 */
export interface VnWard {
  readonly code: string;
  readonly name: string;
  readonly provinceCode: string;
}

/** Tên tỉnh theo mã; `null` khi mã không tồn tại (dữ liệu cũ hoặc hỏng). */
export function provinceName(code: string | null | undefined): string | null {
  if (code == null) return null;
  return VN_PROVINCES.find((province) => province.code === code)?.name ?? null;
}

let wardsPromise: Promise<readonly VnWard[]> | null = null;

/** Nạp lười danh sách phường/xã; giữ lại promise nên mở lần thứ hai không tải lại. */
export function loadVnWards(): Promise<readonly VnWard[]> {
  if (!wardsPromise) {
    wardsPromise = import('./wards.generated')
      .then((module) =>
        module.VN_WARDS.map((tuple: VnWardTuple): VnWard => ({
          code: tuple[0],
          name: tuple[1],
          provinceCode: tuple[2],
        })),
      )
      .catch((error: unknown) => {
        // Không giữ promise hỏng, nếu không thì mất mạng một lần là mọi lần mở sau đều lỗi
        // dù mạng đã có lại.
        wardsPromise = null;
        throw error;
      });
  }

  return wardsPromise;
}
