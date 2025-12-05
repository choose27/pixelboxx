import { Module } from '@nestjs/common';
import { PixelPagesController } from './pixelpages.controller';
import { PixelPagesService } from './pixelpages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiServiceModule } from '../ai-service/ai-service.module';

@Module({
  imports: [PrismaModule, AiServiceModule],
  controllers: [PixelPagesController],
  providers: [PixelPagesService],
  exports: [PixelPagesService],
})
export class PixelPagesModule {}
