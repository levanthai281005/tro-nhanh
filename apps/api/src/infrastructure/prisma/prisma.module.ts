import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Hạ tầng, không phải module nghiệp vụ — không tính vào 17 module của
 * `.agents/business/BACKEND_SERVICES.md`. Global để mỗi module nghiệp vụ không phải tự import,
 * và để cả ứng dụng chỉ có một pool kết nối.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
