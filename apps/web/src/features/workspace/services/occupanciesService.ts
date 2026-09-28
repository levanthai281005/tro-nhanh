import { MOCK_RENTER_ACCOUNTS } from '@/features/workspace/constants/mockOccupancies';
import {
  createLocalId,
  findOccupancy,
  findRoom,
  listOccupancies,
  saveOccupancy,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type {
  AddOccupancyInput,
  Occupancy,
  RenterLookupResult,
} from '@/features/workspace/types/occupancy';
import { isActiveOccupancy } from '@/features/workspace/types/occupancy';

export interface OccupanciesResult {
  /** Đang ở — mới nhất trước. */
  active: readonly Occupancy[];
  /** Đã kết thúc — lịch sử của phòng. */
  past: readonly Occupancy[];
}

/**
 * Trạng thái người ở của phòng sau một thao tác ghi.
 *
 * Mutation trả về **cả danh sách** chứ không phải bản ghi vừa sửa: đổi người đại diện chạm
 * **hai** bản ghi (người cũ mất vai trò, người mới nhận), nên nếu chỉ ghi bản ghi trả về vào
 * cache thì màn hình hiện hai người cùng làm đại diện cho tới lần refetch sau.
 */
function snapshot(roomId: string): OccupanciesResult {
  const all = listOccupancies(roomId);
  return {
    active: all.filter((item) => isActiveOccupancy(item)),
    past: all.filter((item) => !isActiveOccupancy(item)),
  };
}

// TODO: nối API thật khi có endpoint thật: GET /management/rooms/{id}/occupancies.
export async function getOccupancies(roomId: string): Promise<OccupanciesResult> {
  await waitForMockRequest();
  return snapshot(roomId);
}

/**
 * Tra tài khoản Renter theo **số điện thoại**.
 *
 * SĐT là định danh duy nhất toàn hệ thống (BR-016). Bản prototype tra bằng email — sai với
 * nghiệp vụ đã chốt, và email lại là trường **tùy chọn** nên phần lớn người ở không có.
 */
// TODO: nối API thật khi có endpoint thật: GET /management/occupancies/lookup?phone=…
export async function lookupRenterByPhone(phoneNumber: string): Promise<RenterLookupResult> {
  await waitForMockRequest();

  const normalized = phoneNumber.trim();
  const account = MOCK_RENTER_ACCOUNTS.find((item) => item.phoneNumber === normalized);
  return account
    ? { userId: account.userId, fullName: account.fullName }
    : { userId: null, fullName: null };
}

/**
 * Thêm người ở vào phòng — Module 7, BR-029.
 *
 * Gắn tài khoản thì `linkStatus` **luôn** bắt đầu ở `Pending`; người được gắn phải tự xác nhận
 * mới thành `Confirmed`. Không có nhánh nào cho phép chủ trọ đặt thẳng `Confirmed`: nếu có,
 * cửa gian lận "gắn tài khoản chim mồi để mở quyền đánh giá" mở ra ngay, và người thật thì bị
 * gắn vào phòng mà không biết.
 */
// TODO: nối API thật khi có endpoint thật: POST /management/rooms/{id}/occupancies.
export async function addOccupancy(input: AddOccupancyInput): Promise<OccupanciesResult> {
  await waitForMockRequest();

  const room = findRoom(input.roomId);
  if (!room) throw new Error('Không tìm thấy phòng.');

  const phoneNumber = input.phoneNumber.trim();
  const isDuplicate = listOccupancies(input.roomId).some(
    (item) => isActiveOccupancy(item) && item.phoneNumber === phoneNumber,
  );
  if (isDuplicate) {
    throw new Error(`Số điện thoại ${phoneNumber} đã có trong danh sách người ở của phòng này.`);
  }

  // Chỉ một người đại diện hợp đồng mỗi phòng (BR-006) — người mới lên thì người cũ nhường.
  if (input.isContractRepresentative) {
    clearContractRepresentative(input.roomId);
  }

  const occupancy: Occupancy = {
    id: createLocalId(),
    roomId: input.roomId,
    userId: input.linkedUserId,
    linkStatus: input.linkedUserId === null ? null : 'Pending',
    fullName: input.fullName.trim(),
    phoneNumber,
    startDate: input.startDate,
    endDate: null,
    occupantCount: input.occupantCount,
    note: input.note.trim() || null,
    isContractRepresentative: input.isContractRepresentative,
    createdAt: new Date().toISOString(),
  };

  saveOccupancy(occupancy);
  return snapshot(input.roomId);
}

/**
 * Kết thúc đợt ở — đặt `endDate`, bản ghi chuyển sang lịch sử.
 *
 * **Không xóa.** Lịch sử ở là bằng chứng cho quyền viết đánh giá (BR-022) và là dấu vết vận
 * hành của phòng.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /management/occupancies/{id}.
export async function endOccupancy(
  occupancyId: string,
  endDate: string,
): Promise<OccupanciesResult> {
  await waitForMockRequest();

  const current = findOccupancy(occupancyId);
  if (!current) throw new Error('Không tìm thấy người ở này.');
  if (endDate < current.startDate) {
    throw new Error('Ngày kết thúc không được trước ngày bắt đầu ở.');
  }

  const updated: Occupancy = {
    ...current,
    endDate,
    // Người đã rời đi thì thôi đứng tên hợp đồng của phòng.
    isContractRepresentative: false,
  };

  saveOccupancy(updated);
  return snapshot(current.roomId);
}

/** Chỉ định người đứng tên hợp đồng. Mỗi phòng tối đa một người (BR-006). */
// TODO: nối API thật khi có endpoint thật: PATCH /management/occupancies/{id}.
export async function setContractRepresentative(occupancyId: string): Promise<OccupanciesResult> {
  await waitForMockRequest();

  const current = findOccupancy(occupancyId);
  if (!current) throw new Error('Không tìm thấy người ở này.');
  if (!isActiveOccupancy(current)) {
    throw new Error('Người đã kết thúc ở không thể đứng tên hợp đồng.');
  }

  clearContractRepresentative(current.roomId);

  saveOccupancy({ ...current, isContractRepresentative: true });
  return snapshot(current.roomId);
}

/**
 * Gửi lại lời mời liên kết cho người ở chưa gắn tài khoản, hoặc đã từ chối.
 *
 * Chủ trọ **không** tự xác nhận thay được — chỉ gửi lại lời mời, trạng thái về `Pending`.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /management/occupancies/{id}.
export async function inviteOccupantLink(occupancyId: string): Promise<OccupanciesResult> {
  await waitForMockRequest();

  const current = findOccupancy(occupancyId);
  if (!current) throw new Error('Không tìm thấy người ở này.');

  const account = MOCK_RENTER_ACCOUNTS.find(
    (item) => item.phoneNumber === current.phoneNumber.trim(),
  );
  if (!account) {
    throw new Error(
      `Số ${current.phoneNumber} chưa có tài khoản Trọ Nhanh. Hãy mời họ đăng ký trước.`,
    );
  }

  saveOccupancy({ ...current, userId: account.userId, linkStatus: 'Pending' });
  return snapshot(current.roomId);
}

function clearContractRepresentative(roomId: string): void {
  for (const item of listOccupancies(roomId)) {
    if (item.isContractRepresentative) {
      saveOccupancy({ ...item, isContractRepresentative: false });
    }
  }
}
