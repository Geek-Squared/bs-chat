import { Controller, Post, Body, HttpStatus, HttpCode, Get, Query } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { SendSmsDto, SendBulkSmsDto } from './dto/send-sms.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sms')
export class SmsController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    const { to, body, from } = sendSmsDto;
    const result = await this.twilioService.sendSms(to, body, from);
    return {
      success: true,
      message: 'SMS sent successfully',
      data: {
        sid: result.sid,
        status: result.status,
        to: result.to,
      },
    };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async sendBulkSms(@Body() sendBulkSmsDto: SendBulkSmsDto) {
    const { recipients, body, from } = sendBulkSmsDto;
    const results = await this.twilioService.sendBulkSms(
      recipients,
      body,
      from,
    );

    const successCount = results.filter(r => !('error' in r)).length;
    const errorCount = results.length - successCount;

    return {
      success: true,
      message: `Bulk SMS sent: ${successCount} successful, ${errorCount} failed`,
      data: {
        total: results.length,
        successful: successCount,
        failed: errorCount,
        results: results.map(r => 
          'error' in r
            ? { success: false, error: r.error, to: r.to }
            : { success: true, sid: r.sid, status: r.status, to: r.to }
        ),
      },
    };
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  async sendSmsTemplate(
    @Body() body: { to: string; templateId: string; variables: Record<string, string>; from?: string },
  ) {
    const { to, templateId, variables, from } = body;
    const result = await this.twilioService.sendSmsTemplate(to, templateId, variables, from);
    return {
      success: true,
      message: 'Template SMS sent successfully',
      data: {
        sid: result.sid,
        status: result.status,
        to: result.to,
      },
    };
  }

  @Post('bulk-template')
  @HttpCode(HttpStatus.OK)
  async sendBulkSmsTemplate(
    @Body() body: { recipients: Array<{ to: string; variables: Record<string, string> }>; templateId: string; from?: string },
  ) {
    const { recipients, templateId, from } = body;
    const results = await this.twilioService.sendBulkSmsTemplate(recipients, templateId, from);

    const successCount = results.filter(r => !('error' in r)).length;
    const errorCount = results.length - successCount;

    return {
      success: true,
      message: `Bulk template SMS sent: ${successCount} successful, ${errorCount} failed`,
      data: {
        total: results.length,
        successful: successCount,
        failed: errorCount,
        results: results.map(r => 
          'error' in r
            ? { success: false, error: r.error, to: r.to }
            : { success: true, sid: r.sid, status: r.status, to: r.to }
        ),
      },
    };
  }

  @Get('logs')
  async getSmsLogs(
    @Query('to') to?: string,
    @Query('from') from?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const where: any = { type: 'SMS' };
    
    if (to) where.to = to;
    if (from) where.from = from;
    if (status) where.status = status;
    
    const logs = await this.prismaService.messageLog.findMany({
      where,
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
      orderBy: { createdAt: 'desc' },
    });
    
    const count = await this.prismaService.messageLog.count({ where });
    
    return {
      success: true,
      data: {
        logs,
        total: count,
      },
    };
  }
}