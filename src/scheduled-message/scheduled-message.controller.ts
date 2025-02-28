import { Controller, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ScheduledMessageService } from './scheduled-message.service';
import { ScheduleMessageDto, UpdateScheduledMessageDto, BulkScheduleMessageDto } from '../whatsapp-message/dto/schedule-message.dto';
import { ScheduledStatus } from '@prisma/client';

@Controller('scheduled-messages')
export class ScheduledMessageController {
  constructor(private scheduledMessageService: ScheduledMessageService) {}

  @Post()
  async scheduleMessage(@Body() dto: ScheduleMessageDto) {
    return this.scheduledMessageService.scheduleMessage(dto);
  }

  @Post('bulk')
  async bulkScheduleMessages(@Body() dto: BulkScheduleMessageDto) {
    return this.scheduledMessageService.bulkScheduleMessages(dto);
  }

  @Get()
  async listScheduledMessages(@Query('status') status?: ScheduledStatus) {
    return this.scheduledMessageService.listScheduledMessages(
      status ? { status } : undefined
    );
  }

  @Get(':id')
  async getScheduledMessage(@Param('id') id: string) {
    return this.scheduledMessageService.getScheduledMessage(id);
  }

  @Patch(':id')
  async updateScheduledMessage(
    @Param('id') id: string,
    @Body() dto: UpdateScheduledMessageDto,
  ) {
    return this.scheduledMessageService.updateScheduledMessage(id, dto);
  }

  @Delete(':id')
  async cancelScheduledMessage(@Param('id') id: string) {
    return this.scheduledMessageService.cancelScheduledMessage(id);
  }
}