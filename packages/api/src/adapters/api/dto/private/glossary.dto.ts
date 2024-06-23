import {
  ArrayMaxSize,
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

class TermToCreate {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  groupId: string

  @IsString()
  @MaxLength(ID_LENGTH)
  @IsOptional()
  languageId?: string

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
}

export class BatchCreateGlossaryTermsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  terms: TermToCreate[]
}

class TermToUpdate {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  groupId: string

  @IsString()
  @MaxLength(ID_LENGTH)
  @IsOptional()
  languageId?: string

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
}

export class BatchUpdateGlossaryTermsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  terms: TermToUpdate[]
}

export class BatchDeleteGlossaryTermsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  glossaryId: string

  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(50)
  ids: string[]
}
