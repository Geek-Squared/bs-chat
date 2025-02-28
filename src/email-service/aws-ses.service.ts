import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { EmailTrackerService } from './email-tracker.service';

@Injectable()
export class AwsSesService {
  private readonly logger = new Logger(AwsSesService.name);
  private sesClient: AWS.SES;
  private fromEmail: string;

  constructor(
    private configService: ConfigService,
    private emailTrackerService: EmailTrackerService
  ) {
    // Configure AWS with credentials
    AWS.config.update({
      region: this.configService.get<string>('aws.region'),
      accessKeyId: this.configService.get<string>('aws.accessKeyId'),
      secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
    });

    this.sesClient = new AWS.SES();
    this.fromEmail = this.configService.get<string>('aws.sesFromEmail');

    if (!this.configService.get<string>('aws.accessKeyId') || 
        !this.configService.get<string>('aws.secretAccessKey')) {
      this.logger.warn('AWS credentials are not set properly');
    }
  }

  async sendEmail(to: string, subject: string, htmlBody: string, textBody?: string) {
    try {
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: htmlBody,
            },
            Text: {
              Data: textBody || this.stripHtml(htmlBody),
            },
          },
        },
      };

      const result = await this.sesClient.sendEmail(params).promise();
      this.logger.log(`Email sent successfully to ${to}, MessageId: ${result.MessageId}`);
      
      // Log the successful email
      await this.emailTrackerService.logEmailSent({
        to,
        subject,
        content: htmlBody,
        provider: 'AWS_SES',
        status: 'SENT',
        messageId: result.MessageId,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      
      // Log the failed email
      await this.emailTrackerService.logEmailSent({
        to,
        subject,
        content: htmlBody,
        provider: 'AWS_SES',
        status: 'FAILED',
        errorMessage: error.message,
      });
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkEmails(recipients: Array<{ 
    to: string; 
    subject: string; 
    htmlBody: string; 
    textBody?: string; 
  }>) {
    try {
      const results = [];
      
      // SES doesn't have a native bulk send like SendGrid, so we need to send emails one by one
      for (const recipient of recipients) {
        const result = await this.sendEmail(
          recipient.to,
          recipient.subject,
          recipient.htmlBody,
          recipient.textBody
        );
        results.push(result);
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk emails: ${error.message}`, error.stack);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateName: string,
    templateData: Record<string, any>
  ) {
    try {
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
      };

      const result = await this.sesClient.sendTemplatedEmail(params).promise();
      this.logger.log(`Templated email sent successfully to ${to}, MessageId: ${result.MessageId}`);
      
      // Log the successful templated email
      await this.emailTrackerService.logEmailSent({
        to,
        subject: `Template: ${templateName}`,
        content: JSON.stringify(templateData),
        provider: 'AWS_SES',
        status: 'SENT',
        messageId: result.MessageId,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to}: ${error.message}`, error.stack);
      
      // Log the failed templated email
      await this.emailTrackerService.logEmailSent({
        to,
        subject: `Template: ${templateName}`,
        content: JSON.stringify(templateData),
        provider: 'AWS_SES',
        status: 'FAILED',
        errorMessage: error.message,
      });
      
      throw new Error(`Failed to send templated email: ${error.message}`);
    }
  }

  async sendBulkTemplatedEmails(
    templateName: string,
    recipients: Array<{
      to: string;
      templateData: Record<string, any>;
    }>
  ) {
    try {
      const results = [];
      
      // Similar to regular emails, we need to send templated emails one by one
      for (const recipient of recipients) {
        const result = await this.sendTemplatedEmail(
          recipient.to,
          templateName,
          recipient.templateData
        );
        results.push(result);
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk templated emails: ${error.message}`, error.stack);
      throw new Error(`Failed to send bulk templated emails: ${error.message}`);
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }
}