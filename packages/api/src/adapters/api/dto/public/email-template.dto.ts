import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator'
import { BATCH_SIZE, ID_LENGTH } from '../constants'
import { EmailTemplateExportTypeValidator } from '../private/domain.dto'

export class CreateEmailTemplateExportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @Validate(EmailTemplateExportTypeValidator)
  @IsNotEmpty()
  format: 'html' | 'mjml'

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(BATCH_SIZE)
  languageIds: string[] | undefined
}
