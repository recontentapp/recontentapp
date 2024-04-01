import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator'
import { FileFormatValidator } from './domain.dto'
import { Components } from 'src/generated/typeDefinitions'

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
  mappingSheetName?: string

  @IsNumber()
  @IsOptional()
  mappingRowStartIndex?: number

  @IsNumber()
  @IsOptional()
  mappingKeyColumnIndex?: number

  @IsNumber()
  @IsOptional()
  mappingTranslationColumnIndex?: number
}

export class GeneratePhrasesExportLinkDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsBoolean()
  includeEmptyTranslations: boolean
}
