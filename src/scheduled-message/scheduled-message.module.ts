import { Module } from '@nestjs/common';
import { ScheduledMessageService } from './scheduled-message.service';
import { ScheduledMessageController } from './scheduled-message.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TwilioModule } from '../twilio/twilio.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    TwilioModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ScheduledMessageController],
  providers: [ScheduledMessageService],
  exports: [ScheduledMessageService],
})
export class ScheduledMessageModule {}