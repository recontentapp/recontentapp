import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsHexColor,
  IsIn,
} from 'class-validator'

export class CreateProjectTagDto {
  @IsString()
  @IsNotEmpty()
  projectId: string

  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string

  @IsString()
  @IsOptional()
  description: string | undefined | null
}

export class UpdateProjectTagDto {
  @IsString()
  @IsNotEmpty()
  tagId: string

  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string

  @IsString()
  @IsHexColor()
  @IsNotEmpty()
  color: string

  @IsString()
  @IsOptional()
  description: string | undefined | null
}

export class ApplyTagsToPhraseDto {
  @IsString()
  @IsNotEmpty()
  phraseId: string

  @IsArray()
  @IsNotEmpty()
  tagIds: string[]
}

export class BatchApplyProjectTagDto {
  @IsString()
  @IsNotEmpty()
  tagId: string

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
  tagId: string
}
