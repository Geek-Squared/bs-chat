import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email-service.service';
import { EmailServiceController } from './email-service.controller';
import { AwsSesService } from './aws-ses.service';
import { AwsSesController } from './aws-ses.controller';
import { EmailTrackerService } from './email-tracker.service';
import { EmailLogsController } from './email-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import awsConfig from '../config/aws.config';

@Module({
  imports: [
    ConfigModule.forFeature(awsConfig),
    PrismaModule
  ],
  controllers: [EmailServiceController, AwsSesController, EmailLogsController],
  providers: [EmailService, AwsSesService, EmailTrackerService],
  exports: [EmailService, AwsSesService, EmailTrackerService],
})
export class EmailServiceModule {}