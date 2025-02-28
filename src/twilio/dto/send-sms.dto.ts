import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  from?: string;
}

export class BulkSmsRecipientDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsOptional()
  body?: string;
}

export class SendBulkSmsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSmsRecipientDto)
  recipients: BulkSmsRecipientDto[];

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  from?: string;
}