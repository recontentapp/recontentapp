import { IsBoolean, IsNotEmpty, IsString, Validate } from 'class-validator'
import { FileFormatValidator } from './domain.dto'
import { Components } from 'src/generated/typeDefinitions'

export class CreateCDNDestinationDto {
  @IsString()
  @IsNotEmpty()
  revisionId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsBoolean()
  includeEmptyTranslations: boolean
}

export class DeleteDestinationDto {
  @IsString()
  @IsNotEmpty()
  destinationId: string
}

export class SyncDestinationDto {
  @IsString()
  @IsNotEmpty()
  destinationId: string
}
