import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

export interface HealthStatus {
  status: 'ok';
  database: 'up';
}

/**
 * `GET /api/v1/health` — ứng dụng chạy và truy vấn được cơ sở dữ liệu. Dùng cho healthcheck
 * của container và nền tảng triển khai.
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      // Chi tiết lỗi chỉ ghi log — response công khai không được lộ chuỗi kết nối hay tên host.
      this.logger.error('Không truy vấn được cơ sở dữ liệu', error);
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }

    return { status: 'ok', database: 'up' };
  }
}
