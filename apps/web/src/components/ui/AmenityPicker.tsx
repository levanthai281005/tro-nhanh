'use client';

import { AMENITY_OPTIONS } from '@/constants/amenities';
import { cn } from '@/utils/cn';

export interface AmenityPickerProps {
  /** Các **nhãn** đang chọn. Không phải `key` — xem ghi chú ở `constants/amenities`. */
  selected: readonly string[];
  onToggle: (label: string) => void;
  className?: string;
}

/**
 * Lưới chọn tiện ích, dùng chung cho form đăng tin (B5) và form phòng (B8).
 *
 * Tách ra khỏi `StepRoomInfo` khi màn quản lý phòng cũng cần chọn tiện ích. Hai bản sao của
 * cùng một lưới là cách chắc chắn để chúng lệch nhau — chính danh sách tiện ích đã dính lỗi
 * đó một lần ở prototype rồi.
 *
 * ⚠️ Component này **không** tự giữ trạng thái. Nơi gọi phải cập nhật mảng bằng giá trị đọc
 * **tại thời điểm bấm** (`getValues` với React Hook Form, hoặc cập nhật theo hàm với
 * `useState`) — đọc mảng từ ảnh chụp lúc render thì bấm nhanh hai tiện ích trong cùng một
 * khung hình sẽ chỉ giữ được một.
 */
export function AmenityPicker({ selected, onToggle, className }: AmenityPickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {AMENITY_OPTIONS.map(({ key, label, Icon }) => {
        // Lưu NHÃN, không lưu `key` — bộ lọc tìm kiếm và phần đối chiếu icon đều so theo nhãn;
        // ghi `key` xuống sẽ làm cả hai chết im lặng.
        const isSelected = selected.includes(label);

        return (
          <button
            key={key}
            aria-pressed={isSelected}
            className={cn(
              'flex items-center gap-2 rounded-md border-[1.5px] px-3 py-2.5 text-left text-[13px] transition-colors',
              isSelected
                ? 'border-primary bg-cream font-bold text-primary'
                : 'border-line bg-surface text-ink-muted hover:border-primary',
            )}
            onClick={() => onToggle(label)}
            type="button"
          >
            <Icon
              aria-hidden="true"
              className={cn('size-4 shrink-0', isSelected ? 'text-primary' : 'text-sand')}
              strokeWidth={1.9}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
