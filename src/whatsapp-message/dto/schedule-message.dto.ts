import { IsString, IsNotEmpty, IsDateString, IsObject, ValidateNested, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleMessageDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  @IsOptional()
  variables: Record<string, string> = {};

  @IsDateString()
  scheduledTime: string;
}

export class UpdateScheduledMessageDto {
  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;

  @IsDateString()
  @IsOptional()
  scheduledTime?: string;
}

export class BulkScheduleMessageDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleMessageDto)
  messages: ScheduleMessageDto[];
}

export class BulkSendMessageDto {
  messages: {
    phoneNumber: string;
    templateId: string;
    parameters?: Record<string, string>;
  }[];
}

export class DirectBulkSendMessageDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @IsString()
  messages: {
    phoneNumber: string;
    message: string;
  }[];
  
}