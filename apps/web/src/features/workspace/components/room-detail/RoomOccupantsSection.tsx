import { Users } from 'lucide-react';
import Link from 'next/link';
import { OccupantLinkBadge } from '@/features/workspace/components/occupancy/OccupantLinkBadge';
import { SectionCard } from '@/features/workspace/components/property-detail/SectionCard';
import type { RoomOverview } from '@/features/workspace/types/roomOverview';
import { formatVnDate } from '@/utils/formatVnDate';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Đã ở bao nhiêu ngày — con số prototype có và thật sự dùng được khi thương lượng gia hạn. */
function daysSince(isoDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(isoDate)) / MS_PER_DAY));
}

/**
 * Người ở hiện tại — **liệt kê đủ từng người**, không phải một người kèm con số.
 *
 * Một `Room` có nhiều `Occupancy` Active đồng thời (bạn cùng phòng, cả gia đình), mỗi người có
 * SĐT riêng và trạng thái liên kết tài khoản riêng (BR-029). Prototype lấy `find(o => o.isActive)`
 * rồi hiện "Số người ở: N" — gộp lại như vậy là mất đúng thứ chủ trọ cần khi phải gọi cho một
 * người cụ thể.
 */
export function RoomOccupantsSection({ overview }: { overview: RoomOverview }) {
  const { room } = overview;

  return (
    <SectionCard
      description="Thêm, kết thúc ở hay đổi người đại diện đều làm ở màn quản lý người ở."
      footer={
        <Link
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
          href={`/chu-tro/phong/${room.id}/nguoi-o`}
        >
          <Users aria-hidden="true" className="size-4" />
          Quản lý người ở
        </Link>
      }
      title={`Người ở hiện tại (${room.occupants.length})`}
    >
      {room.occupants.length === 0 ? (
        <p className="m-0 text-[13px] text-ink-muted">
          Phòng đang không có ai ở. Thêm người ở để lập hợp đồng và xuất hóa đơn.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {room.occupants.map((occupant) => (
            <li
              key={occupant.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-sm border border-line bg-canvas px-3.5 py-2.5"
            >
              <span className="min-w-0">
                <strong className="text-[13.5px] font-bold text-ink">{occupant.fullName}</strong>
                {occupant.isContractRepresentative ? (
                  <span className="ml-2 rounded-full bg-cream px-2 py-[1px] text-[11px] font-bold text-primary">
                    Đại diện hợp đồng
                  </span>
                ) : null}
                <span className="mt-0.5 block text-[12.5px] text-ink-muted">
                  {occupant.phoneNumber} · ở từ {formatVnDate(occupant.startDate)} (
                  {daysSince(occupant.startDate)} ngày)
                </span>
              </span>
              <OccupantLinkBadge linkStatus={occupant.linkStatus} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
