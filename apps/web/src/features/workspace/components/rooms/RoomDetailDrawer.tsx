'use client';

import { ALLOWED_ROOM_STATUS_TRANSITIONS, type RoomStatus } from '@tronhanh/schemas';
import { FileSignature, Megaphone, Pencil, Trash2, Users, X } from 'lucide-react';
import Link from 'next/link';
import { amenityIconByLabel } from '@/constants/amenities';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WriteGuardButton } from '@/features/session/components/WriteGuardButton';
import { OccupantLinkBadge } from '@/features/workspace/components/occupancy/OccupantLinkBadge';
import { ROOM_STATUS_LABELS } from '@/features/workspace/constants/roomStatus';
import type { RoomListItem } from '@/features/workspace/types/room';
import { formatVnd } from '@/utils/formatVnd';

interface RoomDetailDrawerProps {
  room: RoomListItem;
  propertyName: string;
  onClose: () => void;
  onEdit: (room: RoomListItem) => void;
  onDelete: (room: RoomListItem) => void;
  onChangeStatus: (room: RoomListItem, status: RoomStatus) => void;
}

/**
 * Chi tiết phòng — bản gọn.
 *
 * Chỉ hiển thị thông tin phòng và các thao tác thuộc B8. Tab vận hành của prototype
 * (`RoomDetailTabs`: chỉ số điện nước, hóa đơn, lịch sử ở) thuộc **B9/B10**, giai đoạn V1 —
 * port sang đây sẽ kéo theo cả bốn entity chưa có màn quản lý.
 */
export function RoomDetailDrawer({
  room,
  propertyName,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}: RoomDetailDrawerProps) {
  const nextStatuses = ALLOWED_ROOM_STATUS_TRANSITIONS[room.status];

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center bg-ink/45 md:items-center md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-label={`Chi tiết phòng ${room.roomCode}`}
        className="flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-lg bg-surface shadow-lg md:max-h-[88vh] md:rounded-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6 md:py-5">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-lg font-extrabold text-ink md:text-xl">
              Phòng {room.roomCode}
            </h2>
            <p className="m-0 mt-0.5 truncate text-[13px] text-ink-muted">{propertyName}</p>
          </div>
          <button
            aria-label="Đóng"
            className="flex shrink-0 items-center rounded-sm p-1.5 text-ink-muted transition-colors hover:bg-cream"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge kind="room" status={room.status} />
            {room.hasActiveListing ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-available-soft px-2.5 py-1 text-[11.5px] font-bold text-status-available">
                <Megaphone aria-hidden="true" className="size-3" />
                Có tin đang chạy
              </span>
            ) : null}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
            <DetailRow label="Tầng" value={String(room.floor)} />
            <DetailRow label="Diện tích" value={`${room.area} m²`} />
            <DetailRow label="Giá thuê" value={formatVnd(room.price, '/tháng')} />
            <DetailRow
              label="Đơn giá điện"
              value={
                room.electricityPrice === null
                  ? 'Theo giá khu'
                  : formatVnd(room.electricityPrice, '/kWh')
              }
            />
          </dl>

          <div>
            <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
              Nội thất &amp; tiện ích
            </p>
            {room.amenities.length === 0 ? (
              // Nói rõ "phòng thô" chứ không để trống: mảng rỗng là dữ liệu thật, còn khoảng
              // trắng thì người đọc hiểu thành "chưa kịp khai".
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

          {room.occupants.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Người ở hiện tại ({room.occupants.length})
                </p>
                <Link
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
                  href={`/chu-tro/phong/${room.id}/nguoi-o`}
                >
                  <Users aria-hidden="true" className="size-3.5" />
                  Quản lý
                </Link>
              </div>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {room.occupants.map((occupant) => (
                  <li
                    key={occupant.id}
                    className="flex items-center justify-between gap-3 rounded-sm border border-line bg-canvas px-3.5 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">
                        {occupant.fullName}
                      </span>
                      <span className="block text-[13px] text-ink-muted">
                        {occupant.phoneNumber}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {occupant.isContractRepresentative ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-primary">
                          <FileSignature aria-hidden="true" className="size-3" />
                          Đại diện hợp đồng
                        </span>
                      ) : null}
                      <OccupantLinkBadge linkStatus={occupant.linkStatus} />
                    </span>
                  </li>
                ))}
              </ul>
              {/* Một phòng có nhiều Occupancy Active đồng thời, nhưng Contract chỉ gắn MỘT
                  người đại diện (BR-006). Nói rõ khi chưa ai được chỉ định, vì đó là việc còn
                  thiếu chứ không phải dữ liệu hỏng. */}
              {room.occupants.every((occupant) => !occupant.isContractRepresentative) ? (
                <p className="m-0 mt-2 text-xs leading-relaxed text-ink-muted">
                  Chưa có người đại diện đứng tên hợp đồng cho phòng này.
                </p>
              ) : null}
            </div>
          ) : null}

          {room.note ? (
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Ghi chú nội bộ
              </p>
              <p className="m-0 mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                {room.note}
              </p>
            </div>
          ) : null}

          <div>
            <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
              Chuyển trạng thái
            </p>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <WriteGuardButton
                  key={status}
                  onClick={() => onChangeStatus(room, status)}
                  size="sm"
                  surface="workspace"
                  variant="outline"
                >
                  {ROOM_STATUS_LABELS[status]}
                </WriteGuardButton>
              ))}
            </div>
            {/* BR-027 — chuyển sang `Rented` sẽ kéo theo tin đăng gắn với phòng. Nói trước
                thay vì để chủ trọ phát hiện tin biến mất khỏi trang tìm phòng. */}
            {room.hasActiveListing && nextStatuses.includes('Rented') ? (
              <p className="m-0 mt-2 text-xs leading-relaxed text-ink-muted">
                Chuyển sang <strong>Đang thuê</strong> sẽ tự đánh dấu tin đăng của phòng này là đã
                cho thuê.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line px-5 py-3.5 md:px-6">
          <WriteGuardButton
            icon={<Trash2 aria-hidden="true" className="size-4" />}
            onClick={() => onDelete(room)}
            size="sm"
            surface="workspace"
            title={
              room.hasActiveContract
                ? 'Phòng đang có hợp đồng hiệu lực nên chưa xóa được.'
                : undefined
            }
            variant="ghost"
          >
            Xóa phòng
          </WriteGuardButton>

          <div className="flex items-center gap-2">
            <Button onClick={onClose} size="sm" variant="ghost">
              Đóng
            </Button>
            <WriteGuardButton
              icon={<Pencil aria-hidden="true" className="size-3.5" />}
              onClick={() => onEdit(room)}
              size="sm"
              surface="workspace"
              variant="outline"
            >
              Sửa phòng
            </WriteGuardButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-bold text-ink">{value}</dd>
    </div>
  );
}
