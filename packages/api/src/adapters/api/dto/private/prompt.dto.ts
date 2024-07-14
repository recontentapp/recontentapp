import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { ID_LENGTH, TEXT_LENGTH } from '../constants'
import { PromptLengthValidator, PromptToneValidator } from './domain.dto'

export class CreatePromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @IsString()
  @MaxLength(TEXT_LENGTH)
  @IsOptional()
  description?: string

  @IsString()
  @MaxLength(ID_LENGTH)
  @IsOptional()
  glossaryId?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string

  @Validate(PromptToneValidator)
  @IsOptional()
  tone?: Components.Schemas.PromptTone

  @Validate(PromptLengthValidator)
  @IsOptional()
  length?: Components.Schemas.PromptLength

  @IsArray()
  @IsString({ each: true })
  @MaxLength(TEXT_LENGTH, { each: true })
  customInstructions: string[]
}

export class UpdatePromptDto {
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

  @IsString()
  @MaxLength(ID_LENGTH)
  @IsOptional()
  glossaryId?: string

  @Validate(PromptToneValidator)
  @IsOptional()
  tone?: Components.Schemas.PromptTone

  @Validate(PromptLengthValidator)
  @IsOptional()
  length?: Components.Schemas.PromptLength

  @IsArray()
  @IsString({ each: true })
  @MaxLength(TEXT_LENGTH, { each: true })
  customInstructions: string[]
}

export class DeletePromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  promptId: string
}

export class LinkPromptWithProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  promptId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string
}

export class UnlinkPromptFromProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  promptId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string
}
