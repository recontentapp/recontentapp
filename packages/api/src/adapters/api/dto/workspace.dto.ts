import { WorkspaceAccountRole } from '@prisma/client'
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
  ValidateNested,
} from 'class-validator'
import { LanguageLocale } from 'src/modules/workspace/locale'
import { LanguageLocaleValidator } from './domain.dto'

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  key: string

  @IsString()
  @IsNotEmpty()
  name: string
}

export class InviteToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
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
  invitationCode: string
}

export class CreateWorkspaceServiceAccountDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(WorkspaceAccountRole)
  role: WorkspaceAccountRole
}

class Language {
  @IsString()
  @IsNotEmpty()
  name: string

  @Validate(LanguageLocaleValidator)
  @IsNotEmpty()
  locale: LanguageLocale
}

export class AddLanguagesToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  languages: Language[]
}
