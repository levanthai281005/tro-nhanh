'use client';

import type { RoomStatus } from '@tronhanh/schemas';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, inputClassName } from '@/components/ui/FormField';
import { AmenityPicker } from '@/components/ui/AmenityPicker';
import { FormSection } from '@/components/ui/FormSection';
import { ModalShell } from '@/components/ui/ModalShell';
import { NumberField } from '@/components/ui/NumberField';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import { RoomStatusPicker } from '@/features/workspace/components/rooms/RoomStatusPicker';
import type { RoomWriteInput } from '@/features/workspace/services/roomsService';
import type { RoomFormValues, RoomListItem } from '@/features/workspace/types/room';
import {
  toRoomFormValues,
  validateRoomForm,
  type RoomFormFieldErrors,
} from '@/features/workspace/utils/roomForm';

interface RoomFormDialogProps {
  propertyId: string;
  propertyName: string;
  /** Có giá trị = sửa; `null` = thêm mới. Một dialog cho cả hai vì hai form trùng ~80%. */
  room: RoomListItem | null;
  isSaving: boolean;
  /**
   * Lỗi trả về từ mutation (trùng mã phòng, mất mạng…).
   *
   * Phải hiển thị **bên trong** dialog: modal phủ kín màn hình, nên banner lỗi đặt ở trang
   * nền nằm sau lớp phủ và người dùng chỉ thấy dialog đứng im không rõ lý do.
   */
  submitError: string | null;
  onClose: () => void;
  onSubmit: (input: RoomWriteInput) => void;
}

export function RoomFormDialog({
  propertyId,
  propertyName,
  room,
  isSaving,
  submitError,
  onClose,
  onSubmit,
}: RoomFormDialogProps) {
  const [values, setValues] = useState<RoomFormValues>(() => toRoomFormValues(propertyId, room));
  const [fieldErrors, setFieldErrors] = useState<RoomFormFieldErrors>({});

  const setField = <TKey extends keyof RoomFormValues>(key: TKey, value: RoomFormValues[TKey]) => {
    setValues((current) => ({ ...current, [key]: value }));
    // Xóa lỗi của đúng ô vừa sửa: giữ lại thì người dùng sửa xong vẫn thấy chữ đỏ và tưởng
    // mình chưa sửa đúng.
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = () => {
    const result = validateRoomForm(propertyId, values);
    if (!result.ok) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors({});
    onSubmit(result.input);
  };

  return (
    <ModalShell
      footer={
        <>
          <Button disabled={isSaving} onClick={onClose} variant="ghost">
            Hủy
          </Button>
          <WriteGuardButton
            loading={isSaving}
            onClick={handleSubmit}
            surface="workspace"
            variant="primary"
          >
            {room ? 'Lưu thay đổi' : 'Thêm phòng'}
          </WriteGuardButton>
        </>
      }
      onClose={onClose}
      title={room ? `Sửa phòng ${room.roomCode}` : 'Thêm phòng mới'}
    >
      <div className="flex flex-col gap-6">
        {submitError ? (
          <p className="m-0 rounded-sm border border-error bg-error-soft px-3.5 py-2.5 text-[13px] font-semibold text-error">
            {submitError}
          </p>
        ) : null}

        <FormSection
          description={`Phòng sẽ được thêm vào khu ${propertyName}.`}
          title="Thông tin phòng"
        >
          <div className="grid gap-3.5 sm:grid-cols-[1.4fr_1fr]">
            <FormField error={fieldErrors.roomCode} isRequired label="Mã phòng">
              <input
                autoFocus
                className={inputClassName}
                onChange={(event) => setField('roomCode', event.target.value)}
                placeholder="VD: P101"
                value={values.roomCode}
              />
            </FormField>

            <FormField error={fieldErrors.floor} label="Tầng">
              <NumberField
                hasError={Boolean(fieldErrors.floor)}
                onValueChange={(value) => setField('floor', value)}
                placeholder="1"
                value={values.floor}
              />
            </FormField>

            <FormField error={fieldErrors.area} isRequired label="Diện tích">
              <NumberField
                hasError={Boolean(fieldErrors.area)}
                onValueChange={(value) => setField('area', value)}
                placeholder="25"
                suffix="m²"
                value={values.area}
              />
            </FormField>

            <FormField error={fieldErrors.price} isRequired label="Giá thuê">
              <NumberField
                hasError={Boolean(fieldErrors.price)}
                onValueChange={(value) => setField('price', value)}
                placeholder="3.200.000"
                suffix="đ/tháng"
                value={values.price}
                withThousandSeparator
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Trạng thái">
          <RoomStatusPicker
            onChange={(status: RoomStatus) => setField('status', status)}
            value={values.status}
          />
        </FormSection>

        <FormSection
          description="Không chọn gì cũng được — phòng thô là dữ liệu thật, không phải thiếu thông tin."
          title="Nội thất & tiện ích"
        >
          <AmenityPicker
            onToggle={(label) =>
              // Cập nhật theo hàm, không đọc `values.amenities` từ closure: bấm nhanh hai tiện
              // ích trong cùng một khung hình sẽ cùng đọc mảng cũ và cái sau đè cái trước.
              setValues((current) => ({
                ...current,
                amenities: current.amenities.includes(label)
                  ? current.amenities.filter((item) => item !== label)
                  : [...current.amenities, label],
              }))
            }
            selected={values.amenities}
          />
        </FormSection>

        {/* Đơn giá riêng — mặc định TẮT. Giá điện nước không cố định một mức cho cả khu: chủ
            trọ có thể thu 3.500đ/kWh với hợp đồng cũ và 3.700đ/kWh với phòng ký mới. Nhưng
            phần lớn phòng dùng chung giá khu, nên bắt nhập cho từng phòng sẽ khiến người dùng
            điền số bừa. */}
        <FormSection title="Đơn giá & ghi chú">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-sm border border-line bg-canvas px-3.5 py-3">
            <input
              checked={values.hasCustomPricing}
              className="mt-[3px] size-4 shrink-0 accent-primary"
              onChange={(event) => setField('hasCustomPricing', event.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-[13.5px] font-bold text-ink">
                Phòng này có đơn giá riêng
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                Để tắt thì phòng dùng đơn giá của khu trọ. Bật khi phòng này ký hợp đồng ở mức giá
                khác các phòng còn lại.
              </span>
            </span>
          </label>

          {values.hasCustomPricing ? (
            <div className="grid gap-3.5 sm:grid-cols-3">
              <FormField label="Tiền điện">
                <NumberField
                  onValueChange={(value) => setField('electricityPrice', value)}
                  placeholder="Theo khu"
                  suffix="đ/kWh"
                  value={values.electricityPrice}
                  withThousandSeparator
                />
              </FormField>
              <FormField label="Tiền nước">
                <NumberField
                  onValueChange={(value) => setField('waterPrice', value)}
                  placeholder="Theo khu"
                  suffix="đ/m³"
                  value={values.waterPrice}
                  withThousandSeparator
                />
              </FormField>
              <FormField label="Phí dịch vụ">
                <NumberField
                  onValueChange={(value) => setField('servicePrice', value)}
                  placeholder="Theo khu"
                  suffix="đ/tháng"
                  value={values.servicePrice}
                  withThousandSeparator
                />
              </FormField>
            </div>
          ) : null}

          <FormField
            hint="Chỉ mình bạn thấy — người thuê không đọc được ghi chú này."
            label="Ghi chú nội bộ"
          >
            <textarea
              className={inputClassName}
              onChange={(event) => setField('note', event.target.value)}
              placeholder="VD: Vừa sơn lại, đón khách được ngay"
              rows={2}
              value={values.note}
            />
          </FormField>
        </FormSection>
      </div>
    </ModalShell>
  );
}
