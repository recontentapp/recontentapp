import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsHexColor,
  IsIn,
  MaxLength,
} from 'class-validator'
import { ID_LENGTH, LONG_TEXT_LENGTH, KEY_LENGTH } from '../constants'

export class CreateProjectTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(KEY_LENGTH)
  key: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(KEY_LENGTH)
  value: string

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string

  @IsString()
  @IsOptional()
  @MaxLength(LONG_TEXT_LENGTH)
  description: string | undefined | null
}

export class UpdateProjectTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  tagId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(KEY_LENGTH)
  key: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(KEY_LENGTH)
  value: string

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string

  @IsString()
  @IsOptional()
  @MaxLength(LONG_TEXT_LENGTH)
  description: string | undefined | null
}

export class ApplyTagsToPhraseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  phraseId: string

  @IsArray()
  @IsNotEmpty()
  tagIds: string[]
}

export class BatchApplyProjectTagDto {
  @IsArray()
  tagIds: string[]

  @IsString()
  @IsNotEmpty()
  @IsIn(['phrase'])
  recordType: 'phrase'

  @IsArray()
  @IsNotEmpty()
  recordIds: string[]
}

export class DeleteProjectTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  tagId: string
}
