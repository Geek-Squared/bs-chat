import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TwilioModule } from './twilio/twilio.module';
import { ConfigModule } from '@nestjs/config';
import { ChatFlowModule } from './chat-flow/chat-flow.module';
import { MessageTemplateModule } from './message-template/message-template.module';
import { WhatsappMessageModule } from './whatsapp-message/whatsapp-message.module';
import { VoiceToAppointmentModule } from './voice-to-appointment/voice-to-appointment.module';
import { EmailServiceModule } from './email-service/email-service.module';
import { ScheduledMessageModule } from './scheduled-message/scheduled-message.module';
import { MessagingModule } from './messaging/messaging.module';
import { ScheduleModule } from '@nestjs/schedule';
import sendgridConfig from './config/sendgrid.config';
import awsConfig from './config/aws.config';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      load: [sendgridConfig, awsConfig],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TwilioModule,
    ChatFlowModule,
    MessageTemplateModule,
    WhatsappMessageModule,
    VoiceToAppointmentModule,
    EmailServiceModule,
    ScheduledMessageModule,
    MessagingModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
