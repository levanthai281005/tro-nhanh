'use client';

import { propertySchema } from '@tronhanh/schemas';
import { Building2, DoorOpen, Wallet } from 'lucide-react';
import { useState } from 'react';
import { AreaSelect } from '@/components/ui/AreaSelect';
import { Button } from '@/components/ui/Button';
import { FormField, inputClassName } from '@/components/ui/FormField';
import { ModalShell } from '@/components/ui/ModalShell';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import { useCreateProperty } from '@/features/workspace/hooks/useProperties';

interface AddPropertyDialogProps {
  sellerId: string;
  onClose: () => void;
  onCreated: (propertyId: string) => void;
}

type FieldErrors = Partial<Record<'name' | 'address', string>>;

/**
 * Tạo khu trọ mới.
 *
 * Cố ý CHỈ hỏi ba thông tin nhận dạng. Đơn giá điện/nước/dịch vụ và tài khoản ngân hàng nhập
 * ở màn chi tiết khu (B7) — nơi có validate và xem trước mã VietQR. Nhồi hết vào đây thì bước
 * đầu tiên của người dùng mới thành một form dài, và họ sẽ điền số bừa cho xong.
 *
 * Đổi lại, form phải nói rõ **ba việc còn lại là gì** — người dùng bỏ dở giữa chừng thường vì
 * không biết mình đang ở đâu trong một quy trình dài bao nhiêu bước.
 */
export function AddPropertyDialog({ sellerId, onClose, onCreated }: AddPropertyDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState({ provinceCode: '', wardCode: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createProperty = useCreateProperty(sellerId);

  const handleSubmit = () => {
    setSubmitError(null);

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
    createProperty.mutate(parsed.data, {
      onSuccess: (property) => onCreated(property.id),
      onError: (mutationError) =>
        setSubmitError(
          mutationError instanceof Error ? mutationError.message : 'Chưa tạo được khu trọ.',
        ),
    });
  };

  return (
    <ModalShell
      footer={
        <>
          <Button disabled={createProperty.isPending} onClick={onClose} variant="ghost">
            Hủy
          </Button>
          <WriteGuardButton
            loading={createProperty.isPending}
            onClick={handleSubmit}
            surface="workspace"
            variant="primary"
          >
            Tạo khu trọ
          </WriteGuardButton>
        </>
      }
      onClose={onClose}
      title="Tạo khu trọ mới"
    >
      <div className="flex flex-col gap-5">
        {submitError ? (
          <p className="m-0 rounded-sm border border-error bg-error-soft px-3.5 py-2.5 text-[13px] font-semibold text-error">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3.5">
          <FormField
            error={fieldErrors.name}
            hint="Tên để bạn nhận ra khu này trong danh sách."
            isRequired
            label="Tên khu trọ"
          >
            <input
              autoFocus
              className={inputClassName}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="VD: Nhà trọ Hoàng Diệu"
              value={name}
            />
          </FormField>

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
        </div>

        {/* Nói trước ba bước còn lại. Người dùng mới không biết "khu trọ" khác "phòng" thế nào,
            và nếu tạo khu xong thấy màn trống rỗng thì họ tưởng đã làm sai. */}
        <div className="rounded-sm border border-line bg-canvas p-3.5">
          <p className="m-0 mb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
            Sau khi tạo xong
          </p>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            <NextStep
              Icon={Building2}
              text="Bạn được đưa thẳng tới màn quản lý phòng của khu này"
            />
            <NextStep Icon={DoorOpen} text="Thêm các phòng vào khu" />
            <NextStep
              Icon={Wallet}
              text="Nhập đơn giá điện nước và tài khoản nhận tiền ở màn chi tiết khu"
            />
          </ol>
        </div>
      </div>
    </ModalShell>
  );
}

function NextStep({ Icon, text }: { Icon: typeof Building2; text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-muted">
      <Icon aria-hidden="true" className="mt-px size-4 shrink-0 text-primary" />
      {text}
    </li>
  );
}
