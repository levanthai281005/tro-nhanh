import type {
  CreatePropertyInput,
  PropertiesResult,
  Property,
  PropertyListItem,
  UpdatePropertyInfoInput,
  UpdatePropertyPayoutInput,
  UpdatePropertyPricingInput,
} from '@/features/workspace/types/property';
import {
  createLocalId,
  findProperty,
  listProperties,
  listRooms,
  removeProperty,
  saveProperty,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';

function toListItem(property: Property): PropertyListItem {
  const rooms = listRooms(property.id);

  return {
    id: property.id,
    name: property.name,
    address: property.address,
    district: property.district,
    roomCount: rooms.length,
    availableCount: rooms.filter((room) => room.status === 'Available').length,
    depositedCount: rooms.filter((room) => room.status === 'Deposited').length,
    rentedCount: rooms.filter((room) => room.status === 'Rented').length,
    hiddenCount: rooms.filter((room) => room.status === 'Hidden').length,
    isPublicProfileEnabled: property.isPublicProfileEnabled,
    hasPayoutInfo: Boolean(property.bankAccountNumber && property.bankAccountName),
  };
}

// TODO: nối API thật khi có endpoint thật: GET /management/properties.
// Danh tính seller lấy từ session, không nhận từ client (BR-007).
export async function getProperties(sellerId: string | undefined): Promise<PropertiesResult> {
  await waitForMockRequest();
  if (!sellerId) return { items: [], totalRooms: 0, totalAvailable: 0 };

  const items = listProperties(sellerId).map(toListItem);

  return {
    items,
    totalRooms: items.reduce((sum, item) => sum + item.roomCount, 0),
    totalAvailable: items.reduce((sum, item) => sum + item.availableCount, 0),
  };
}

// TODO: nối API thật khi có endpoint thật: GET /management/properties/{id}.
export async function getPropertyById(propertyId: string): Promise<Property | null> {
  await waitForMockRequest();
  return findProperty(propertyId) ?? null;
}

/**
 * Tạo khu trọ.
 *
 * Cố ý chỉ hỏi ba thông tin nhận dạng. Đơn giá điện/nước/dịch vụ và tài khoản ngân hàng nhập ở
 * màn chi tiết khu (B7) — nơi có validate và xem trước mã VietQR. Nhồi hết vào đây thì bước
 * đầu tiên của người dùng mới thành một form dài, và họ sẽ điền số bừa cho xong.
 */
// TODO: nối API thật khi có endpoint thật: POST /management/properties.
export async function createProperty(
  sellerId: string,
  input: CreatePropertyInput,
): Promise<Property> {
  await waitForMockRequest();

  const timestamp = new Date().toISOString();
  const property: Property = {
    id: createLocalId(),
    sellerId,
    name: input.name.trim(),
    address: input.address.trim(),
    district: input.district.trim(),
    provinceCode: input.provinceCode,
    wardCode: input.wardCode,
    floorCount: null,
    note: null,
    bankName: null,
    bankAccountNumber: null,
    bankAccountName: null,
    isPublicProfileEnabled: false,
    publicSlug: null,
    avgRating: null,
    reviewCount: 0,
    // Mức phổ biến ở TP.HCM, chủ trọ sửa lại ở màn chi tiết khu. Để 0 thì hóa đơn đầu tiên ra
    // số sai mà không ai để ý.
    electricityPrice: 3500,
    waterPrice: 15000,
    servicePrice: 100000,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveProperty(property);
  return property;
}

/** Đọc bản ghi hiện tại rồi ghi đè phần được sửa. Ném lỗi tiếng Việt nếu khu không còn. */
function mutateProperty(propertyId: string, patch: Partial<Property>): Property {
  const current = findProperty(propertyId);
  if (!current) throw new Error('Không tìm thấy khu trọ.');

  const updated: Property = { ...current, ...patch, updatedAt: new Date().toISOString() };
  saveProperty(updated);
  return updated;
}

// TODO: nối API thật khi có endpoint thật: PUT /management/properties/{id}.
export async function updatePropertyInfo(
  propertyId: string,
  input: UpdatePropertyInfoInput,
): Promise<Property> {
  await waitForMockRequest();
  return mutateProperty(propertyId, {
    name: input.name.trim(),
    address: input.address.trim(),
    district: input.district.trim(),
    provinceCode: input.provinceCode,
    wardCode: input.wardCode,
    floorCount: input.floorCount,
    note: input.note?.trim() || null,
  });
}

// TODO: nối API thật khi có endpoint thật: PATCH /management/properties/{id}/settings.
export async function updatePropertyPricing(
  propertyId: string,
  input: UpdatePropertyPricingInput,
): Promise<Property> {
  await waitForMockRequest();
  return mutateProperty(propertyId, {
    electricityPrice: input.electricityPrice,
    waterPrice: input.waterPrice,
    servicePrice: input.servicePrice,
  });
}

// TODO: nối API thật khi có endpoint thật: PUT /management/properties/{id}.
export async function updatePropertyPayout(
  propertyId: string,
  input: UpdatePropertyPayoutInput,
): Promise<Property> {
  await waitForMockRequest();
  return mutateProperty(propertyId, {
    bankName: input.bankName?.trim() || null,
    bankAccountNumber: input.bankAccountNumber?.trim() || null,
    bankAccountName: input.bankAccountName?.trim() || null,
  });
}

/**
 * Bật/tắt hồ sơ khu công khai (BR-024).
 *
 * Tắt public **không xóa đánh giá** — review vẫn nằm trong DB, chỉ thôi hiển thị; bật lại là
 * hiện lại. `publicSlug` do backend sinh và bảo đảm unique; ở đây tạo tạm từ tên khu để bản
 * demo có đường dẫn xem trước.
 */
// TODO: nối API thật khi có endpoint thật: PATCH /management/properties/{id}/public.
export async function setPropertyPublicProfile(
  propertyId: string,
  isEnabled: boolean,
): Promise<Property> {
  await waitForMockRequest();

  const current = findProperty(propertyId);
  if (!current) throw new Error('Không tìm thấy khu trọ.');
  if (isEnabled && !current.district.trim()) {
    throw new Error('Cần chọn khu vực cho khu trọ trước khi bật hồ sơ công khai.');
  }

  return mutateProperty(propertyId, {
    isPublicProfileEnabled: isEnabled,
    publicSlug: isEnabled ? (current.publicSlug ?? toSlug(current.name)) : current.publicSlug,
  });
}

function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Xóa mềm khu trọ — BR-011.
 *
 * Chặn khi còn phòng `Rented` hoặc `Deposited`: phòng đang có người ở hoặc đã nhận cọc mà khu
 * biến mất khỏi màn quản lý là mất dấu vết vận hành. Dữ liệu hóa đơn và hợp đồng cũ **giữ
 * nguyên** kể cả sau khi xóa.
 */
// TODO: nối API thật khi có endpoint thật: DELETE /management/properties/{id}.
export async function deleteProperty(propertyId: string): Promise<void> {
  await waitForMockRequest();

  const current = findProperty(propertyId);
  if (!current) throw new Error('Không tìm thấy khu trọ.');

  const blockingRooms = listRooms(propertyId).filter(
    (room) => room.status === 'Rented' || room.status === 'Deposited',
  );
  if (blockingRooms.length > 0) {
    throw new Error(
      `Khu còn ${blockingRooms.length} phòng đang cho thuê hoặc đã nhận cọc. Hãy kết thúc hợp đồng của các phòng đó trước khi xóa khu.`,
    );
  }

  removeProperty(propertyId);
}

/** Số phòng đang chặn việc xóa khu — dùng để cảnh báo TRƯỚC khi người dùng bấm xóa. */
export async function countBlockingRooms(propertyId: string): Promise<number> {
  await waitForMockRequest();
  return listRooms(propertyId).filter(
    (room) => room.status === 'Rented' || room.status === 'Deposited',
  ).length;
}
