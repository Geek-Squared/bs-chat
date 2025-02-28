import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailTrackerService {
  private readonly logger = new Logger(EmailTrackerService.name);

  constructor(private prisma: PrismaService) {}

  async logEmailSent(data: {
    to: string;
    subject: string;
    content: string;
    provider: 'AWS_SES' | 'SENDGRID';
    status: 'SENT' | 'FAILED';
    messageId?: string;
    errorMessage?: string;
  }) {
    try {
      // Check if the emailLogs table exists in schema
      const emailLog = await this.prisma.emailLog.create({
        data: {
          recipientEmail: data.to,
          subject: data.subject,
          content: data.content,
          provider: data.provider,
          status: data.status,
          messageId: data.messageId,
          errorMessage: data.errorMessage,
        },
      });
      return emailLog;
    } catch (error) {
      this.logger.error(`Failed to log email: ${error.message}`);
      // Don't throw error, just log it and continue
      return null;
    }
  }

  async getEmailLogs(filters?: {
    recipientEmail?: string;
    status?: 'SENT' | 'FAILED';
    provider?: 'AWS_SES' | 'SENDGRID';
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: any = {};

    if (filters?.recipientEmail) {
      where.recipientEmail = filters.recipientEmail;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.provider) {
      where.provider = filters.provider;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      
      if (filters?.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      
      if (filters?.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    return this.prisma.emailLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}