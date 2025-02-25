import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { FieldType } from 'src/enums/field-type.enum';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  question: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fieldName: string;

  @IsEnum(FieldType)
  @IsOptional()
  fieldType: FieldType;

  @IsOptional()
  @IsString()
  description?: string;
}