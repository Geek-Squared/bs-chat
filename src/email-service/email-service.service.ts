import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    if (!apiKey) {
      this.logger.warn('SendGrid API key is not set');
    } else {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const msg = {
        to,
        from: this.configService.get<string>('sendgrid.from'),
        subject,
        text: text || this.stripHtml(html),
        html,
      };

      const response = await sgMail.send(msg);
      return response;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendBulkEmails(
    recipients: Array<{
      to: string;
      subject: string;
      html: string;
      text?: string;
    }>,
  ) {
    try {
      const messages = recipients.map((recipient) => ({
        to: recipient.to,
        from: this.configService.get<string>('sendgrid.from'),
        subject: recipient.subject,
        text: recipient.text || this.stripHtml(recipient.html),
        html: recipient.html,
      }));

      const response = await sgMail.send(messages);
      return response;
    } catch (error) {
      this.logger.error(`Error sending bulk emails: ${error.message}`, error.stack);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateId: string,
    dynamicTemplateData: Record<string, any>,
  ) {
    try {
      const msg = {
        to,
        from: this.configService.get<string>('sendgrid.from'),
        templateId,
        dynamicTemplateData,
      };

      const response = await sgMail.send(msg);
      return response;
    } catch (error) {
      this.logger.error(`Error sending templated email: ${error.message}`, error.stack);
      throw new Error(`Failed to send templated email: ${error.message}`);
    }
  }

  async sendBulkTemplatedEmails(
    recipients: Array<{
      to: string;
      dynamicTemplateData: Record<string, any>;
    }>,
    templateId: string,
  ) {
    try {
      const messages = recipients.map((recipient) => ({
        to: recipient.to,
        from: this.configService.get<string>('sendgrid.from'),
        templateId,
        dynamicTemplateData: recipient.dynamicTemplateData,
      }));

      const response = await sgMail.send(messages);
      return response;
    } catch (error) {
      this.logger.error(`Error sending bulk templated emails: ${error.message}`, error.stack);
      throw new Error(`Failed to send bulk templated emails: ${error.message}`);
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }
}