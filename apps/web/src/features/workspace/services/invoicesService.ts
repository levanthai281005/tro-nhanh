import { invoiceSchema, paymentSchema, type InvoiceStatus } from '@tronhanh/schemas';
import { buildInvoiceCode, buildInvoiceTransferNote } from '@tronhanh/utils';
import {
  createLocalId,
  findContract,
  findInvoice,
  findOccupancy,
  findProperty,
  findRoom,
  findUtilityReading,
  listInvoicesByContract,
  listInvoicesByRoom,
  listInvoicesBySeller,
  listPayments,
  saveInvoice,
  savePayment,
  saveUtilityReading,
  waitForMockRequest,
} from '@/features/workspace/services/workspaceStore';
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceListItem,
  InvoiceSummaryTotals,
  InvoicesResult,
  RecordPaymentInput,
} from '@/features/workspace/types/invoice';

/**
 * Suy trạng thái hóa đơn từ ΣPayment và `dueDate` — BR-004.
 *
 * ⚠️ **Hàm này đóng vai backend, không phải logic của client.** `STATUS_ENUMS.md` ghi rõ:
 * client không tự tính trạng thái này, luôn dùng giá trị backend trả về. Nó nằm ở tầng service
 * vì tầng service chính là chỗ API thật sẽ thay vào — **xóa hàm này** khi nối API, và không
 * bao giờ gọi nó từ component.
 *
 * Thứ tự nhánh là phần dễ sai: hóa đơn thu **một phần** mà đã **quá hạn** vẫn là `Overdue`,
 * không phải `PartiallyPaid`. Đảo hai nhánh cuối là mất hẳn cảnh báo quá hạn của đúng những
 * hóa đơn đáng lo nhất — người ở trả một ít rồi im lặng.
 */
function deriveInvoiceStatus(invoice: Invoice, paidAmount: number, today: string): InvoiceStatus {
  if (paidAmount >= invoice.totalAmount) return 'Paid';
  if (today > invoice.dueDate) return 'Overdue';
  if (paidAmount > 0) return 'PartiallyPaid';
  return 'Unpaid';
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toListItem(invoice: Invoice, today: string): InvoiceListItem | null {
  const room = findRoom(invoice.roomId);
  const property = room ? findProperty(room.propertyId) : undefined;
  if (!room || !property) return null;

  const contract = findContract(invoice.contractId);
  const occupancy = contract ? findOccupancy(contract.occupancyId) : undefined;
  const payments = listPayments(invoice.id);
  const paidAmount = payments.reduce((sum, item) => sum + item.amount, 0);

  return {
    ...invoice,
    code: buildInvoiceCode({ roomCode: room.roomCode, period: invoice.period }),
    transferNote: buildInvoiceTransferNote({ roomCode: room.roomCode, period: invoice.period }),
    roomCode: room.roomCode,
    propertyId: property.id,
    propertyName: property.name,
    occupantName: occupancy?.fullName ?? 'Không rõ',
    status: deriveInvoiceStatus(invoice, paidAmount, today),
    paidAmount,
    remainingAmount: Math.max(0, invoice.totalAmount - paidAmount),
    payments,
    bankName: property.bankName,
    bankAccountNumber: property.bankAccountNumber,
    bankAccountName: property.bankAccountName,
  };
}

function toTotals(items: readonly InvoiceListItem[]): InvoiceSummaryTotals {
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

// TODO: nối API thật khi packages/types sinh xong: GET /management/invoices.
export async function getInvoicesBySeller(sellerId: string | undefined): Promise<InvoicesResult> {
  await waitForMockRequest();
  if (!sellerId) return { items: [], totals: toTotals([]), periods: [] };

  const today = todayIso();
  const items = listInvoicesBySeller(sellerId)
    .map((invoice) => toListItem(invoice, today))
    .filter((item): item is InvoiceListItem => item !== null);

  // Kỳ lấy từ chính dữ liệu, không bịa 12 tháng cứng — dropdown chỉ nên có kỳ mà bấm vào thì
  // thấy hóa đơn.
  const periods = [...new Set(items.map((item) => item.period))].sort((left, right) =>
    right.localeCompare(left),
  );

  return { items, totals: toTotals(items), periods };
}

/**
 * Hóa đơn của một phòng — nguồn cho màn chi tiết phòng (B9).
 *
 * Dùng lại `toListItem`, tức dùng lại `deriveInvoiceStatus`. Đây là điểm mấu chốt: nếu B9 tự
 * suy trạng thái lần nữa thì cùng một hóa đơn có thể hiện `Quá hạn` ở màn hóa đơn và
 * `Thu một phần` ở màn phòng — và đây là màn tiền, hai con số đá nhau là mất niềm tin vào cả
 * hệ thống chứ không riêng một cái badge.
 */
// TODO: nối API thật khi packages/types sinh xong: GET /management/rooms/{id}/invoices.
export async function getInvoicesByRoom(roomId: string): Promise<readonly InvoiceListItem[]> {
  await waitForMockRequest();

  const today = todayIso();
  return listInvoicesByRoom(roomId)
    .map((invoice) => toListItem(invoice, today))
    .filter((item): item is InvoiceListItem => item !== null);
}

/**
 * Tạo hóa đơn — unique (contractId, period).
 *
 * Kiểm ở đây chỉ để báo lỗi tử tế bằng tiếng Việt; **biên thật là ràng buộc unique ở
 * database**, vì hai request gửi cùng lúc đều đọc thấy "chưa có hóa đơn kỳ này" rồi cùng ghi.
 */
// TODO: nối API thật khi packages/types sinh xong: POST /management/rooms/{id}/invoices.
export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceListItem> {
  await waitForMockRequest();

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Hóa đơn chưa hợp lệ.');
  }

  const contract = findContract(input.contractId);
  if (!contract || contract.status !== 'Active') {
    throw new Error('Phòng chưa có hợp đồng đang hiệu lực nên chưa xuất hóa đơn được (BR-006).');
  }

  const duplicated = listInvoicesByContract(input.contractId).find(
    (item) => item.period === input.period,
  );
  if (duplicated) {
    throw new Error(
      `Hợp đồng này đã có hóa đơn kỳ ${input.period}. Mỗi kỳ chỉ xuất một hóa đơn — hãy mở hóa đơn cũ để ghi nhận thu.`,
    );
  }

  const timestamp = new Date().toISOString();
  const invoice: Invoice = {
    id: createLocalId(),
    roomId: input.roomId,
    contractId: input.contractId,
    period: input.period,
    dueDate: input.dueDate,
    totalAmount: input.items.reduce((sum, item) => sum + item.amount, 0),
    items: input.items.map((item) => ({ ...item, id: createLocalId() })),
    sentAt: null,
    createdAt: timestamp,
  };

  saveInvoice(invoice);

  // Đánh dấu chỉ số đã lên hóa đơn — cùng transaction ở backend. Bỏ bước này thì kỳ sau chủ
  // trọ vẫn sửa được chỉ số đã tính tiền, và hai con số lệch nhau vĩnh viễn.
  for (const type of ['Electricity', 'Water'] as const) {
    const reading = findUtilityReading(input.roomId, type, input.period);
    if (reading && !reading.invoiceId) {
      saveUtilityReading({ ...reading, invoiceId: invoice.id });
    }
  }

  const listItem = toListItem(invoice, todayIso());
  if (!listItem) throw new Error('Không dựng được hóa đơn vừa tạo.');
  return listItem;
}

/**
 * Ghi nhận một khoản thu — AS-002.
 *
 * ⚠️ Chặn thu **vượt số còn thiếu**. Prototype không chặn: hóa đơn 3tr đã thu 1tr mà nút "Đã
 * thu" gửi nguyên tổng thì sổ ghi nhận 4tr cho hóa đơn 3tr, và badge vẫn xanh nên không ai
 * nhận ra.
 */
// TODO: nối API thật khi packages/types sinh xong: POST /management/invoices/{id}/payments.
export async function recordPayment(input: RecordPaymentInput): Promise<InvoiceListItem> {
  await waitForMockRequest();

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Khoản thu chưa hợp lệ.');
  }

  const invoice = findInvoice(input.invoiceId);
  if (!invoice) throw new Error('Không tìm thấy hóa đơn.');

  const paidAmount = listPayments(invoice.id).reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(0, invoice.totalAmount - paidAmount);

  if (remaining === 0) {
    throw new Error('Hóa đơn này đã thu đủ.');
  }
  if (input.amount > remaining) {
    throw new Error(
      `Số tiền thu vượt quá số còn thiếu (${remaining.toLocaleString('vi-VN')} đ). Hãy nhập đúng số đã nhận.`,
    );
  }

  savePayment({
    id: createLocalId(),
    invoiceId: input.invoiceId,
    amount: input.amount,
    method: input.method,
    paidAt: input.paidAt,
    note: input.note,
    createdAt: new Date().toISOString(),
  });

  const listItem = toListItem(invoice, todayIso());
  if (!listItem) throw new Error('Không đọc lại được hóa đơn.');
  return listItem;
}

/**
 * Đánh dấu đã gửi hóa đơn cho người ở.
 *
 * Chỉ ghi mốc thời gian. Gửi in-app thật cần hộp thư (A11) và `Notification` — chưa dựng, nên
 * chủ trọ tự gửi ngoài (in ra hoặc chụp màn hình) rồi đánh dấu ở đây để theo dõi kỳ nào đã báo.
 */
// TODO: nối API thật khi packages/types sinh xong: PATCH /management/invoices/{id}/send.
export async function markInvoiceSent(invoiceId: string): Promise<InvoiceListItem> {
  await waitForMockRequest();

  const invoice = findInvoice(invoiceId);
  if (!invoice) throw new Error('Không tìm thấy hóa đơn.');

  const updated: Invoice = { ...invoice, sentAt: new Date().toISOString() };
  saveInvoice(updated);

  const listItem = toListItem(updated, todayIso());
  if (!listItem) throw new Error('Không đọc lại được hóa đơn.');
  return listItem;
}
