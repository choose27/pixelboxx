import { Module } from '@nestjs/common';
import { BoxxesController } from './boxxes.controller';
import { BoxxesService } from './boxxes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoxxesController],
  providers: [BoxxesService],
  exports: [BoxxesService],
})
export class BoxxesModule {}
