import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { FieldType } from 'src/enums/field-type.enum';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @IsEnum(FieldType)
  fieldType: FieldType;

  @IsOptional()
  @IsString()
  description?: string;
}