import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwilioService } from '../twilio/twilio.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleMessageDto, UpdateScheduledMessageDto, BulkScheduleMessageDto } from '../whatsapp-message/dto/schedule-message.dto';
import { ScheduledStatus } from '@prisma/client';

@Injectable()
export class ScheduledMessageService {
  private readonly logger = new Logger(ScheduledMessageService.name);

  constructor(
    private prisma: PrismaService,
    private twilioService: TwilioService,
  ) {}

  async scheduleMessage(dto: ScheduleMessageDto) {
    // Verify template exists
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
    }

    // Create scheduled message
    return this.prisma.scheduledMessage.create({
      data: {
        to: dto.phoneNumber,  // Use the new field
        phoneNumber: dto.phoneNumber, // Keep for backward compatibility
        templateId: dto.templateId,
        messageType: 'WHATSAPP', // Default type
        variables: dto.variables,
        scheduledTime: new Date(dto.scheduledTime),
      },
    });
  }

  async bulkScheduleMessages(dto: BulkScheduleMessageDto) {
    const results = [];
    
    for (const message of dto.messages) {
      try {
        const result = await this.scheduleMessage(message);
        results.push({ success: true, id: result.id, phoneNumber: message.phoneNumber });
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

  async getScheduledMessage(id: string) {
    const message = await this.prisma.scheduledMessage.findUnique({
      where: { id },
      include: { messageTemplate: true },
    });

    if (!message) {
      throw new NotFoundException(`Scheduled message with ID ${id} not found`);
    }

    return message;
  }

  async updateScheduledMessage(id: string, dto: UpdateScheduledMessageDto) {
    // Verify message exists
    const message = await this.prisma.scheduledMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Scheduled message with ID ${id} not found`);
    }

    // Verify template exists if provided
    if (dto.templateId) {
      const template = await this.prisma.messageTemplate.findUnique({
        where: { id: dto.templateId },
      });

      if (!template) {
        throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
      }
    }

    // Update only provided fields
    const updateData: any = {};
    if (dto.templateId) updateData.templateId = dto.templateId;
    if (dto.variables) updateData.variables = dto.variables;
    if (dto.scheduledTime) updateData.scheduledTime = new Date(dto.scheduledTime);

    return this.prisma.scheduledMessage.update({
      where: { id },
      data: updateData,
    });
  }

  async cancelScheduledMessage(id: string) {
    const message = await this.prisma.scheduledMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Scheduled message with ID ${id} not found`);
    }

    return this.prisma.scheduledMessage.update({
      where: { id },
      data: { status: ScheduledStatus.CANCELLED },
    });
  }

  async listScheduledMessages(filter?: { status?: ScheduledStatus }) {
    return this.prisma.scheduledMessage.findMany({
      where: filter,
      orderBy: { scheduledTime: 'asc' },
      include: { messageTemplate: true },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledMessages() {
    this.logger.log('Processing scheduled messages');
    
    const now = new Date();
    
    // Find messages that are due to be sent
    const messagesToSend = await this.prisma.scheduledMessage.findMany({
      where: {
        scheduledTime: { lte: now },
        status: ScheduledStatus.PENDING,
      },
      include: { messageTemplate: true },
    });

    this.logger.log(`Found ${messagesToSend.length} messages to send`);

    // Process each message
    for (const message of messagesToSend) {
      try {
        if (message.messageType === 'SMS') {
          await this.processSmsMessage(message);
        } else {
          // Default to WhatsApp
          await this.processWhatsAppMessage(message);
        }

        // Update message status
        await this.prisma.scheduledMessage.update({
          where: { id: message.id },
          data: {
            status: ScheduledStatus.SENT,
            sentAt: new Date(),
          },
        });

        this.logger.log(`Successfully sent scheduled message ${message.id}`);
      } catch (error) {
        this.logger.error(`Failed to send scheduled message ${message.id}: ${error.message}`);
        
        // Update message status to failed
        await this.prisma.scheduledMessage.update({
          where: { id: message.id },
          data: { status: ScheduledStatus.FAILED },
        });
      }
    }
  }

  private async processWhatsAppMessage(message: any) {
    if (message.templateId && message.messageTemplate) {
      // Send templated WhatsApp message
      await this.twilioService.sendWhatsAppMessage(
        message.phoneNumber || message.to,
        message.templateId,
        message.variables as Record<string, string>,
      );
    } else if (message.body) {
      // Send direct WhatsApp message
      await this.twilioService.sendDirectWhatsAppMessage(
        message.phoneNumber || message.to,
        message.body,
      );
    } else {
      throw new Error('WhatsApp message has no template or body');
    }
  }

  private async processSmsMessage(message: any) {
    const to = message.to || message.phoneNumber;
    
    if (message.templateId && message.messageTemplate) {
      // Send templated SMS
      const variables = message.variables as Record<string, string>;
      await this.twilioService.sendSmsTemplate(to, message.templateId, variables, message.from);
    } else if (message.body) {
      // Send direct SMS
      await this.twilioService.sendSms(to, message.body, message.from);
    } else {
      throw new Error('SMS has no template or body');
    }
  }
}