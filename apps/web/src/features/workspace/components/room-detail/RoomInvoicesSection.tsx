import { ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/features/workspace/components/property-detail/SectionCard';
import type { RoomOverview } from '@/features/workspace/types/roomOverview';
import { ROOM_OVERVIEW_INVOICE_LIMIT } from '@/features/workspace/types/roomOverview';
import { formatPeriod } from '@/features/workspace/utils/period';
import { formatVnDate } from '@/utils/formatVnDate';
import { formatVnd } from '@/utils/formatVnd';

/**
 * Hóa đơn gần đây của phòng — `SCREENS_WORKSPACE.md` viết đúng chữ "gần đây".
 *
 * Chỉ đọc. `status`, `paidAmount`, `remainingAmount` đều lấy nguyên từ service (`toListItem`
 * → `deriveInvoiceStatus`), **không tính lại ở đây**. Nếu màn này tự suy trạng thái thì cùng
 * một hóa đơn có thể hiện `Quá hạn` ở B12 và `Thu một phần` ở đây — đây là màn tiền, hai chỗ
 * nói ngược nhau là mất niềm tin vào cả hệ thống.
 */
export function RoomInvoicesSection({ overview }: { overview: RoomOverview }) {
  const { recentInvoices, room } = overview;

  return (
    <SectionCard
      description={`Tối đa ${ROOM_OVERVIEW_INVOICE_LIMIT} kỳ gần nhất. Tạo hóa đơn và ghi nhận thu ở màn hóa đơn.`}
      footer={
        <Link
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
          href={`/chu-tro/hoa-don?phong=${room.id}`}
        >
          <ReceiptText aria-hidden="true" className="size-4" />
          Xem hóa đơn của phòng
        </Link>
      }
      title="Hóa đơn gần đây"
    >
      {recentInvoices.length === 0 ? (
        <p className="m-0 text-[13px] text-ink-muted">Phòng chưa có hóa đơn nào.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {recentInvoices.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-sm border border-line bg-canvas px-3.5 py-2.5"
            >
              <span className="min-w-0">
                <strong className="text-[13.5px] font-bold text-ink">
                  {formatPeriod(invoice.period)}
                </strong>
                <span className="mt-0.5 block text-[12.5px] text-ink-muted">
                  {formatVnd(invoice.totalAmount)} · hạn {formatVnDate(invoice.dueDate)}
                  {invoice.remainingAmount > 0
                    ? ` · còn thiếu ${formatVnd(invoice.remainingAmount)}`
                    : ''}
                </span>
              </span>
              <Badge kind="invoice" status={invoice.status} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
