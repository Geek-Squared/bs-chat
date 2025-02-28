import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwilioService } from '../twilio/twilio.service';
import { MessageDirection, MessageStatus } from '@prisma/client';
import { 
  SendMessageDto, 
  SendBulkMessagesDto,
  ScheduleMessageDto,
  ScheduleBulkMessagesDto
} from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private prisma: PrismaService,
    private twilioService: TwilioService,
  ) {}

  async sendMessage(dto: SendMessageDto) {
    try {
      // Send the message
      const response = await this.twilioService.sendDirectWhatsAppMessage(
        dto.phoneNumber,
        dto.message
      );

      // Log the message
      await this.prisma.messageLog.create({
        data: {
          phoneNumber: dto.phoneNumber, // Legacy field
          message: dto.message,         // Legacy field
          to: dto.phoneNumber,
          from: `whatsapp:${this.twilioService.getWhatsAppNumber()}`,
          body: dto.message,
          direction: MessageDirection.OUTBOUND,
          status: MessageStatus.SENT,
          type: 'WHATSAPP',
        },
      });

      return {
        success: true,
        sid: response.sid,
        phoneNumber: dto.phoneNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to send message to ${dto.phoneNumber}: ${error.message}`);
      
      // Log the failure
      await this.prisma.messageLog.create({
        data: {
          phoneNumber: dto.phoneNumber, // Legacy field
          message: dto.message,         // Legacy field
          to: dto.phoneNumber,
          from: `whatsapp:${this.twilioService.getWhatsAppNumber()}`,
          body: dto.message,
          direction: MessageDirection.OUTBOUND,
          status: MessageStatus.FAILED,
          type: 'WHATSAPP',
        },
      });

      return {
        success: false,
        phoneNumber: dto.phoneNumber,
        error: error.message,
      };
    }
  }

  async sendBulkMessages(dto: SendBulkMessagesDto) {
    try {
      const messages = dto.messages.map(msg => ({
        to: `whatsapp:${msg.phoneNumber}`,
        message: msg.message
      }));

      // Send the messages
      const responses = await this.twilioService.sendBulkDirectWhatsAppMessages(messages);

      // Log all messages
      await Promise.all(
        dto.messages.map((msg, index) => 
          this.prisma.messageLog.create({
            data: {
              phoneNumber: msg.phoneNumber, // Legacy field
              message: msg.message,         // Legacy field
              to: msg.phoneNumber,
              from: `whatsapp:${this.twilioService.getWhatsAppNumber()}`,
              body: msg.message,
              direction: MessageDirection.OUTBOUND,
              status: MessageStatus.SENT,
              type: 'WHATSAPP',
            },
          })
        )
      );

      return {
        success: true,
        total: dto.messages.length,
        messages: responses.map((response, index) => ({
          sid: response.sid,
          phoneNumber: dto.messages[index].phoneNumber,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to send bulk messages: ${error.message}`);
      
      // Log all messages as failed
      await Promise.all(
        dto.messages.map(msg => 
          this.prisma.messageLog.create({
            data: {
              phoneNumber: msg.phoneNumber, // Legacy field
              message: msg.message,         // Legacy field
              to: msg.phoneNumber,
              from: `whatsapp:${this.twilioService.getWhatsAppNumber()}`,
              body: msg.message,
              direction: MessageDirection.OUTBOUND,
              status: MessageStatus.FAILED,
              type: 'WHATSAPP',
            },
          })
        )
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async scheduleMessage(dto: ScheduleMessageDto) {
    try {
      // Create scheduled message record
      const scheduledMessage = await this.prisma.scheduledMessage.create({
        data: {
          to: dto.phoneNumber,  // Use the new field
          phoneNumber: dto.phoneNumber, // Keep for backward compatibility
          body: dto.message,    // Direct message content
          messageType: 'WHATSAPP',
          variables: { directMessage: dto.message },
          scheduledTime: new Date(dto.scheduledTime)
        },
      });

      return {
        success: true,
        id: scheduledMessage.id,
        phoneNumber: dto.phoneNumber,
        scheduledTime: scheduledMessage.scheduledTime,
      };
    } catch (error) {
      this.logger.error(`Failed to schedule message: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async scheduleBulkMessages(dto: ScheduleBulkMessagesDto) {
    const results = [];
    
    for (const message of dto.messages) {
      try {
        const result = await this.scheduleMessage(message);
        results.push(result);
      } catch (error) {
        results.push({ 
          success: false, 
          phoneNumber: message.phoneNumber, 
          error: error.message 
        });
      }
    }
    
    return {
      total: dto.messages.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
}