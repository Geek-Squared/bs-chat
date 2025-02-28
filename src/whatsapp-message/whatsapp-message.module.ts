import { Module } from '@nestjs/common';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppMessageController } from './whatsapp-message.controller';
import { TwilioModule } from 'src/twilio/twilio.module';
import { ChatFlowModule } from 'src/chat-flow/chat-flow.module';
import { ChatFlowService } from 'src/chat-flow/chat-flow.service';
import { ScheduledMessageModule } from '../scheduled-message/scheduled-message.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [TwilioModule, ChatFlowModule, ScheduledMessageModule, ContactModule],
  providers: [WhatsAppMessageService, ChatFlowService],
  controllers: [WhatsAppMessageController]
})
export class WhatsappMessageModule {}
