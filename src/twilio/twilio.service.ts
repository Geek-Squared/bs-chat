import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { MessageTemplateService } from '../message-template/message-template.service';
import { ContactService } from '../contact/contact.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;
  private whatsAppNumber: string;
  private smsNumber: string;

  constructor(
    private configService: ConfigService,
    private messageTemplateService: MessageTemplateService,
    private contactService: ContactService,
    private prismaService: PrismaService,
  ) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.whatsAppNumber = this.configService.get<string>('twilio.whatsAppNumber');
    this.smsNumber = this.configService.get<string>('twilio.smsNumber');
    this.client = twilio(accountSid, authToken);
  }
  
  // Getter methods for service numbers
  getWhatsAppNumber(): string {
    return this.whatsAppNumber;
  }
  
  getSmsNumber(): string {
    return this.smsNumber;
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

      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }

      const response = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsAppNumber}`,
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
  
  async sendDirectWhatsAppMessage(
    to: string,
    message: string,
  ) {
    try {
      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }
      
      const response = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsAppNumber}`,
        to: `whatsapp:${to}`,
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  async sendBulkWhatsAppMessages(
    recipients: Array<{ to: string; variables: Record<string, string> }>,
    templateId: string,
  ) {
    const template = await this.messageTemplateService.findById(templateId);

    const promises = recipients.map(async ({ to, variables }) => {
      const message = this.messageTemplateService.generateMessage(
        template.content,
        variables,
      );

      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }

      return this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsAppNumber}`,
        to: `whatsapp:${to}`,
      });
    });

    return Promise.all(promises);
  }
  
  async sendBulkDirectWhatsAppMessages(
    messages: Array<{ to: string; message: string }>,
  ) {
    const promises = messages.map(async ({ to, message }) => {
      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }
      
      return this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsAppNumber}`,
        to: `whatsapp:${to}`,
      });
    });

    return Promise.all(promises);
  }

  async sendSms(to: string, body: string, from?: string) {
    try {
      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }

      const response = await this.client.messages.create({
        body,
        from: from || this.smsNumber,
        to,
      });

      // Log the SMS in the database
      await this.prismaService.messageLog.create({
        data: {
          messageId: response.sid,
          to,
          from: from || this.smsNumber,
          body,
          // Map Twilio status to our enum
          status: response.status === 'queued' ? 'PENDING' : 
                 response.status === 'failed' ? 'FAILED' : 'SENT',
          type: 'SMS',
          direction: 'OUTBOUND',
          contactId: contact.id,
        },
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendBulkSms(recipients: Array<{ to: string; body?: string }>, defaultBody: string, from?: string) {
    const promises = recipients.map(async ({ to, body }) => {
      try {
        // Check if contact exists, if not create one with phone number
        let contact = await this.contactService.findByPhoneNumber(to);
        if (!contact) {
          contact = await this.contactService.create({ phoneNumber: to });
        }
        
        const messageBody = body || defaultBody;
        const response = await this.client.messages.create({
          body: messageBody,
          from: from || this.smsNumber,
          to,
        });

        // Log the SMS in the database
        await this.prismaService.messageLog.create({
          data: {
            messageId: response.sid,
            to,
            from: from || this.smsNumber,
            body: messageBody,
            // Map Twilio status to our enum
            status: response.status === 'queued' ? 'PENDING' : 
                   response.status === 'failed' ? 'FAILED' : 'SENT',
            type: 'SMS',
            direction: 'OUTBOUND',
            contactId: contact.id,
          },
        });

        return response;
      } catch (error) {
        console.error(`Failed to send SMS to ${to}: ${error.message}`);
        // Return the error rather than throwing to allow other messages to proceed
        return { error: error.message, to };
      }
    });

    const results = await Promise.all(promises);
    return results;
  }

  async sendSmsTemplate(to: string, templateId: string, variables: Record<string, string>, from?: string) {
    try {
      const template = await this.messageTemplateService.findById(templateId);
      if (!template) {
        throw new NotFoundException(`Template with ID ${templateId} not found`);
      }

      const message = this.messageTemplateService.generateMessage(
        template.content,
        variables,
      );

      return this.sendSms(to, message, from);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to send template SMS: ${error.message}`);
    }
  }

  async sendBulkSmsTemplate(
    recipients: Array<{ to: string; variables: Record<string, string> }>,
    templateId: string,
    from?: string,
  ) {
    try {
      const template = await this.messageTemplateService.findById(templateId);
      if (!template) {
        throw new NotFoundException(`Template with ID ${templateId} not found`);
      }

      const messages = recipients.map(({ to, variables }) => {
        const body = this.messageTemplateService.generateMessage(
          template.content,
          variables,
        );
        return { to, body };
      });

      return this.sendBulkSms(messages, '', from);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to send bulk template SMS: ${error.message}`);
    }
  }
}
