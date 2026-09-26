'use client';

import { loadVnWards, VN_PROVINCES, type VnWard } from '@tronhanh/constants';
import { useEffect, useMemo, useState } from 'react';
import { AppSelect, type SelectOption } from '@/components/ui/AppSelect';
import { FieldBox } from '@/components/ui/FormField';

/**
 * Chọn khu vực theo mô hình hành chính 2 cấp (tỉnh/thành → phường/xã, áp dụng từ 01/07/2025;
 * không còn cấp quận/huyện).
 *
 * Trả về cả **mã** (để lọc) lẫn **tên** (để lưu vào `district` và hiển thị). Component này
 * đã có sẵn danh sách trong tay, nên tra tên ở đây thay vì bắt mỗi form tự nạp lại 3.321
 * phường chỉ để đổi mã ra tên.
 */

export interface AreaSelectValue {
  provinceCode: string;
  wardCode: string;
}

export interface AreaSelectChange extends AreaSelectValue {
  provinceName: string | null;
  wardName: string | null;
}

export interface AreaSelectProps {
  value: AreaSelectValue;
  onChange: (next: AreaSelectChange) => void;
  hasError?: boolean;
}

export function AreaSelect({ value, onChange, hasError }: AreaSelectProps) {
  const [wards, setWards] = useState<readonly VnWard[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    loadVnWards()
      .then((loaded) => {
        if (!isCancelled) setWards(loaded);
      })
      .catch(() => {
        if (!isCancelled) setHasLoadFailed(true);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const provinceOptions: SelectOption[] = useMemo(
    () => VN_PROVINCES.map((province) => ({ label: province.name, value: province.code })),
    [],
  );

  const wardOptions: SelectOption[] = useMemo(() => {
    if (!wards || !value.provinceCode) return [];
    return wards
      .filter((ward) => ward.provinceCode === value.provinceCode)
      .map((ward) => ({ label: ward.name, value: ward.code }));
  }, [wards, value.provinceCode]);

  const selectProvince = (provinceCode: string) => {
    // Đổi tỉnh thì phường cũ không còn thuộc tỉnh mới — xóa để tránh cặp mã vô nghĩa.
    onChange({
      provinceCode,
      wardCode: '',
      provinceName: VN_PROVINCES.find((p) => p.code === provinceCode)?.name ?? null,
      wardName: null,
    });
  };

  const selectWard = (wardCode: string) => {
    onChange({
      provinceCode: value.provinceCode,
      wardCode,
      provinceName: VN_PROVINCES.find((p) => p.code === value.provinceCode)?.name ?? null,
      wardName: wards?.find((ward) => ward.code === wardCode)?.name ?? null,
    });
  };

  if (hasLoadFailed) {
    return (
      <p className="m-0 text-sm text-error" role="alert">
        Không tải được danh sách phường/xã. Vui lòng tải lại trang.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <FieldBox hasError={hasError && !value.provinceCode}>
        <AppSelect
          data-testid="area-province"
          onChange={selectProvince}
          options={provinceOptions}
          placeholder="Chọn tỉnh/thành"
          searchable
          value={value.provinceCode}
        />
      </FieldBox>
      <FieldBox hasError={hasError && !value.wardCode}>
        <AppSelect
          data-testid="area-ward"
          emptyText={value.provinceCode ? 'Không tìm thấy phường/xã' : 'Chọn tỉnh/thành trước'}
          onChange={selectWard}
          options={wardOptions}
          placeholder={wards ? 'Chọn phường/xã' : 'Đang tải danh sách...'}
          searchable
          value={value.wardCode}
        />
      </FieldBox>
    </div>
  );
}
