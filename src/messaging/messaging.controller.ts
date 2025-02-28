import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { 
  SendMessageDto, 
  SendBulkMessagesDto, 
  ScheduleMessageDto, 
  ScheduleBulkMessagesDto 
} from './dto/send-message.dto';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(dto);
  }

  @Post('send-bulk')
  async sendBulkMessages(@Body() dto: SendBulkMessagesDto) {
    return this.messagingService.sendBulkMessages(dto);
  }

  @Post('schedule')
  async scheduleMessage(@Body() dto: ScheduleMessageDto) {
    return this.messagingService.scheduleMessage(dto);
  }

  @Post('schedule-bulk')
  async scheduleBulkMessages(@Body() dto: ScheduleBulkMessagesDto) {
    return this.messagingService.scheduleBulkMessages(dto);
  }
}