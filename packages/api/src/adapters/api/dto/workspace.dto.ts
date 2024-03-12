import { WorkspaceAccountRole } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator'

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
