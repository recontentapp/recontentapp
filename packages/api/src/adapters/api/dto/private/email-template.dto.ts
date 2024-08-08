import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { ID_LENGTH, LONG_TEXT_LENGTH, TEXT_LENGTH } from '../constants'

class Variable {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(LONG_TEXT_LENGTH)
  defaultContent: string

  @IsObject()
  translations: Record<string, string>
}

export class CreateLayoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  description?: string

  @IsString()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variable)
  variables: Variable[]
}

export class UpdateLayoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  description?: string

  @IsString()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variable)
  variables: Variable[]
}

export class DeleteLayoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  projectId: string

  @IsString()
  @IsOptional()
  @MaxLength(ID_LENGTH)
  layoutId?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  description?: string

  @IsString()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variable)
  variables: Variable[]
}

export class UpdateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string

  @IsString()
  @IsOptional()
  @MaxLength(ID_LENGTH)
  layoutId?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  key: string

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  description?: string

  @IsString()
  @MaxLength(LONG_TEXT_LENGTH)
  content: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variable)
  variables: Variable[]
}

export class DeleteTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  id: string
}
