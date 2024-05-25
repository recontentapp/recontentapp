import { WorkspaceAccountRole } from '@prisma/client'
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator'
import { LanguageLocale } from 'src/modules/workspace/locale'
import { LanguageLocaleValidator } from './domain.dto'
import { ID_LENGTH, KEY_LENGTH, TEXT_LENGTH } from '../constants'

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(KEY_LENGTH)
  key: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string
}

export class InviteToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(WorkspaceAccountRole)
  role: WorkspaceAccountRole
}

export class JoinWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  invitationCode: string
}

export class GenerateUserWorkspaceAccountAPIKeyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}

export class CreateWorkspaceServiceAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(WorkspaceAccountRole)
  role: WorkspaceAccountRole
}

export class DeleteWorkspaceServiceAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string
}

class Language {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @Validate(LanguageLocaleValidator)
  @IsNotEmpty()
  locale: LanguageLocale
}

export class AddLanguagesToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  languages: Language[]
}
