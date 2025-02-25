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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TwilioModule,
    ChatFlowModule,
    MessageTemplateModule,
    WhatsappMessageModule,
    VoiceToAppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
