import {
  Bath,
  Car,
  Clock,
  Fingerprint,
  Layers,
  ParkingCircle,
  PawPrint,
  Refrigerator,
  WashingMachine,
  Wifi,
  Wind,
  type LucideIcon,
} from 'lucide-react';

/**
 * Nguồn chân lý duy nhất cho tiện ích — dùng chung cho **tin cho thuê và phòng**.
 *
 * `DATA_ENTITIES.md` mô hình hóa `Amenity` là một **catalog** với quan hệ `n-n` tới cả
 * `RentalListing` lẫn `Room`. Vì vậy file này nằm ở `src/constants/` chứ không thuộc feature
 * nào: `features/marketplace` và `features/workspace` **cấm import chéo** (ESLint chặn ở mức
 * `error`), nên để nó trong marketplace thì màn quản lý phòng không dùng được.
 *
 * ⚠️ **Lưu NHÃN tiếng Việt xuống dữ liệu, không lưu `key`.** Bộ lọc ở trang tìm kiếm và phần
 * đối chiếu icon đều so theo nhãn; ghi `key` vào sẽ làm cả bộ lọc lẫn icon chết im lặng —
 * không báo lỗi, chỉ là không khớp gì cả. `key` chỉ là định danh trong state của form.
 *
 * Prototype từng có hai danh sách lệch nhau (form 11 mục, trang chi tiết 6 mục, nhãn khác
 * nhau) nên trang chi tiết không khớp được icon và rơi hết về Wifi. Đó cũng là lý do **không**
 * chép danh sách này sang workspace: hai bản sẽ lệch, và lệch một cách im lặng.
 */
export interface AmenityOption {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const AMENITY_OPTIONS: readonly AmenityOption[] = [
  { key: 'ac', label: 'Máy lạnh', Icon: Wind },
  { key: 'wifi', label: 'Wifi', Icon: Wifi },
  { key: 'loft', label: 'Gác lửng', Icon: Layers },
  { key: 'parking', label: 'Chỗ để xe', Icon: Car },
  { key: 'bath', label: 'WC riêng', Icon: Bath },
  { key: 'free', label: 'Giờ giấc tự do', Icon: Clock },
  { key: 'fridge', label: 'Tủ lạnh', Icon: Refrigerator },
  { key: 'washer', label: 'Máy giặt riêng', Icon: WashingMachine },
  { key: 'finger', label: 'Khóa vân tay', Icon: Fingerprint },
  { key: 'garage', label: 'Hầm để xe', Icon: ParkingCircle },
  { key: 'pet', label: 'Cho nuôi thú cưng', Icon: PawPrint },
];

/** Nhãn đã lưu → icon để hiển thị. Không khớp thì trả `null` để nơi gọi tự quyết. */
export function amenityIconByLabel(label: string): LucideIcon | null {
  return AMENITY_OPTIONS.find((option) => option.label === label)?.Icon ?? null;
}
