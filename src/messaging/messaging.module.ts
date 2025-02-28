import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { TwilioModule } from '../twilio/twilio.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TwilioModule, PrismaModule],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}