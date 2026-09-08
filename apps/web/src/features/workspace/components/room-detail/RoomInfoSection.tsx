'use client';

import { Pencil } from 'lucide-react';
import { amenityIconByLabel } from '@/constants/amenities';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import { SectionCard } from '@/features/workspace/components/property-detail/SectionCard';
import type { ResolvedUnitPrice, RoomOverview } from '@/features/workspace/types/roomOverview';
import { formatPeriod } from '@/features/workspace/utils/period';
import { formatVnd } from '@/utils/formatVnd';

/**
 * Một dòng đơn giá, nói rõ **con số** và **nguồn** của nó.
 *
 * `0` hiện thành chữ "Miễn phí" chứ không phải "0 đ": nhìn "0 đ" người ta tưởng dữ liệu lỗi
 * hoặc quên nhập, trong khi đó là quyết định có chủ ý của chủ trọ (bao điện cho người nhà).
 */
function PriceRow({
  label,
  price,
  unit,
  lastPeriod,
}: {
  label: string;
  price: ResolvedUnitPrice;
  unit: string;
  lastPeriod?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line py-2.5 last:border-b-0">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="flex flex-wrap items-baseline gap-2">
        <strong className="text-[13.5px] font-bold text-ink">
          {price.value === 0 ? 'Miễn phí' : formatVnd(price.value, `/${unit}`)}
        </strong>
        <span
          className={
            price.source === 'room'
              ? 'rounded-full bg-cream px-2 py-[1px] text-[11px] font-bold text-primary'
              : 'rounded-full bg-canvas px-2 py-[1px] text-[11px] font-medium text-ink-muted'
          }
        >
          {price.source === 'room' ? 'riêng phòng' : 'theo giá khu'}
        </span>
        {lastPeriod !== undefined ? (
          <span className="text-[12px] text-ink-muted">
            {lastPeriod ? `Chốt số ${formatPeriod(lastPeriod)}` : 'Chưa ghi kỳ nào'}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function RoomInfoSection({
  overview,
  onEdit,
}: {
  overview: RoomOverview;
  onEdit: () => void;
}) {
  const { room, pricing, lastReadingPeriod } = overview;

  return (
    <SectionCard
      description="Sửa ở đây là sửa chính bản ghi phòng — đơn giá riêng để trống nghĩa là dùng giá của khu."
      footer={
        <WriteGuardButton
          icon={<Pencil aria-hidden="true" className="size-4" />}
          onClick={onEdit}
          size="sm"
          surface="workspace"
          variant="outline"
        >
          Sửa thông tin phòng
        </WriteGuardButton>
      }
      title="Thông tin phòng"
    >
      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="m-0 text-xs text-ink-muted">Tầng</dt>
          <dd className="m-0 text-[13.5px] font-bold text-ink">{room.floor}</dd>
        </div>
        <div>
          <dt className="m-0 text-xs text-ink-muted">Diện tích</dt>
          <dd className="m-0 text-[13.5px] font-bold text-ink">{room.area} m²</dd>
        </div>
        <div className="col-span-2">
          <dt className="m-0 text-xs text-ink-muted">Giá thuê niêm yết</dt>
          <dd className="m-0 text-[15px] font-extrabold text-primary">
            {formatVnd(room.price, '/tháng')}
          </dd>
        </div>
      </dl>

      <div>
        <p className="m-0 mb-1 text-xs font-bold uppercase tracking-[0.04em] text-ink-muted">
          Đơn giá đang áp dụng
        </p>
        <PriceRow
          label="Điện"
          lastPeriod={lastReadingPeriod.Electricity}
          price={pricing.electricity}
          unit="kWh"
        />
        <PriceRow
          label="Nước"
          lastPeriod={lastReadingPeriod.Water}
          price={pricing.water}
          unit="m³"
        />
        <PriceRow label="Phí dịch vụ" price={pricing.service} unit="tháng" />
      </div>

      <div>
        <p className="m-0 mb-2 text-xs font-bold uppercase tracking-[0.04em] text-ink-muted">
          Nội thất &amp; tiện ích
        </p>
        {room.amenities.length === 0 ? (
          <p className="m-0 text-[13px] text-ink-muted">Phòng thô, chưa có nội thất.</p>
        ) : (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {room.amenities.map((label) => {
              const Icon = amenityIconByLabel(label);
              return (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-[12.5px] text-ink"
                >
                  {Icon ? (
                    <Icon aria-hidden="true" className="size-3.5 text-sand" strokeWidth={1.9} />
                  ) : null}
                  {label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {room.note ? (
        <div>
          <p className="m-0 mb-1 text-xs font-bold uppercase tracking-[0.04em] text-ink-muted">
            Ghi chú nội bộ
          </p>
          <p className="m-0 text-[13px] leading-relaxed text-ink">{room.note}</p>
        </div>
      ) : null}
    </SectionCard>
  );
}
