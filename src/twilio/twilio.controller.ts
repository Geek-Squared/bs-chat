import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { IsString, IsObject, IsArray, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

class SendMessageDto {
  @IsPhoneNumber()
  to: string;

  @IsString()
  templateId: string;

  @IsObject()
  variables: Record<string, string>;
}

class BulkRecipientDto {
  @IsPhoneNumber()
  to: string;

  @IsObject()
  variables: Record<string, string>;
}

class SendBulkMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkRecipientDto)
  recipients: BulkRecipientDto[];

  @IsString()
  templateId: string;
}

@Controller('messages')
export class TwilioController {
  constructor(private twilioService: TwilioService) {}

  @Post('send')
  async sendMessage(@Body(ValidationPipe) dto: SendMessageDto) {
    return this.twilioService.sendWhatsAppMessage(
      dto.to,
      dto.templateId,
      dto.variables
    );
  }

  @Post('bulk')
  async sendBulkMessages(@Body(ValidationPipe) dto: SendBulkMessageDto) {
    return this.twilioService.sendBulkWhatsAppMessages(
      dto.recipients,
      dto.templateId
    );
  }
}