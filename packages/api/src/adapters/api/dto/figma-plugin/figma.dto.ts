import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsNullable, OneOf } from 'src/utils/class-validator'

export class CreateFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string

  @IsString()
  @IsNotEmpty()
  url: string

  @IsString()
  @IsNotEmpty()
  name: string
}

export class CreateFigmaTextAndCreatePhrase {
  @IsString()
  @IsNullable()
  phraseKey: string | null

  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  textNodeId: string

  @IsString()
  @IsNotEmpty()
  pageNodeId: string
}

export class CreateFigmaTextAndConnectPhrase {
  @IsString()
  @IsNotEmpty()
  phraseId: string

  @IsString()
  @IsNotEmpty()
  textNodeId: string

  @IsString()
  @IsNotEmpty()
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
  content: string
}

export class UpdateFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  languageId: string
}
