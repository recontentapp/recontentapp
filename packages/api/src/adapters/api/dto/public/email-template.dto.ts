import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator'
import { ID_LENGTH } from '../constants'
import { EmailTemplateExportTypeValidator } from '../private/domain.dto'

export class CreateEmailTemplateExportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  templateId: string

  @Validate(EmailTemplateExportTypeValidator)
  @IsNotEmpty()
  format: 'html' | 'mjml'

  @IsArray()
  @IsOptional()
  languageIds: string[] | undefined
}
