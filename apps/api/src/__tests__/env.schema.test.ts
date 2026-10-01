import { describe, expect, it } from 'vitest';
import { envSchema } from '@/config/env.schema';

const DATABASE_URL = 'postgresql://tronhanh:tronhanh@localhost:5432/tronhanh';

describe('envSchema', () => {
  it('điền giá trị mặc định khi chỉ có DATABASE_URL', () => {
    expect(envSchema.parse({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 8089,
      DATABASE_URL,
    });
  });

  it('đổi PORT từ chuỗi sang số — biến môi trường luôn là chuỗi', () => {
    expect(envSchema.parse({ DATABASE_URL, PORT: '3001' }).PORT).toBe(3001);
  });

  it('từ chối khi thiếu DATABASE_URL, kèm lời chỉ cách sửa', () => {
    const result = envSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('.env.example');
  });

  it('từ chối DATABASE_URL không phải chuỗi kết nối', () => {
    expect(envSchema.safeParse({ DATABASE_URL: 'localhost:5432' }).success).toBe(false);
  });

  it('từ chối NODE_ENV lạ thay vì chạy với cấu hình đoán mò', () => {
    expect(envSchema.safeParse({ DATABASE_URL, NODE_ENV: 'staging' }).success).toBe(false);
  });
});
