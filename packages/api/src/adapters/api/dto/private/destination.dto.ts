import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { FileFormatValidator } from './domain.dto'

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

export class CreateAWSS3DestinationDto {
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

  @IsString()
  @IsOptional()
  objectsPrefix?: string

  @IsString()
  @IsNotEmpty()
  awsRegion: string

  @IsString()
  @IsNotEmpty()
  awsBucketId: string

  @IsString()
  @IsNotEmpty()
  awsAccessKeyId: string

  @IsString()
  @IsNotEmpty()
  awsSecretAccessKey: string
}

export class CreateGoogleCloudStorageDestinationDto {
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

  @IsString()
  @IsOptional()
  objectsPrefix?: string

  @IsString()
  @IsNotEmpty()
  googleCloudProjectId: string

  @IsString()
  @IsNotEmpty()
  googleCloudBucketId: string

  @IsString()
  @IsNotEmpty()
  googleCloudServiceAccountKey: string
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
