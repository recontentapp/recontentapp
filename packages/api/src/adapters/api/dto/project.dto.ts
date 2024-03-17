import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  workspaceId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description: string | undefined | null

  @IsArray()
  @IsNotEmpty()
  languageIds: string[]
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description: string | undefined | null
}

export class AddLanguagesToProjectDto {
  @IsString()
  @IsNotEmpty()
  projectId: string

  @IsArray()
  @IsNotEmpty()
  languageIds: string[]
}

export class DeleteProjectDto {
  @IsString()
  @IsNotEmpty()
  projectId: string
}
