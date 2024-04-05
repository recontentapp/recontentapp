import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { JSONService } from '../io/json.service'
import { CSVService } from '../io/csv.service'
import { YAMLService } from '../io/yaml.service'
import { ExcelService } from '../io/excel.service'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { HumanRequester } from 'src/utils/requester'
import { Components } from 'src/generated/typeDefinitions'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fileFormatContentType, fileFormatExtensions } from '../io/fileFormat'
import { PaginationParams } from 'src/utils/pagination'
import { Prisma } from '@prisma/client'

interface CreateCDNDestinationParams {
  name: string
  revisionId: string
  requester: HumanRequester
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

interface SyncCDNDestinationParams {
  destinationId: string
  requester: HumanRequester
}

interface DeleteDestinationParams {
  destinationId: string
  requester: HumanRequester
}

interface ListDestinationsParams {
  pagination: PaginationParams
  requester: HumanRequester
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
    private configService: ConfigService<Config>,
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

    if (!requester.canAccessWorkspace(project.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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
    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('You do not have access to this workspace')
    }

    const destination = await this.prismaService.destination.create({
      include: { configCDN: true },
      data: {
        name,
        revisionId,
        type: 'cdn',
        active: true,
        workspaceId: revision.workspaceId,
        createdBy: requester.getAccountIDForWorkspace(revision.workspaceId)!,
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

  async deleteDestination({
    destinationId,
    requester,
  }: DeleteDestinationParams) {
    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
    })

    if (!requester.canAccessWorkspace(destination.workspaceId)) {
      throw new ForbiddenException('You do not have access to this workspace')
    }

    // TODO: clean up resources
    await this.prismaService.destination.delete({
      where: { id: destinationId },
    })
  }

  async syncCDNDestination({
    destinationId,
    requester,
  }: SyncCDNDestinationParams) {
    const cdnConfig = this.configService.get('cdn', { infer: true })
    if (!cdnConfig?.available) {
      throw new BadRequestException('CDN is not available')
    }

    const destination = await this.prismaService.destination.findUniqueOrThrow({
      where: { id: destinationId },
      include: { configCDN: true, workspace: true },
    })

    if (!requester.canAccessWorkspace(destination.workspaceId)) {
      throw new ForbiddenException('You do not have access to this workspace')
    }

    if (!destination.active || !destination.configCDN) {
      throw new BadRequestException('Destination is not active')
    }

    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: destination.revisionId },
        include: {
          project: {
            include: {
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

      const key = `${destination.workspace.key}/${destination.id}/${
        language.locale
      }${
        fileFormatExtensions[
          destination.configCDN.fileFormat as Components.Schemas.FileFormat
        ]
      }`

      const client = new S3Client({ region: 'us-east-1' })
      await client.send(
        new PutObjectCommand({
          Bucket: cdnConfig.bucket,
          ContentType:
            fileFormatContentType[
              destination.configCDN.fileFormat as Components.Schemas.FileFormat
            ],
          Key: key,
          Body: buffer,
        }),
      )

      urls.push(`${cdnConfig.bucketUrl}/${key}`)
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
          updatedBy: requester.getAccountIDForWorkspace(
            destination.workspaceId,
          )!,
        },
      }),
    ])
  }
}
