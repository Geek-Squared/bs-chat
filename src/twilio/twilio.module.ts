import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { SmsController } from './sms.controller';
import { SmsScheduleController } from './sms-schedule.controller';
import { MessageTemplateService } from '../message-template/message-template.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [ConfigModule, ContactModule],
  controllers: [TwilioController, SmsController, SmsScheduleController],
  providers: [TwilioService, MessageTemplateService, PrismaService],
  exports: [TwilioService],
})
export class TwilioModule {}
