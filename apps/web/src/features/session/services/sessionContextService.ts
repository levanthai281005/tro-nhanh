import { parseSessionContext, type SessionContext } from '@tronhanh/access';
import { MOCK_SESSION_CONTEXT } from '@/features/session/constants/mockSessionContext';

/**
 * Capability của phiên hiện tại.
 *
 * Một endpoint duy nhất thay vì để client ghép từ nhiều nguồn: `workspaceStatus` là giá trị
 * **suy ra** từ `UserSubscription` (hết hạn → `READ_ONLY`), `residencyStatus` suy từ
 * `Occupancy`. Client tự suy nghĩa là luật gating có hai bản, mà bản ở client thì người dùng
 * sửa được.
 */
// TODO: nối API thật khi có endpoint thật: GET /me/context.
export async function getSessionContext(): Promise<SessionContext> {
  // `parseSessionContext` chạy cả với dữ liệu mock — mock lệch hợp đồng phải vỡ ngay ở đây,
  // chứ không phải lặng lẽ chảy vào UI rồi sai ở một màn nào đó.
  return parseSessionContext(MOCK_SESSION_CONTEXT);
}
