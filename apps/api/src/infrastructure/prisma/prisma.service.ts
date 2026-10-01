import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Env } from '@/config/env.schema';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Prisma Client dùng chung cho cả ứng dụng — một pool kết nối duy nhất.
 *
 * Kết nối qua `DATABASE_URL` (bộ gộp kết nối trên Supabase). Pool của `pg` mở kết nối lười
 * nên ứng dụng vẫn khởi động được khi cơ sở dữ liệu chưa sẵn sàng; `/health` báo tình trạng.
 *
 * Luật sở hữu dữ liệu vẫn áp dụng: chỉ module sở hữu bảng mới gọi tới bảng đó
 * (`.agents/rules/CODING_STANDARDS.md`, mục NestJS).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({ connectionString: config.get('DATABASE_URL', { infer: true }) }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
