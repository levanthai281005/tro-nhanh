'use client';

import { useFormContext } from 'react-hook-form';
import { AmenityPicker } from '@/components/ui/AmenityPicker';
import { FormField, inputClassName, inputErrorClassName } from '@/components/ui/FormField';
import type { AccessPolicy } from '@/features/marketplace/types/savedListings';
import type { PostListingFormValues } from '@/features/marketplace/types/postListing';
import { cn } from '@/utils/cn';

/** Nhóm nghìn khi gõ: "3500000" khó đọc, "3.500.000" thì liếc là biết. */
function formatThousands(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('vi-VN') : '';
}

export function StepRoomInfo() {
  const { register, setValue, getValues, watch, formState } =
    useFormContext<PostListingFormValues>();
  const errors = formState.errors;
  const values = watch();
  const isRestricted = values.accessPolicy === 'Restricted';

  const toggleAmenity = (amenity: string) => {
    // Đọc bằng `getValues` chứ không dùng mảng từ `watch`: mảng đó là ảnh chụp lúc render, nên
    // bấm nhanh hai tiện ích trong cùng một khung hình sẽ khiến cả hai đọc cùng giá trị cũ và
    // lựa chọn sau ghi đè lựa chọn trước.
    const current = getValues('amenities');
    setValue(
      'amenities',
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="m-0 text-lg font-extrabold text-ink">Phòng thế nào?</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">
          Diện tích và giá là hai thứ người tìm trọ lọc đầu tiên.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField error={errors.area?.message} hint="Đơn vị: m²" isRequired label="Diện tích">
          <input
            className={cn(inputClassName, errors.area && inputErrorClassName)}
            data-testid="field-area"
            inputMode="decimal"
            placeholder="VD: 25"
            {...register('area')}
          />
        </FormField>

        <FormField
          error={errors.price?.message}
          hint="Đơn vị: đồng/tháng"
          isRequired
          label="Giá thuê"
        >
          <input
            className={cn(inputClassName, errors.price && inputErrorClassName)}
            data-testid="field-price"
            inputMode="numeric"
            onChange={(event) => setValue('price', formatThousands(event.target.value))}
            placeholder="VD: 3.500.000"
            value={values.price}
          />
        </FormField>
      </div>

      <FormField hint="Để trống nếu bạn không giới hạn." label="Số người ở tối đa">
        <input
          className={cn(inputClassName, 'md:max-w-[200px]')}
          data-testid="field-max-occupants"
          inputMode="numeric"
          placeholder="VD: 4"
          {...register('maxOccupants')}
        />
      </FormField>

      <FormField
        error={errors.accessOpenTime?.message}
        hint="Người đi thuê hay lọc theo mục này, nhất là người đi làm ca."
        isRequired
        label="Giờ ra vào"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'Free', label: 'Tự do 24/7' },
                { value: 'Restricted', label: 'Có giờ giới hạn' },
              ] as { value: AccessPolicy; label: string }[]
            ).map((option) => {
              const isSelected = values.accessPolicy === option.value;
              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-sm border-[1.5px] px-4 py-2 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-cream font-bold text-primary'
                      : 'border-line bg-surface text-ink-muted hover:border-primary',
                  )}
                  key={option.value}
                  onClick={() => setValue('accessPolicy', option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {isRestricted ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                aria-label="Giờ mở cửa"
                className={cn(
                  inputClassName,
                  'w-[130px]',
                  errors.accessOpenTime && inputErrorClassName,
                )}
                data-testid="field-open-time"
                type="time"
                {...register('accessOpenTime')}
              />
              <span className="text-sm text-ink-muted">đến</span>
              <input
                aria-label="Giờ đóng cửa"
                className={cn(inputClassName, 'w-[130px]')}
                data-testid="field-close-time"
                type="time"
                {...register('accessCloseTime')}
              />
            </div>
          ) : null}
        </div>
      </FormField>

      <FormField hint="Chọn những gì phòng có sẵn." label="Tiện ích nổi bật">
        <AmenityPicker onToggle={toggleAmenity} selected={values.amenities} />
      </FormField>
    </div>
  );
}
