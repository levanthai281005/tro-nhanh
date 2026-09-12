import { Droplets, Gauge, Zap } from 'lucide-react';
import Link from 'next/link';
import { SectionCard } from '@/features/workspace/components/property-detail/SectionCard';
import type { RoomOverview, RoomReadingEntry } from '@/features/workspace/types/roomOverview';
import { ROOM_OVERVIEW_READING_LIMIT } from '@/features/workspace/types/roomOverview';
import { formatPeriod } from '@/features/workspace/utils/period';
import { formatVnd } from '@/utils/formatVnd';

function ReadingLine({
  entry,
  unit,
  Icon,
}: {
  entry: RoomReadingEntry | null;
  unit: string;
  Icon: typeof Zap;
}) {
  if (!entry) {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
        <Icon aria-hidden="true" className="size-3.5" />
        Chưa ghi
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-ink">
      <Icon aria-hidden="true" className="size-3.5 text-sand" />
      {entry.previousReading} → {entry.currentReading} ({entry.consumption} {unit}) ·{' '}
      <strong className="font-bold">{formatVnd(entry.amount)}</strong>
    </span>
  );
}

/**
 * Chỉ số điện nước vài kỳ gần nhất.
 *
 * Có nhãn "chưa lên hóa đơn" vì đó là **việc còn dang dở** chứ không phải trạng thái trung
 * tính: chủ trọ ghi số rồi quên xuất hóa đơn là mất tiền của chính họ.
 */
export function RoomUtilitySection({ overview }: { overview: RoomOverview }) {
  const { recentReadings, room } = overview;

  return (
    <SectionCard
      description={`Tối đa ${ROOM_OVERVIEW_READING_LIMIT} kỳ gần nhất. Ghi chỉ số ở màn điện nước.`}
      footer={
        <Link
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/chu-tro/hoa-don"
        >
          <Gauge aria-hidden="true" className="size-4" />
          Ghi chỉ số điện nước
        </Link>
      }
      title="Chỉ số điện nước"
    >
      {recentReadings.length === 0 ? (
        <p className="m-0 text-[13px] text-ink-muted">
          Phòng {room.roomCode} chưa ghi chỉ số kỳ nào.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {recentReadings.map((period) => {
            const isInvoiced =
              (period.electricity?.isInvoiced ?? false) || (period.water?.isInvoiced ?? false);

            return (
              <li
                key={period.period}
                className="flex flex-col gap-1.5 rounded-sm border border-line bg-canvas px-3.5 py-2.5"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[13.5px] font-bold text-ink">
                    {formatPeriod(period.period)}
                  </strong>
                  {isInvoiced ? (
                    <span className="text-[11.5px] font-semibold text-success">Đã lên hóa đơn</span>
                  ) : (
                    <span className="text-[11.5px] font-semibold text-warning">
                      Chưa lên hóa đơn
                    </span>
                  )}
                </span>
                <ReadingLine Icon={Zap} entry={period.electricity} unit="kWh" />
                <ReadingLine Icon={Droplets} entry={period.water} unit="m³" />
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
