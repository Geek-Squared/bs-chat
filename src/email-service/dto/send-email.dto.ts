import { IsString, IsEmail, IsOptional, IsObject, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class SendTemplatedEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  templateId: string;

  @IsObject()
  dynamicTemplateData: Record<string, any>;
}

export class BulkRecipientDto {
  @IsEmail()
  to: string;

  @IsObject()
  dynamicTemplateData: Record<string, any>;
}

export class SendBulkTemplatedEmailDto {
  @IsString()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkRecipientDto)
  recipients: BulkRecipientDto[];
}

export class BulkEmailRecipientDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class SendBulkEmailsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkEmailRecipientDto)
  recipients: BulkEmailRecipientDto[];
}