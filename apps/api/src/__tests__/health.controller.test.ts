import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HealthController } from '@/health/health.controller';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

/**
 * Dựng controller qua DI thật của Nest, chỉ thay `PrismaService`. Nếu decorator metadata không
 * được phát (cấu hình SWC sai), Nest không biết inject gì vào constructor và test hỏng ngay ở
 * bước dựng module — đây là chốt chặn cho cấu hình build, không chỉ cho endpoint.
 */
async function createApp(queryRaw: () => Promise<unknown>): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: PrismaService, useValue: { $queryRaw: queryRaw } }],
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  return app;
}

describe('GET /health', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('trả 200 khi truy vấn được cơ sở dữ liệu', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }]);
    app = await createApp(queryRaw);

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it('trả 503 và không lộ chi tiết lỗi khi cơ sở dữ liệu không trả lời', async () => {
    app = await createApp(
      vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED db.internal:5432')),
    );

    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'down' });
    expect(JSON.stringify(response.body)).not.toContain('db.internal');
  });
});
