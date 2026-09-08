'use client';

import { Gauge, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { InvoicesTab } from '@/features/workspace/components/billing/InvoicesTab';
import { UtilityReadingsTab } from '@/features/workspace/components/billing/UtilityReadingsTab';
import type { PropertyListItem } from '@/features/workspace/types/property';
import { cn } from '@/utils/cn';

type BillingTab = 'readings' | 'invoices';

const TABS: ReadonlyArray<{ value: BillingTab; label: string; Icon: typeof Gauge }> = [
  { value: 'readings', label: 'Ghi điện nước', Icon: Gauge },
  { value: 'invoices', label: 'Hóa đơn', Icon: ReceiptText },
];

/**
 * B12 — điện nước và hóa đơn.
 *
 * Hai việc nằm chung **một màn** vì chúng là một chuỗi liên tục trong `USER_FLOWS.md`: ghi chỉ
 * số cuối tháng rồi xuất hóa đơn ngay từ chính những số vừa ghi. Tách thành hai route sẽ bắt
 * chủ trọ đi vòng giữa hai trang cho một lần chốt sổ.
 */
export function BillingPage({
  sellerId,
  properties,
  focusedRoomId,
}: {
  sellerId: string;
  properties: readonly PropertyListItem[];
  /**
   * Phòng cần xem hóa đơn, đọc từ `?phong=` — link đi từ màn chi tiết phòng (B9).
   *
   * Có nó thì mở thẳng tab Hóa đơn: người bấm "Xem hóa đơn của phòng" mà rơi vào tab ghi chỉ
   * số sẽ tưởng link hỏng.
   */
  focusedRoomId?: string;
}) {
  const [tab, setTab] = useState<BillingTab>(focusedRoomId ? 'invoices' : 'readings');

  return (
    <main className="flex flex-col gap-5 p-4 md:p-6">
      <header>
        <p className="m-0 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
          Quản lý vận hành
        </p>
        <h1 className="m-0 mt-1.5 text-[22px] font-extrabold text-ink md:text-[26px]">
          Điện nước &amp; Hóa đơn
        </h1>
        <p className="m-0 mt-1 text-[13px] leading-relaxed text-ink-muted">
          Ghi chỉ số cuối kỳ, xuất hóa đơn kèm mã VietQR rồi ghi nhận tiền đã thu.
        </p>
      </header>

      <div
        aria-label="Chọn phần việc"
        className="flex w-full gap-1 rounded-sm border border-line bg-surface p-1 sm:w-auto sm:self-start"
        role="tablist"
      >
        {TABS.map((item) => {
          const isSelected = tab === item.value;
          return (
            <button
              key={item.value}
              aria-selected={isSelected}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-2 text-[13.5px] transition-colors sm:flex-none',
                isSelected
                  ? 'bg-cream font-bold text-primary'
                  : 'font-medium text-ink-muted hover:bg-canvas',
              )}
              onClick={() => setTab(item.value)}
              role="tab"
              type="button"
            >
              <item.Icon aria-hidden="true" className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'readings' ? (
        <UtilityReadingsTab properties={properties} sellerId={sellerId} />
      ) : (
        <InvoicesTab focusedRoomId={focusedRoomId} properties={properties} sellerId={sellerId} />
      )}
    </main>
  );
}
