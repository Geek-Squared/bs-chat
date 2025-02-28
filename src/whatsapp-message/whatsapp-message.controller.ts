import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { 
  ScheduleMessageDto, 
  BulkScheduleMessageDto, 
  BulkSendMessageDto,
  DirectBulkSendMessageDto
} from './dto/schedule-message.dto';

@Controller('whatsapp')
export class WhatsAppMessageController {
  private readonly logger = new Logger(WhatsAppMessageController.name);
  constructor(private whatsappMessageService: WhatsAppMessageService) {}

  @Post('/start')
  async startChat(@Body() body: { phoneNumber: string; chatFlowId: string }) {
    return this.whatsappMessageService.startChat(
      body.phoneNumber,
      body.chatFlowId,
    );
  }

  @Post('/receive')
  async handleIncomingMessage(@Body() body: any) {
    try {
      this.logger.log(`Webhook received: ${JSON.stringify(body)}`);

      const phoneNumber = body.From.replace('whatsapp:', '');
      const message = body.Body.trim();

      this.logger.log(`Extracted phone: ${phoneNumber}, message: ${message}`);

      const response = await this.whatsappMessageService.processIncomingMessage(
        phoneNumber,
        message,
      );

      this.logger.log(`Response generated: ${JSON.stringify(response)}`);
      return { message: response };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @Post('/schedule')
  async scheduleMessage(@Body() dto: ScheduleMessageDto) {
    return this.whatsappMessageService.scheduleMessage(dto);
  }
   @Post('/send-bulk')
  async sendBulkMessages(@Body() dto: BulkSendMessageDto) {
    return this.whatsappMessageService.sendBulkMessages(dto);
  }
  @Post('/schedule-bulk')
  async scheduleBulkMessages(@Body() dto: BulkScheduleMessageDto) {
    return this.whatsappMessageService.scheduleBulkMessages(dto);
  }
}
