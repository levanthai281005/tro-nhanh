import { CONTRACT_EXPIRY_WARNING_DAYS } from '@/features/workspace/types/contract';
import { AlertTriangle, FileSignature } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/features/workspace/components/property-detail/SectionCard';
import type { RoomOverview } from '@/features/workspace/types/roomOverview';
import { formatVnDate } from '@/utils/formatVnDate';
import { formatVnd } from '@/utils/formatVnd';

/**
 * Hợp đồng đang hiệu lực của phòng — BR-006 cho phép tối đa một cái.
 *
 * Tiền thuê ở đây lấy từ **hợp đồng**, không phải giá niêm yết của phòng ở khối trên. Hai con
 * số có thể lệch nhau một cách hợp lệ (phòng tăng giá sau ngày ký), và đó chính là lý do phải
 * hiện cả hai kèm nhãn rõ ràng thay vì chọn một.
 */
export function RoomContractSection({ overview }: { overview: RoomOverview }) {
  const { activeContract, pastContractCount } = overview;

  /*
   * Hợp đồng `Active` mà đã qua `endDate` là chuyện có thật, không phải dữ liệu hỏng: BR-006
   * giao việc chuyển sang `Expired` cho một job backend, và giữa hai lần job chạy thì trạng
   * thái vẫn là `Active`.
   *
   * Phải gắn cờ riêng cho ca này. Chỉ kiểm "sắp hết hạn" (`daysRemaining` từ 0 tới 30) sẽ bỏ
   * lọt đúng hợp đồng đáng lo nhất — cái đã quá hạn — vì `daysRemaining` của nó âm.
   */
  const isExpired = activeContract !== null && activeContract.daysRemaining < 0;
  const isExpiringSoon =
    activeContract !== null &&
    activeContract.daysRemaining >= 0 &&
    activeContract.daysRemaining <= CONTRACT_EXPIRY_WARNING_DAYS;

  return (
    <SectionCard
      footer={
        <Link
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/chu-tro/hop-dong"
        >
          <FileSignature aria-hidden="true" className="size-4" />
          {activeContract ? 'Mở màn hợp đồng' : 'Lập hợp đồng'}
        </Link>
      }
      title="Hợp đồng"
    >
      {activeContract === null ? (
        <p className="m-0 text-[13px] leading-relaxed text-ink-muted">
          Phòng chưa có hợp đồng đang hiệu lực. Chưa có hợp đồng thì{' '}
          <strong className="text-ink">chưa xuất được hóa đơn</strong> — hóa đơn gắn với hợp đồng
          theo BR-006.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13.5px] font-bold text-ink">
              {formatVnDate(activeContract.startDate)} → {formatVnDate(activeContract.endDate)}
            </span>
            <Badge kind="contract" status={activeContract.status} />
          </div>

          {isExpired ? (
            <p className="m-0 flex items-center gap-2 rounded-sm border border-error bg-error-soft px-3.5 py-2.5 text-[13px] font-semibold text-error">
              <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
              Đã qua ngày kết thúc {Math.abs(activeContract.daysRemaining)} ngày mà chưa gia hạn hay
              chấm dứt.
            </p>
          ) : isExpiringSoon ? (
            <p className="m-0 flex items-center gap-2 rounded-sm border border-warning bg-warning-soft px-3.5 py-2.5 text-[13px] font-semibold text-warning">
              <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
              Còn {activeContract.daysRemaining} ngày là hết hạn.
            </p>
          ) : null}

          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="m-0 text-xs text-ink-muted">Người đứng tên</dt>
              <dd className="m-0 text-[13.5px] font-bold text-ink">
                {activeContract.occupantName}
              </dd>
            </div>
            <div>
              <dt className="m-0 text-xs text-ink-muted">Tiền thuê theo hợp đồng</dt>
              <dd className="m-0 text-[13.5px] font-bold text-ink">
                {formatVnd(activeContract.rentPrice)}
              </dd>
            </div>
            <div>
              <dt className="m-0 text-xs text-ink-muted">Tiền cọc đang giữ</dt>
              <dd className="m-0 text-[13.5px] font-bold text-ink">
                {formatVnd(activeContract.deposit)}
              </dd>
            </div>
          </dl>
        </>
      )}

      {pastContractCount > 0 ? (
        <p className="m-0 text-[12.5px] text-ink-muted">
          Phòng còn {pastContractCount} hợp đồng đã kết thúc.
        </p>
      ) : null}
    </SectionCard>
  );
}
