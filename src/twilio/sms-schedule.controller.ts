import { Controller, Post, Body, HttpStatus, HttpCode, Get, Query, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ScheduleSmsDto,
  ScheduleSmsTemplateDto,
  BulkScheduleSmsDto,
  BulkScheduleSmsTemplateDto,
} from './dto/schedule-sms.dto';
import { MessageTemplateService } from '../message-template/message-template.service';
import { ContactService } from '../contact/contact.service';

@Controller('sms-schedule')
export class SmsScheduleController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly messageTemplateService: MessageTemplateService,
    private readonly contactService: ContactService,
  ) {}

  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  async scheduleSms(@Body() scheduleSmsDto: ScheduleSmsDto) {
    const { to, body, from, scheduledTime } = scheduleSmsDto;

    // Check if contact exists, if not create one with phone number
    let contact = await this.contactService.findByPhoneNumber(to);
    if (!contact) {
      contact = await this.contactService.create({ phoneNumber: to });
    }

    const scheduledMessage = await this.prismaService.scheduledMessage.create({
      data: {
        to,
        from,
        body,
        messageType: 'SMS',
        scheduledTime: new Date(scheduledTime),
        contactId: contact.id,
      },
    });

    return {
      success: true,
      message: 'SMS scheduled successfully',
      data: scheduledMessage,
    };
  }

  @Post('schedule-template')
  @HttpCode(HttpStatus.CREATED)
  async scheduleSmsTemplate(@Body() dto: ScheduleSmsTemplateDto) {
    const { to, templateId, variables, from, scheduledTime } = dto;

    // Verify template exists
    const template = await this.messageTemplateService.findById(templateId);
    if (!template) {
      return {
        success: false,
        message: `Template with ID ${templateId} not found`,
      };
    }

    // Check if contact exists, if not create one with phone number
    let contact = await this.contactService.findByPhoneNumber(to);
    if (!contact) {
      contact = await this.contactService.create({ phoneNumber: to });
    }

    const scheduledMessage = await this.prismaService.scheduledMessage.create({
      data: {
        to,
        from,
        templateId,
        variables,
        messageType: 'SMS',
        scheduledTime: new Date(scheduledTime),
        contactId: contact.id,
      },
    });

    return {
      success: true,
      message: 'Template SMS scheduled successfully',
      data: scheduledMessage,
    };
  }

  @Post('bulk-schedule')
  @HttpCode(HttpStatus.CREATED)
  async bulkScheduleSms(@Body() dto: BulkScheduleSmsDto) {
    const { recipients, body: defaultBody, from, scheduledTime } = dto;

    const scheduledMessages = [];
    for (const recipient of recipients) {
      const { to, body } = recipient;
      
      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }

      const scheduledMessage = await this.prismaService.scheduledMessage.create({
        data: {
          to,
          from,
          body: body || defaultBody,
          messageType: 'SMS',
          scheduledTime: new Date(scheduledTime),
          contactId: contact.id,
        },
      });

      scheduledMessages.push(scheduledMessage);
    }

    return {
      success: true,
      message: `${scheduledMessages.length} SMS messages scheduled successfully`,
      data: {
        scheduledCount: scheduledMessages.length,
        scheduledMessages,
      },
    };
  }

  @Post('bulk-schedule-template')
  @HttpCode(HttpStatus.CREATED)
  async bulkScheduleSmsTemplate(@Body() dto: BulkScheduleSmsTemplateDto) {
    const { recipients, templateId, from, scheduledTime } = dto;

    // Verify template exists
    const template = await this.messageTemplateService.findById(templateId);
    if (!template) {
      return {
        success: false,
        message: `Template with ID ${templateId} not found`,
      };
    }

    const scheduledMessages = [];
    for (const recipient of recipients) {
      const { to, variables } = recipient;
      
      // Check if contact exists, if not create one with phone number
      let contact = await this.contactService.findByPhoneNumber(to);
      if (!contact) {
        contact = await this.contactService.create({ phoneNumber: to });
      }

      const scheduledMessage = await this.prismaService.scheduledMessage.create({
        data: {
          to,
          from,
          templateId,
          variables,
          messageType: 'SMS',
          scheduledTime: new Date(scheduledTime),
          contactId: contact.id,
        },
      });

      scheduledMessages.push(scheduledMessage);
    }

    return {
      success: true,
      message: `${scheduledMessages.length} template SMS messages scheduled successfully`,
      data: {
        scheduledCount: scheduledMessages.length,
        scheduledMessages,
      },
    };
  }

  @Get()
  async getScheduledSms(
    @Query('status') status?: string,
    @Query('messageType') messageType: string = 'SMS',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const where: any = { messageType };
    
    if (status) where.status = status;
    
    const scheduledMessages = await this.prismaService.scheduledMessage.findMany({
      where,
      include: {
        messageTemplate: true,
      },
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
      orderBy: { scheduledTime: 'asc' },
    });
    
    const count = await this.prismaService.scheduledMessage.count({ where });
    
    return {
      success: true,
      data: {
        scheduledMessages,
        total: count,
      },
    };
  }

  @Delete(':id')
  async cancelScheduledSms(@Param('id') id: string) {
    const scheduledMessage = await this.prismaService.scheduledMessage.findUnique({
      where: { id },
    });

    if (!scheduledMessage) {
      return {
        success: false,
        message: `Scheduled SMS with ID ${id} not found`,
      };
    }

    await this.prismaService.scheduledMessage.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return {
      success: true,
      message: 'Scheduled SMS cancelled successfully',
    };
  }
}