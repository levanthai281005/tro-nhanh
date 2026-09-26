'use client';

import { propertySchema } from '@tronhanh/schemas';
import { useState } from 'react';
import { AreaSelect } from '@/components/ui/AreaSelect';
import { FormField, inputClassName } from '@/components/ui/FormField';
import { NumberField } from '@/components/ui/NumberField';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import {
  SectionCard,
  SectionFeedback,
} from '@/features/workspace/components/property-detail/SectionCard';
import { useUpdatePropertyInfo } from '@/features/workspace/hooks/usePropertyDetail';
import type { Property } from '@/features/workspace/types/property';

type FieldErrors = Partial<Record<'name' | 'address', string>>;

export function PropertyInfoSection({
  property,
  sellerId,
}: {
  property: Property;
  sellerId: string;
}) {
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [district, setDistrict] = useState(property.district);
  const [floorCount, setFloorCount] = useState(
    property.floorCount === null ? '' : String(property.floorCount),
  );
  const [note, setNote] = useState(property.note ?? '');
  const [area, setArea] = useState({
    provinceCode: property.provinceCode ?? '',
    wardCode: property.wardCode ?? '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateInfo = useUpdatePropertyInfo(property.id, sellerId);

  const handleSave = () => {
    setError(null);
    setSuccessMessage(null);

    const parsed = propertySchema.safeParse({
      name,
      address,
      district,
      provinceCode: area.provinceCode || null,
      wardCode: area.wardCode || null,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors({ name: flattened.name?.[0], address: flattened.address?.[0] });
      return;
    }

    setFieldErrors({});
    updateInfo.mutate(
      {
        ...parsed.data,
        floorCount: floorCount.trim() === '' ? null : Number(floorCount),
        note: note.trim() || null,
      },
      {
        onSuccess: () => setSuccessMessage('Đã lưu thông tin khu trọ.'),
        onError: (mutationError) =>
          setError(
            mutationError instanceof Error ? mutationError.message : 'Chưa lưu được thay đổi.',
          ),
      },
    );
  };

  return (
    <SectionCard
      description="Tên và khu vực dùng để nhận ra khu này, và hiện trên hồ sơ công khai nếu bạn bật."
      footer={
        <WriteGuardButton
          loading={updateInfo.isPending}
          onClick={handleSave}
          surface="workspace"
          variant="primary"
        >
          Lưu thông tin
        </WriteGuardButton>
      }
      title="Thông tin khu trọ"
    >
      <SectionFeedback error={error} successMessage={successMessage} />

      <div className="grid gap-3.5 md:grid-cols-[2fr_1fr]">
        <FormField error={fieldErrors.name} isRequired label="Tên khu trọ">
          <input
            className={inputClassName}
            onChange={(event) => {
              setName(event.target.value);
              setFieldErrors((current) => ({ ...current, name: undefined }));
            }}
            value={name}
          />
        </FormField>

        <FormField hint="Để trống nếu chưa rõ." label="Số tầng">
          <NumberField
            onValueChange={setFloorCount}
            placeholder="VD: 3"
            suffix="tầng"
            value={floorCount}
          />
        </FormField>
      </div>

      <FormField error={fieldErrors.address} label="Địa chỉ">
        <input
          className={inputClassName}
          onChange={(event) => {
            setAddress(event.target.value);
            setFieldErrors((current) => ({ ...current, address: undefined }));
          }}
          placeholder="VD: 123 Hoàng Diệu, Phường 9"
          value={address}
        />
      </FormField>

      <AreaSelect
        onChange={(next) => {
          setArea({ provinceCode: next.provinceCode, wardCode: next.wardCode });
          setDistrict(next.wardName ?? '');
        }}
        value={area}
      />

      <FormField hint="Chỉ mình bạn thấy." label="Ghi chú nội bộ">
        <textarea
          className={inputClassName}
          onChange={(event) => setNote(event.target.value)}
          placeholder="VD: Khu mới nhận, chưa nhập đơn giá điện nước"
          rows={2}
          value={note}
        />
      </FormField>
    </SectionCard>
  );
}
