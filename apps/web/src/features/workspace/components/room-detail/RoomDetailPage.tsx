'use client';

import { AlertTriangle, ChevronLeft, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RoomContractSection } from '@/features/workspace/components/room-detail/RoomContractSection';
import { RoomInfoSection } from '@/features/workspace/components/room-detail/RoomInfoSection';
import { RoomInvoicesSection } from '@/features/workspace/components/room-detail/RoomInvoicesSection';
import { RoomOccupantsSection } from '@/features/workspace/components/room-detail/RoomOccupantsSection';
import { RoomUtilitySection } from '@/features/workspace/components/room-detail/RoomUtilitySection';
import { RoomFormDialog } from '@/features/workspace/components/rooms/RoomFormDialog';
import { useRoomOverview } from '@/features/workspace/hooks/useRoomOverview';
import { useUpdateRoom } from '@/features/workspace/hooks/useRooms';
import { formatVnd } from '@/utils/formatVnd';

/**
 * B9 — chi tiết phòng.
 *
 * Là **trang tổng hợp**, không phải nơi thao tác: người ở sửa ở B10, hợp đồng ở B11, hóa đơn
 * và chỉ số ở B12. Ngoại lệ duy nhất là sửa thông tin phòng, vì nó không thuộc màn nào khác.
 *
 * Lý do không nhân bản thao tác: cùng một dữ liệu có hai nơi ghi được là cách chắc chắn để
 * hai màn hiện hai con số khác nhau. Prototype gộp hết vào một drawer 4 tab **vì nó không có
 * màn nào khác để đi** — repo này thì có.
 */
export function RoomDetailPage({ roomId, sellerId }: { roomId: string; sellerId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isPending, isError } = useRoomOverview(roomId, sellerId);
  const updateRoom = useUpdateRoom(data?.propertyId ?? '', sellerId);

  if (isPending) {
    return (
      <main className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-[120px] rounded-md" count={4} />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="p-4 md:p-6">
        <EmptyState description="Vui lòng tải lại trang." title="Chưa tải được thông tin phòng" />
      </main>
    );
  }

  const { room, propertyId, propertyName, outstandingAmount, outstandingCount } = data;

  return (
    <main className="flex flex-col gap-4 p-4 md:p-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
        <Link
          className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary-hover"
          href={`/chu-tro/khu-tro/${propertyId}/phong`}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {propertyName}
        </Link>
        <span aria-hidden="true">/</span>
        <span>Phòng {room.roomCode}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[22px] font-extrabold text-ink md:text-[26px]">
          Phòng {room.roomCode}
        </h1>
        <Badge kind="room" status={room.status} />
        {room.hasActiveListing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-status-available-soft px-2.5 py-1 text-[11.5px] font-bold text-status-available">
            <Megaphone aria-hidden="true" className="size-3.5" />
            Có tin đang chạy
          </span>
        ) : null}
      </header>

      {/* Công nợ đặt trên cùng — ý hay giữ lại từ prototype. Đây là thứ chủ trọ cần thấy
          trước khi đọc bất cứ thứ gì khác về phòng. */}
      {outstandingAmount > 0 ? (
        <p className="m-0 flex items-center gap-2.5 rounded-md border border-error bg-error-soft px-4 py-3 text-[13.5px] font-bold text-error">
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
          Phòng còn nợ {formatVnd(outstandingAmount)} qua {outstandingCount} kỳ.
        </p>
      ) : null}

      {error ? (
        <p className="m-0 rounded-sm border border-error bg-error-soft px-4 py-3 text-[13px] font-semibold text-error">
          {error}
        </p>
      ) : null}

      <RoomInfoSection
        onEdit={() => {
          setError(null);
          setIsEditing(true);
        }}
        overview={data}
      />
      <RoomOccupantsSection overview={data} />
      <RoomContractSection overview={data} />
      <RoomInvoicesSection overview={data} />
      <RoomUtilitySection overview={data} />

      {isEditing ? (
        <RoomFormDialog
          isSaving={updateRoom.isPending}
          onClose={() => setIsEditing(false)}
          onSubmit={(input) => {
            setError(null);
            updateRoom.mutate(
              { roomId, input },
              {
                onSuccess: () => setIsEditing(false),
                onError: (cause) =>
                  setError(
                    cause instanceof Error ? cause.message : 'Chưa lưu được thông tin phòng.',
                  ),
              },
            );
          }}
          propertyId={propertyId}
          propertyName={propertyName}
          room={room}
          submitError={error}
        />
      ) : null}
    </main>
  );
}
