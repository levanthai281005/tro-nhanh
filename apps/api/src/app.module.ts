import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/config/env.schema';
import { HealthController } from '@/health/health.controller';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validationSchema: envSchema }),
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
