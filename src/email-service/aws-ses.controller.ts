import { Controller, Post, Body, ValidationPipe, Logger } from '@nestjs/common';
import { AwsSesService } from './aws-ses.service';
import {
  SendAwsEmailDto,
  SendAwsTemplatedEmailDto,
  SendAwsBulkTemplatedEmailDto,
  SendAwsBulkEmailsDto,
} from './dto/aws-email.dto';

@Controller('aws-email')
export class AwsSesController {
  private readonly logger = new Logger(AwsSesController.name);
  
  constructor(private awsSesService: AwsSesService) {}

  @Post('send')
  async sendEmail(@Body(ValidationPipe) dto: SendAwsEmailDto) {
    this.logger.log(`Sending email to ${dto.to}`);
    return this.awsSesService.sendEmail(
      dto.to,
      dto.subject,
      dto.htmlBody,
      dto.textBody
    );
  }

  @Post('send-template')
  async sendTemplatedEmail(@Body(ValidationPipe) dto: SendAwsTemplatedEmailDto) {
    this.logger.log(`Sending templated email to ${dto.to} using template ${dto.templateName}`);
    return this.awsSesService.sendTemplatedEmail(
      dto.to,
      dto.templateName,
      dto.templateData
    );
  }

  @Post('bulk-template')
  async sendBulkTemplatedEmails(@Body(ValidationPipe) dto: SendAwsBulkTemplatedEmailDto) {
    this.logger.log(`Sending bulk templated emails to ${dto.recipients.length} recipients using template ${dto.templateName}`);
    return this.awsSesService.sendBulkTemplatedEmails(
      dto.templateName,
      dto.recipients
    );
  }

  @Post('bulk')
  async sendBulkEmails(@Body(ValidationPipe) dto: SendAwsBulkEmailsDto) {
    this.logger.log(`Sending bulk emails to ${dto.recipients.length} recipients`);
    return this.awsSesService.sendBulkEmails(dto.recipients);
  }
}