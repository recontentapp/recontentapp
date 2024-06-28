import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { ID_LENGTH, TEXT_LENGTH } from '../constants'

export class CreateGlossaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @MaxLength(TEXT_LENGTH)
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}

export class UpdateGlossaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  description?: string
}

export class DeleteGlossaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string
}

export class LinkGlossaryWithProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string
}

export class UnlinkGlossaryFromProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string
}

class Translation {
  @IsString()
  @MaxLength(ID_LENGTH)
  @IsNotEmpty()
  languageId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  content: string
}

export class CreateGlossaryTermDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @MaxLength(TEXT_LENGTH)
  @IsOptional()
  description?: string

  @IsBoolean()
  forbidden: boolean

  @IsBoolean()
  caseSensitive: boolean

  @IsBoolean()
  nonTranslatable: boolean

  @IsArray()
  @ValidateNested({ each: true })
  translations: Translation[]
}

export class UpdateGlossaryTermDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @MaxLength(TEXT_LENGTH)
  @IsOptional()
  description?: string

  @IsBoolean()
  forbidden: boolean

  @IsBoolean()
  caseSensitive: boolean

  @IsBoolean()
  nonTranslatable: boolean

  @IsArray()
  @ValidateNested({ each: true })
  translations: Translation[]
}

export class DeleteGlossaryTermDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string
}
