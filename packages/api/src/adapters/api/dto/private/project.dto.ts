import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { ID_LENGTH, LONG_TEXT_LENGTH, TEXT_LENGTH } from '../constants'

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(LONG_TEXT_LENGTH)
  description: string | undefined | null

  @IsArray()
  @IsNotEmpty()
  languageIds: string[]
}

export class UpdateProjectDto {
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
  @MaxLength(LONG_TEXT_LENGTH)
  description: string | undefined | null
}

export class AddLanguagesToProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string

  @IsArray()
  @IsNotEmpty()
  languageIds: string[]
}

export class DeleteProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string
}
