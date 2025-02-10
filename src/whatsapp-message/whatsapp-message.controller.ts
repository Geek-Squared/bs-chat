import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WhatsAppMessageService } from './whatsapp-message.service';

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
}
