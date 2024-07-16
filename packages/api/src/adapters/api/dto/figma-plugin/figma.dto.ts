import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { IsNullable, OneOf } from 'src/utils/class-validator'
import { ID_LENGTH, LONG_TEXT_LENGTH, TEXT_LENGTH } from '../constants'

export class CreateFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  languageId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  url: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string
}

export class CreateFigmaTextAndCreatePhrase {
  @IsString()
  @IsNullable()
  @MaxLength(TEXT_LENGTH)
  phraseKey: string | null

  @IsString()
  @IsNotEmpty()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  textNodeId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  pageNodeId: string
}

export class CreateFigmaTextAndConnectPhrase {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  phraseId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  textNodeId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  pageNodeId: string
}

export class CreateFigmaTextDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @OneOf([
    () => CreateFigmaTextAndCreatePhrase,
    () => CreateFigmaTextAndConnectPhrase,
  ])
  items: Array<CreateFigmaTextAndCreatePhrase | CreateFigmaTextAndConnectPhrase>
}

export class UpdateFigmaTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string
}

export class UpdateFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  languageId: string
}

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(LONG_TEXT_LENGTH)
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

export class RewriteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(LONG_TEXT_LENGTH)
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
