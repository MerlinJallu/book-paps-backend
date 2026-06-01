import { Module } from '@nestjs/common';
import { SupportMessageController } from './support-message.controller';
import { SupportMessageService } from './support-message.service';

@Module({
  controllers: [SupportMessageController],
  providers: [SupportMessageService],
})
export class SupportMessageModule {}
