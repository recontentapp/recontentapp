import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePhraseExportDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  languageId: string

  @IsArray()
  @IsOptional()
  containsTagIds: string[] | undefined
}
