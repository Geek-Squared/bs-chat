import { Module } from '@nestjs/common';
import { MessageTemplateService } from './message-template.service';
import { MessageTemplateController } from './message-template.controller';

@Module({
  providers: [MessageTemplateService],
  controllers: [MessageTemplateController]
})
export class MessageTemplateModule {}
