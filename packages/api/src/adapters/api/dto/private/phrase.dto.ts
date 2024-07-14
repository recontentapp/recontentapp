import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { IsNullable } from 'src/utils/class-validator'
import {
  BATCH_SIZE,
  ID_LENGTH,
  LONG_TEXT_LENGTH,
  TEXT_LENGTH,
} from '../constants'
import { FileFormatValidator } from './domain.dto'

export class CreatePhraseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string
}

export class UpdatePhraseKeyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  phraseId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string
}

class Translation {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  languageId: string

  @IsString()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string
}

export class TranslatePhraseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  phraseId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  translations: Translation[]
}

export class BatchAutoTranslatePhrasesDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(BATCH_SIZE)
  phraseIds: string[]

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  sourceLanguageId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  targetLanguageId: string
}

export class AutotranslateDto {
  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  sourceLanguageId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  targetLanguageId: string
}

export class RewritePhraseTranslationDto {
  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  sourceLanguageId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  promptId: string
}

export class DeletePhraseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  phraseId: string
}

export class BatchDeletePhraseDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(BATCH_SIZE)
  ids: string[]
}

export class ImportPhrasesDto {
  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  languageId: string

  @IsString()
  @IsOptional()
  tagIds: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  mappingSheetName?: string

  @IsNumberString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  mappingRowStartIndex?: string

  @IsNumberString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  mappingKeyColumnIndex?: string

  @IsNumberString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  mappingTranslationColumnIndex?: string
}

export class GeneratePhrasesExportLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
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
