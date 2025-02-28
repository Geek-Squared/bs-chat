import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleSmsDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;
}

export class ScheduleSmsTemplateDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsNotEmpty()
  variables: Record<string, string>;

  @IsString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;
}

export class BulkScheduleSmsRecipientDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsOptional()
  body?: string;
}

export class BulkScheduleSmsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScheduleSmsRecipientDto)
  recipients: BulkScheduleSmsRecipientDto[];

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;
}

export class BulkScheduleSmsTemplateRecipientDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  variables: Record<string, string>;
}

export class BulkScheduleSmsTemplateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScheduleSmsTemplateRecipientDto)
  recipients: BulkScheduleSmsTemplateRecipientDto[];

  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;
}