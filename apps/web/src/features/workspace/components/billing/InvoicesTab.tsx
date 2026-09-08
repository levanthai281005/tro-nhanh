'use client';

import type { InvoiceStatus } from '@tronhanh/schemas';
import { Plus, ReceiptText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppSelect } from '@/components/ui/AppSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { FieldBox } from '@/components/ui/FormField';
import { Skeleton } from '@/components/ui/Skeleton';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import { CreateInvoiceDialog } from '@/features/workspace/components/billing/CreateInvoiceDialog';
import { InvoiceCard } from '@/features/workspace/components/billing/InvoiceCard';
import { InvoiceDetailModal } from '@/features/workspace/components/billing/InvoiceDetailModal';
import { InvoiceSummary } from '@/features/workspace/components/billing/InvoiceSummary';
import { useInvoices } from '@/features/workspace/hooks/useInvoices';
import type { InvoiceListItem } from '@/features/workspace/types/invoice';
import type { PropertyListItem } from '@/features/workspace/types/property';
import { currentPeriod, formatPeriod } from '@/features/workspace/utils/period';
import { cn } from '@/utils/cn';

type StatusFilter = InvoiceStatus | 'all';

const STATUS_CHIPS: ReadonlyArray<{ label: string; value: StatusFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa thu', value: 'Unpaid' },
  { label: 'Thu một phần', value: 'PartiallyPaid' },
  { label: 'Quá hạn', value: 'Overdue' },
  { label: 'Đã thu đủ', value: 'Paid' },
];

const ALL = 'all';

export function InvoicesTab({
  sellerId,
  properties,
  focusedRoomId,
}: {
  sellerId: string;
  properties: readonly PropertyListItem[];
  focusedRoomId?: string;
}) {
  // Lọc theo phòng là trạng thái **gỡ được**, không phải cố định theo URL: người dùng tới đây
  // từ một phòng nhưng thường muốn xem tiếp các phòng khác mà không phải bấm quay lại.
  const [roomFilter, setRoomFilter] = useState<string | null>(focusedRoomId ?? null);
  const [propertyFilter, setPropertyFilter] = useState<string>(ALL);
  const [periodFilter, setPeriodFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [isCreating, setIsCreating] = useState(false);
  const [openedId, setOpenedId] = useState<string | null>(null);

  const { data, isPending, isError } = useInvoices(sellerId);

  const invoices = useMemo(() => data?.items ?? [], [data]);

  /*
   * Tập đã lọc **trừ trạng thái** — nguồn đếm cho các chip trạng thái.
   *
   * Đếm trên toàn bộ hóa đơn thì chip ghi "Tất cả 4" trong khi danh sách bên dưới chỉ có một
   * dòng, và người đọc không có cách nào biết vì sao. Chip phải đếm trong đúng phạm vi mà
   * người dùng đang đứng; riêng bộ lọc trạng thái thì không tự đếm chính nó, nếu không chọn
   * một chip xong mọi chip khác sẽ về 0.
   */
  const inScope = useMemo(
    () =>
      invoices.filter(
        (item) =>
          (roomFilter === null || item.roomId === roomFilter) &&
          (propertyFilter === ALL || item.propertyId === propertyFilter) &&
          (periodFilter === ALL || item.period === periodFilter),
      ),
    [invoices, roomFilter, propertyFilter, periodFilter],
  );

  const visible = useMemo(
    () => inScope.filter((item) => statusFilter === ALL || item.status === statusFilter),
    [inScope, statusFilter],
  );

  const focusedRoomCode = roomFilter
    ? (invoices.find((item) => item.roomId === roomFilter)?.roomCode ?? null)
    : null;

  // Tổng phải bám **tập đang lọc**. Dùng `data.totals` (tổng của mọi hóa đơn) là để hai vùng
  // trên cùng một màn nói về hai tập khác nhau mà không có gì báo cho người đọc biết.
  const totals = useMemo(() => sumInvoices(visible), [visible]);

  // Đọc lại từ danh sách thay vì giữ nguyên object đã bấm: sau khi ghi nhận thu, cache có bản
  // mới còn object cũ thì không — modal sẽ hiện số tiền và trạng thái của trước lúc thu.
  const opened = openedId ? (invoices.find((item) => item.id === openedId) ?? null) : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:max-w-[520px]">
          <FieldBox>
            <AppSelect
              onChange={setPropertyFilter}
              options={[
                { value: ALL, label: 'Tất cả khu trọ' },
                ...properties.map((item) => ({ value: item.id, label: item.name })),
              ]}
              value={propertyFilter}
            />
          </FieldBox>
          <FieldBox>
            <AppSelect
              onChange={setPeriodFilter}
              options={[
                { value: ALL, label: 'Tất cả kỳ' },
                ...(data?.periods ?? []).map((item) => ({
                  value: item,
                  label: formatPeriod(item),
                })),
              ]}
              value={periodFilter}
            />
          </FieldBox>
        </div>

        <WriteGuardButton
          icon={<Plus aria-hidden="true" className="size-4" />}
          onClick={() => setIsCreating(true)}
          surface="workspace"
          variant="primary"
        >
          Tạo hóa đơn
        </WriteGuardButton>
      </div>

      {roomFilter !== null ? (
        <p className="m-0 flex flex-wrap items-center gap-2 rounded-sm border border-line bg-cream px-3.5 py-2.5 text-[13px] text-ink">
          Đang xem hóa đơn của phòng{' '}
          <strong className="font-bold">{focusedRoomCode ?? 'đã chọn'}</strong>
          <button
            className="font-semibold text-primary underline transition-colors hover:text-primary-hover"
            onClick={() => setRoomFilter(null)}
            type="button"
          >
            Bỏ lọc
          </button>
        </p>
      ) : null}

      <InvoiceSummary totals={totals} />

      <div className="flex flex-wrap gap-1.5">
        {STATUS_CHIPS.map((chip) => {
          const isSelected = statusFilter === chip.value;
          const count =
            chip.value === ALL
              ? inScope.length
              : inScope.filter((item) => item.status === chip.value).length;

          return (
            <button
              key={chip.value}
              className={cn(
                'rounded-full border px-3.5 py-[7px] text-[12.5px] transition-colors',
                isSelected
                  ? 'border-primary bg-primary font-bold text-surface'
                  : 'border-line bg-surface font-medium text-ink hover:border-sand',
              )}
              onClick={() => setStatusFilter(chip.value)}
              type="button"
            >
              {chip.label}
              <span className={cn('ml-1.5', isSelected ? 'text-surface/80' : 'text-ink-muted')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isPending ? (
        <Skeleton className="h-[168px] rounded-md" count={3} />
      ) : isError ? (
        <EmptyState description="Vui lòng tải lại trang." title="Chưa tải được danh sách hóa đơn" />
      ) : visible.length === 0 ? (
        <EmptyState
          action={
            invoices.length === 0 ? (
              <WriteGuardButton
                onClick={() => setIsCreating(true)}
                surface="workspace"
                variant="primary"
              >
                Tạo hóa đơn đầu tiên
              </WriteGuardButton>
            ) : undefined
          }
          description={
            inScope.length === 0
              ? 'Hóa đơn được dựng từ tiền thuê trên hợp đồng cộng với chỉ số điện nước đã ghi của kỳ đó.'
              : 'Không có hóa đơn nào khớp bộ lọc đang chọn.'
          }
          icon={<ReceiptText aria-hidden="true" className="size-9 text-ink-muted" />}
          title={inScope.length === 0 ? 'Chưa có hóa đơn nào' : 'Không có hóa đơn phù hợp'}
        />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 xl:grid-cols-2">
          {visible.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onOpen={(item) => setOpenedId(item.id)}
            />
          ))}
        </ul>
      )}

      {isCreating ? (
        <CreateInvoiceDialog
          defaultPeriod={periodFilter === ALL ? currentPeriod() : periodFilter}
          onClose={() => setIsCreating(false)}
          onCreated={(invoice) => {
            setIsCreating(false);
            setOpenedId(invoice.id);
          }}
          sellerId={sellerId}
        />
      ) : null}

      {opened ? (
        <InvoiceDetailModal
          invoice={opened}
          onClose={() => setOpenedId(null)}
          sellerId={sellerId}
        />
      ) : null}
    </section>
  );
}

function sumInvoices(items: readonly InvoiceListItem[]) {
  const overdue = items.filter((item) => item.status === 'Overdue');

  return {
    invoiceCount: items.length,
    totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
    paidAmount: items.reduce((sum, item) => sum + item.paidAmount, 0),
    remainingAmount: items.reduce((sum, item) => sum + item.remainingAmount, 0),
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((sum, item) => sum + item.remainingAmount, 0),
  };
}
