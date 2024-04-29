import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { JSONService } from '../io/json.service'
import { CSVService } from '../io/csv.service'
import { YAMLService } from '../io/yaml.service'
import { ExcelService } from '../io/excel.service'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { Components } from 'src/generated/typeDefinitions'
import {
  DeleteObjectsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Storage as GoogleCloudStorage } from '@google-cloud/storage'
import { fileFormatContentType, fileFormatExtensions } from '../io/fileFormat'
import { PaginationParams } from 'src/utils/pagination'
import {
  Destination,
  DestinationConfigAWSS3,
  DestinationConfigCDN,
  DestinationConfigGoogleCloudStorage,
  Prisma,
  Workspace,
} from '@prisma/client'
import { decrypt, encrypt } from 'src/utils/security'
import { Requester } from '../auth/requester.object'

interface CreateCDNDestinationParams {
  name: string
  revisionId: string
  requester: Requester
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

interface CreateAWSS3DestinationParams {
  name: string
  revisionId: string
  requester: Requester
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
  objectsPrefix?: string
  awsRegion: string
  awsBucketId: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
}

interface CreateGoogleCloudStorageDestinationParams {
  name: string
  revisionId: string
  requester: Requester
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
  objectsPrefix?: string
  googleCloudProjectId: string
  googleCloudBucketId: string
  googleCloudServiceAccountKey: string
}

interface SyncDestinationParams {
  destinationId: string
  requester: Requester
}

interface DeleteDestinationParams {
  destinationId: string
  requester: Requester
}

interface GetDestinationParams {
  destinationId: string
  requester: Requester
}

interface ListDestinationsParams {
  pagination: PaginationParams
  requester: Requester
  projectId: string
  revisionId?: string
}

@Injectable()
export class DestinationService {
  constructor(
    private prismaService: PrismaService,
    private csvService: CSVService,
    private jsonService: JSONService,
    private yamlService: YAMLService,
    private excelService: ExcelService,
    private configService: ConfigService<Config, true>,
  ) {}

  private async getData({
    revisionId,
    languageId,
    fileFormat,
    includeEmptyTranslations,
  }: {
    revisionId: string
    languageId: string
    fileFormat: Components.Schemas.FileFormat
    includeEmptyTranslations: boolean
  }) {
    const phrases = await this.prismaService.phrase.findMany({
      where: {
        revisionId,
      },
      select: {
        key: true,
        translations: {
          where: {
            languageId,
          },
          select: {
            content: true,
          },
        },
      },
    })

    const data = phrases.reduce<Record<string, string>>((acc, phrase) => {
      if (phrase.translations.length === 0 && !includeEmptyTranslations) {
        return acc
      }

      acc[phrase.key] = phrase.translations.at(0)?.content ?? ''

      return acc
    }, {})

    let buffer: Buffer = Buffer.from('')

    switch (fileFormat) {
      case 'json':
        buffer = this.jsonService.render(data)
        break
      case 'nested_json':
        buffer = this.jsonService.renderNested(data)
        break
      case 'csv':
        buffer = this.csvService.render(data)
        break
      case 'yaml':
        buffer = this.yamlService.render(data)
        break
      case 'nested_yaml':
        buffer = this.yamlService.renderNested(data)
        break
      case 'excel':
        buffer = await this.excelService.render(data)
        break
    }

    return buffer
  }

  async getDestination({ destinationId, requester }: GetDestinationParams) {
    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
      include: {
        configCDN: true,
        configAWSS3: true,
        configGoogleCloudStorage: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      destination.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return destination
  }

  async listDestinations({
    projectId,
    requester,
    revisionId,
    pagination,
  }: ListDestinationsParams) {
    const project = await this.prismaService.project.findUniqueOrThrow({
      where: { id: projectId },
      include: {
        revisions: true,
      },
    })
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      project.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const where: Prisma.DestinationWhereInput = {
      revisionId: revisionId ?? {
        in: project.revisions.map(revision => revision.id),
      },
    }

    const { limit, offset, pageSize, page } = pagination
    const [destinations, count] = await Promise.all([
      this.prismaService.destination.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.destination.count({
        where,
      }),
    ])

    return {
      items: destinations,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createCDNDestination({
    name,
    revisionId,
    requester,
    fileFormat,
    includeEmptyTranslations,
  }: CreateCDNDestinationParams) {
    const isAvailable = this.configService.get('cdn.available', { infer: true })
    if (!isAvailable) {
      throw new BadRequestException('CDN is not available')
    }

    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    const destination = await this.prismaService.destination.create({
      include: {
        configCDN: true,
        configAWSS3: true,
        configGoogleCloudStorage: true,
      },
      data: {
        name,
        revisionId,
        type: 'cdn',
        active: true,
        workspaceId: revision.workspaceId,
        createdBy: workspaceAccess.getAccountID(),
        configCDN: {
          create: {
            fileFormat,
            includeEmptyTranslations,
            workspaceId: revision.workspaceId,
          },
        },
      },
    })

    return destination
  }

  async createAWSS3Destination({
    name,
    revisionId,
    requester,
    fileFormat,
    includeEmptyTranslations,
    objectsPrefix,
    awsRegion,
    awsAccessKeyId,
    awsBucketId,
    awsSecretAccessKey,
  }: CreateAWSS3DestinationParams) {
    const encryptionKey = this.configService.get('security.encryptionKey', {
      infer: true,
    })

    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    const destination = await this.prismaService.destination.create({
      include: {
        configCDN: true,
        configAWSS3: true,
        configGoogleCloudStorage: true,
      },
      data: {
        name,
        revisionId,
        type: 'aws_s3',
        active: true,
        workspaceId: revision.workspaceId,
        createdBy: workspaceAccess.getAccountID(),
        configAWSS3: {
          create: {
            fileFormat,
            includeEmptyTranslations,
            workspaceId: revision.workspaceId,
            objectsPrefix,
            awsRegion: awsRegion,
            awsBucketId: awsBucketId,
            awsAccessKeyId: encrypt(awsAccessKeyId, encryptionKey),
            awsSecretAccessKey: encrypt(awsSecretAccessKey, encryptionKey),
          },
        },
      },
    })

    return destination
  }

  async createGoogleCloudStorageDestination({
    name,
    revisionId,
    requester,
    fileFormat,
    includeEmptyTranslations,
    objectsPrefix,
    googleCloudBucketId,
    googleCloudServiceAccountKey,
    googleCloudProjectId,
  }: CreateGoogleCloudStorageDestinationParams) {
    const encryptionKey = this.configService.get('security.encryptionKey', {
      infer: true,
    })

    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    const destination = await this.prismaService.destination.create({
      include: {
        configCDN: true,
        configAWSS3: true,
        configGoogleCloudStorage: true,
      },
      data: {
        name,
        revisionId,
        type: 'google_cloud_storage',
        active: true,
        workspaceId: revision.workspaceId,
        createdBy: workspaceAccess.getAccountID(),
        configGoogleCloudStorage: {
          create: {
            fileFormat,
            includeEmptyTranslations,
            workspaceId: revision.workspaceId,
            objectsPrefix,
            googleCloudBucketId: googleCloudBucketId,
            googleCloudProjectId: googleCloudProjectId,
            googleCloudServiceAccountKey: encrypt(
              googleCloudServiceAccountKey,
              encryptionKey,
            ),
          },
        },
      },
    })

    return destination
  }

  async deleteDestination({
    destinationId,
    requester,
  }: DeleteDestinationParams) {
    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
      include: {
        workspace: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      destination.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    if (destination.type === 'cdn') {
      const cdnConfig = this.configService.get('cdn', { infer: true })
      if (!cdnConfig.available) {
        throw new BadRequestException('CDN is not available')
      }

      const client = new S3Client({
        region: cdnConfig.region,
        endpoint: cdnConfig.endpoint,
        credentials: {
          accessKeyId: cdnConfig.accessKeyId,
          secretAccessKey: cdnConfig.secretAccessKey,
        },
      })

      const objects = await client.send(
        new ListObjectsCommand({
          Prefix: [
            'workspaces',
            destination.workspace.key,
            destination.id,
          ].join('/'),
          Bucket: cdnConfig.bucketName,
        }),
      )

      const keys =
        objects.Contents?.map(object => object.Key!).filter(Boolean) ?? []

      if (keys.length > 0) {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: cdnConfig.bucketName,
            Delete: {
              Objects: keys.map(key => ({
                Key: key,
              })),
            },
          }),
        )
      }
    }

    await this.prismaService.$transaction(async t => {
      await t.destinationConfigAWSS3.deleteMany({
        where: { destinationId },
      })

      await t.destinationConfigCDN.deleteMany({
        where: { destinationId },
      })

      await t.destinationConfigGoogleCloudStorage.deleteMany({
        where: { destinationId },
      })

      await t.destination.delete({
        where: { id: destinationId },
      })
    })
  }

  async syncDestination({ destinationId, requester }: SyncDestinationParams) {
    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
      include: {
        workspace: true,
        configCDN: true,
        configAWSS3: true,
        configGoogleCloudStorage: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      destination.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('projects:destinations:manage')

    if (!destination.active) {
      throw new BadRequestException('Destination is not active')
    }

    const cdnConfig = this.configService.get('cdn', { infer: true })
    if (destination.type === 'cdn' && !cdnConfig?.available) {
      throw new BadRequestException('CDN is not available')
    }

    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: destination.revisionId },
        select: {
          project: {
            select: {
              languages: {
                select: {
                  id: true,
                  locale: true,
                },
              },
            },
          },
        },
      },
    )

    switch (destination.type) {
      case 'cdn':
        await this.syncCDNDestination(
          destination,
          revision,
          workspaceAccess.getAccountID(),
        )
        break
      case 'aws_s3':
        await this.syncAWSS3Destination(
          destination,
          revision,
          workspaceAccess.getAccountID(),
        )
        break
      case 'google_cloud_storage':
        await this.syncGoogleCloudStorageDestination(
          destination,
          revision,
          workspaceAccess.getAccountID(),
        )
        break
    }
  }

  private async syncAWSS3Destination(
    destination: Destination & {
      workspace: Workspace
      configCDN: DestinationConfigCDN | null
      configAWSS3: DestinationConfigAWSS3 | null
      configGoogleCloudStorage: DestinationConfigGoogleCloudStorage | null
    },
    revision: {
      project: {
        languages: {
          id: string
          locale: string
        }[]
      }
    },
    accountId: string,
  ) {
    const encryptionKey = this.configService.get('security.encryptionKey', {
      infer: true,
    })

    if (!destination.configAWSS3) {
      throw new BadRequestException('Destination has no AWS S3 configuration')
    }

    const client = new S3Client({
      region: destination.configAWSS3.awsRegion,
      /**
       * Endpoint is explicitly set to the S3 endpoint for the region
       * to avoid relying on the default endpoint resolution mechanism
       * which resolves to LocalStack during development.
       */
      endpoint: `https://s3.${destination.configAWSS3.awsRegion}.amazonaws.com`,
      credentials: {
        accessKeyId: decrypt(
          destination.configAWSS3.awsAccessKeyId,
          encryptionKey,
        ),
        secretAccessKey: decrypt(
          destination.configAWSS3.awsSecretAccessKey,
          encryptionKey,
        ),
      },
    })

    let error: string | null = null

    for (const language of revision.project.languages) {
      const buffer = await this.getData({
        revisionId: destination.revisionId,
        languageId: language.id,
        fileFormat: destination.configAWSS3
          .fileFormat as Components.Schemas.FileFormat,
        includeEmptyTranslations:
          destination.configAWSS3.includeEmptyTranslations,
      })

      const extension =
        fileFormatExtensions[
          destination.configAWSS3.fileFormat as Components.Schemas.FileFormat
        ]

      const key = [
        (destination.configAWSS3.objectsPrefix ?? '').replace(/\/$/, ''),
        `${language.locale}${extension}`,
      ]
        .filter(Boolean)
        .join('/')

      const result = await client
        .send(
          new PutObjectCommand({
            Bucket: destination.configAWSS3.awsBucketId,
            ContentType:
              fileFormatContentType[
                destination.configAWSS3
                  .fileFormat as Components.Schemas.FileFormat
              ],
            Key: key,
            Body: buffer,
          }),
        )
        .catch(err => err.message ?? 'Unknown S3 error')

      if (typeof result === 'string') {
        error = result
        break
      }
    }

    if (error) {
      await this.prismaService.destination.update({
        where: { id: destination.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncError: error,
          updatedBy: accountId,
        },
      })
      throw new BadRequestException(error)
    }

    await this.prismaService.destination.update({
      where: { id: destination.id },
      data: {
        lastSyncError: null,
        lastSuccessfulSyncAt: new Date(),
        lastSyncAt: new Date(),
        updatedBy: accountId,
      },
    })
  }

  private async syncGoogleCloudStorageDestination(
    destination: Destination & {
      workspace: Workspace
      configCDN: DestinationConfigCDN | null
      configAWSS3: DestinationConfigAWSS3 | null
      configGoogleCloudStorage: DestinationConfigGoogleCloudStorage | null
    },
    revision: {
      project: {
        languages: {
          id: string
          locale: string
        }[]
      }
    },
    accountId: string,
  ) {
    const encryptionKey = this.configService.get('security.encryptionKey', {
      infer: true,
    })

    if (!destination.configGoogleCloudStorage) {
      throw new BadRequestException(
        'Destination has no Google Cloud Storage configuration',
      )
    }

    const client = new GoogleCloudStorage({
      projectId: destination.configGoogleCloudStorage.googleCloudProjectId,
      credentials: JSON.parse(
        decrypt(
          destination.configGoogleCloudStorage.googleCloudServiceAccountKey,
          encryptionKey,
        ),
      ),
    })

    const bucketClient = client.bucket(
      destination.configGoogleCloudStorage.googleCloudBucketId,
    )

    let error: string | null = null

    for (const language of revision.project.languages) {
      const buffer = await this.getData({
        revisionId: destination.revisionId,
        languageId: language.id,
        fileFormat: destination.configGoogleCloudStorage
          .fileFormat as Components.Schemas.FileFormat,
        includeEmptyTranslations:
          destination.configGoogleCloudStorage.includeEmptyTranslations,
      })

      const extension =
        fileFormatExtensions[
          destination.configGoogleCloudStorage
            .fileFormat as Components.Schemas.FileFormat
        ]

      const key = [
        (destination.configGoogleCloudStorage.objectsPrefix ?? '').replace(
          /\/$/,
          '',
        ),
        `${language.locale}${extension}`,
      ]
        .filter(Boolean)
        .join('/')

      const result = await bucketClient
        .file(key)
        .save(buffer, {
          contentType:
            fileFormatContentType[
              destination.configGoogleCloudStorage
                .fileFormat as Components.Schemas.FileFormat
            ],
        })
        .catch(err => err.message ?? 'Unknown Google Cloud Storage error')

      if (typeof result === 'string') {
        error = result
        break
      }
    }

    if (error) {
      await this.prismaService.destination.update({
        where: { id: destination.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncError: error,
          updatedBy: accountId,
        },
      })
      throw new BadRequestException(error)
    }

    await this.prismaService.destination.update({
      where: { id: destination.id },
      data: {
        lastSyncError: null,
        lastSuccessfulSyncAt: new Date(),
        lastSyncAt: new Date(),
        updatedBy: accountId,
      },
    })
  }

  private async syncCDNDestination(
    destination: Destination & {
      workspace: Workspace
      configCDN: DestinationConfigCDN | null
      configAWSS3: DestinationConfigAWSS3 | null
      configGoogleCloudStorage: DestinationConfigGoogleCloudStorage | null
    },
    revision: {
      project: {
        languages: {
          id: string
          locale: string
        }[]
      }
    },
    accountId: string,
  ) {
    const cdnConfig = this.configService.get('cdn', { infer: true })
    if (!destination.configCDN || !cdnConfig.available) {
      throw new BadRequestException('Destination has no CDN configuration')
    }

    const client = new S3Client({
      region: cdnConfig.region,
      endpoint: cdnConfig.endpoint,
      credentials: {
        accessKeyId: cdnConfig.accessKeyId,
        secretAccessKey: cdnConfig.secretAccessKey,
      },
    })

    let error: string | null = null
    const urls: string[] = []

    for (const language of revision.project.languages) {
      const buffer = await this.getData({
        revisionId: destination.revisionId,
        languageId: language.id,
        fileFormat: destination.configCDN
          .fileFormat as Components.Schemas.FileFormat,
        includeEmptyTranslations:
          destination.configCDN.includeEmptyTranslations,
      })

      const extension =
        fileFormatExtensions[
          destination.configCDN.fileFormat as Components.Schemas.FileFormat
        ]

      const key = [
        'workspaces',
        destination.workspace.key,
        destination.id,
        `${language.locale}${extension}`,
      ].join('/')

      const result = await client
        .send(
          new PutObjectCommand({
            Bucket: cdnConfig.bucketName,
            ContentType:
              fileFormatContentType[
                destination.configCDN
                  .fileFormat as Components.Schemas.FileFormat
              ],
            Key: key,
            Body: buffer,
          }),
        )
        .catch(err => err.message ?? 'Unknown S3 error')

      if (typeof result === 'string') {
        error = result
        break
      }

      urls.push(`${cdnConfig.bucketUrl}/${key}`)
    }

    if (error) {
      await this.prismaService.destination.update({
        where: { id: destination.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncError: error,
          updatedBy: accountId,
        },
      })
      throw new BadRequestException(error)
    }

    await this.prismaService.$transaction([
      this.prismaService.destinationConfigCDN.update({
        where: { destinationId: destination.id },
        data: { urls },
      }),
      this.prismaService.destination.update({
        where: { id: destination.id },
        data: {
          lastSuccessfulSyncAt: new Date(),
          lastSyncAt: new Date(),
          lastSyncError: null,
          updatedBy: accountId,
        },
      }),
    ])
  }
}
