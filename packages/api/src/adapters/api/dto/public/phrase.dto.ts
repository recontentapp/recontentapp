import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { ID_LENGTH } from '../constants'

export class CreatePhraseExportDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  languageId: string

  @IsArray()
  @IsOptional()
  containsTagIds: string[] | undefined
}
