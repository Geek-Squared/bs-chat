import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { MessageTemplateService } from '../message-template/message-template.service';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(
    private configService: ConfigService,
    private messageTemplateService: MessageTemplateService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');
    this.client = twilio(accountSid, authToken);
  }

  async sendWhatsAppMessage(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ) {
    try {
      const template = await this.messageTemplateService.findById(templateId);
      if (!template) {
        throw new NotFoundException(`Template with ID ${templateId} not found`);
      }

      const message = this.messageTemplateService.generateMessage(
        template.content,
        variables,
      );

      const response = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${to}`,
      });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendBulkWhatsAppMessages(
    recipients: Array<{ to: string; variables: Record<string, string> }>,
    templateId: string,
  ) {
    const template = await this.messageTemplateService.findById(templateId);

    const promises = recipients.map(({ to, variables }) => {
      const message = this.messageTemplateService.generateMessage(
        template.content,
        variables,
      );

      return this.client.messages.create({
        body: message,
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${to}`,
      });
    });

    return Promise.all(promises);
  }
}
