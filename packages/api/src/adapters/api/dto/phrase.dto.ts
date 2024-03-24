import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

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
