import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { EmailService } from './email-service.service';
import {
  SendEmailDto,
  SendTemplatedEmailDto,
  SendBulkTemplatedEmailDto,
  SendBulkEmailsDto,
} from './dto/send-email.dto';

@Controller('email')
export class EmailServiceController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body(ValidationPipe) dto: SendEmailDto) {
    return this.emailService.sendEmail(dto.to, dto.subject, dto.html, dto.text);
  }

  @Post('send-template')
  async sendTemplatedEmail(@Body(ValidationPipe) dto: SendTemplatedEmailDto) {
    return this.emailService.sendTemplatedEmail(
      dto.to,
      dto.templateId,
      dto.dynamicTemplateData,
    );
  }

  @Post('bulk-template')
  async sendBulkTemplatedEmails(@Body(ValidationPipe) dto: SendBulkTemplatedEmailDto) {
    return this.emailService.sendBulkTemplatedEmails(
      dto.recipients,
      dto.templateId,
    );
  }

  @Post('bulk')
  async sendBulkEmails(@Body(ValidationPipe) dto: SendBulkEmailsDto) {
    return this.emailService.sendBulkEmails(dto.recipients);
  }
}