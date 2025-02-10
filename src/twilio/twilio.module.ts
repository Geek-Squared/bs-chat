import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { MessageTemplateService } from '../message-template/message-template.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [TwilioController],
  providers: [TwilioService, MessageTemplateService, PrismaService],
  exports: [TwilioService],
})
export class TwilioModule {}
