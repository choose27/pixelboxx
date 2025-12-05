import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiServiceService } from './ai-service.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds for AI processing
      maxRedirects: 5,
    }),
  ],
  providers: [AiServiceService],
  exports: [AiServiceService],
})
export class AiServiceModule {}
