import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { IsNullable } from 'src/utils/class-validator'
import { FileFormatValidator } from './domain.dto'

export class CreatePhraseDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  key: string
}

export class UpdatePhraseKeyDto {
  @IsString()
  @IsNotEmpty()
  phraseId: string

  @IsString()
  @IsNotEmpty()
  key: string
}

class Translation {
  @IsString()
  @IsNotEmpty()
  languageId: string

  @IsString()
  content: string
}

export class TranslatePhraseDto {
  @IsString()
  @IsNotEmpty()
  phraseId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  translations: Translation[]
}

export class AutoTranslatePhraseDto {
  @IsString()
  @IsNotEmpty()
  phraseId: string

  @IsString()
  @IsNotEmpty()
  languageId: string
}

export class DeletePhraseDto {
  @IsString()
  @IsNotEmpty()
  phraseId: string
}

export class BatchDeletePhraseDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[]
}

export class ImportPhrasesDto {
  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string

  @IsString()
  @IsOptional()
  tagIds: string

  @IsString()
  @IsOptional()
  mappingSheetName?: string

  @IsNumberString()
  @IsOptional()
  mappingRowStartIndex?: string

  @IsNumberString()
  @IsOptional()
  mappingKeyColumnIndex?: string

  @IsNumberString()
  @IsOptional()
  mappingTranslationColumnIndex?: string
}

export class GeneratePhrasesExportLinkDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string

  @IsArray()
  @IsNullable()
  containsTagIds: string[] | null

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsBoolean()
  includeEmptyTranslations: boolean
}
