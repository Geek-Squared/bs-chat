import { Module } from '@nestjs/common';
import { VoiceToAppointmentService } from './voice-to-appointment.service';
import { VoiceToAppointmentController } from './voice-to-appointment.controller';

@Module({
  providers: [VoiceToAppointmentService],
  controllers: [VoiceToAppointmentController]
})
export class VoiceToAppointmentModule {}
