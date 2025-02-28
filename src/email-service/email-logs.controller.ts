import { Controller, Get, Query, Logger } from '@nestjs/common';
import { EmailTrackerService } from './email-tracker.service';

@Controller('email-logs')
export class EmailLogsController {
  private readonly logger = new Logger(EmailLogsController.name);
  
  constructor(private emailTrackerService: EmailTrackerService) {}

  @Get()
  async getEmailLogs(
    @Query('email') recipientEmail?: string,
    @Query('status') status?: 'SENT' | 'FAILED',
    @Query('provider') provider?: 'AWS_SES' | 'SENDGRID',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    this.logger.log('Getting email logs with filters');
    
    const filters: any = {};
    
    if (recipientEmail) {
      filters.recipientEmail = recipientEmail;
    }
    
    if (status && (status === 'SENT' || status === 'FAILED')) {
      filters.status = status;
    }
    
    if (provider && (provider === 'AWS_SES' || provider === 'SENDGRID')) {
      filters.provider = provider;
    }
    
    if (fromDate) {
      filters.fromDate = new Date(fromDate);
    }
    
    if (toDate) {
      filters.toDate = new Date(toDate);
    }
    
    return this.emailTrackerService.getEmailLogs(filters);
  }
}