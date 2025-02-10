import { Module } from '@nestjs/common';
import { ChatFlowService } from './chat-flow.service';
import { ChatFlowController } from './chat-flow.controller';

@Module({
  providers: [ChatFlowService],
  controllers: [ChatFlowController]
})
export class ChatFlowModule {}
