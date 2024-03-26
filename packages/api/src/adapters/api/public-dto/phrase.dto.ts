import { IsNotEmpty, IsString } from 'class-validator'

export class CreatePhraseExportDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string
}
