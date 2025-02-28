import { IsString, IsEmail, IsOptional, IsObject, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class SendAwsEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  htmlBody: string;

  @IsString()
  @IsOptional()
  textBody?: string;
}

export class SendAwsTemplatedEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  templateName: string;

  @IsObject()
  templateData: Record<string, any>;
}

export class AwsBulkRecipientDto {
  @IsEmail()
  to: string;

  @IsObject()
  templateData: Record<string, any>;
}

export class SendAwsBulkTemplatedEmailDto {
  @IsString()
  templateName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => AwsBulkRecipientDto)
  recipients: AwsBulkRecipientDto[];
}

export class AwsBulkEmailRecipientDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  htmlBody: string;

  @IsString()
  @IsOptional()
  textBody?: string;
}

export class SendAwsBulkEmailsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => AwsBulkEmailRecipientDto)
  recipients: AwsBulkEmailRecipientDto[];
}