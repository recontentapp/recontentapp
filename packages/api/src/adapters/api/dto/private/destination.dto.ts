import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator'
import { Components } from 'src/generated/typeDefinitions'
import { ID_LENGTH, TEXT_LENGTH } from '../constants'
import {
  DestinationSyncFrequencyValidator,
  FileFormatValidator,
} from './domain.dto'

export class CreateCDNDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @Validate(DestinationSyncFrequencyValidator)
  @IsNotEmpty()
  syncFrequency: Components.Schemas.DestinationSyncFrequency

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @IsBoolean()
  includeEmptyTranslations: boolean
}

export class CreateGithubDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @Validate(DestinationSyncFrequencyValidator)
  @IsNotEmpty()
  syncFrequency: Components.Schemas.DestinationSyncFrequency

  @IsBoolean()
  includeEmptyTranslations: boolean

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  objectsPrefix?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  installationId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  repositoryName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  repositoryOwner: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  baseBranchName: string
}

export class CreateAWSS3DestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @Validate(DestinationSyncFrequencyValidator)
  @IsNotEmpty()
  syncFrequency: Components.Schemas.DestinationSyncFrequency

  @IsBoolean()
  includeEmptyTranslations: boolean

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  objectsPrefix?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  awsRegion: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  awsBucketId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  awsAccessKeyId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  awsSecretAccessKey: string
}

export class CreateGoogleCloudStorageDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  revisionId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  name: string

  @Validate(FileFormatValidator)
  @IsNotEmpty()
  fileFormat: Components.Schemas.FileFormat

  @Validate(DestinationSyncFrequencyValidator)
  @IsNotEmpty()
  syncFrequency: Components.Schemas.DestinationSyncFrequency

  @IsBoolean()
  includeEmptyTranslations: boolean

  @IsString()
  @IsOptional()
  @MaxLength(TEXT_LENGTH)
  objectsPrefix?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  googleCloudProjectId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  googleCloudBucketId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  googleCloudServiceAccountKey: string
}

export class DeleteDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  destinationId: string
}

export class SyncDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  destinationId: string
}
