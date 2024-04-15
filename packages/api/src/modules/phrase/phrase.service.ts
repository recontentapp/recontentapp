import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import * as jwt from 'jsonwebtoken'
import { JSONService } from '../io/json.service'
import { CSVService } from '../io/csv.service'
import { YAMLService } from '../io/yaml.service'
import { fileFormatContentType, fileFormatExtensions } from '../io/fileFormat'
import { ExcelService } from '../io/excel.service'
import { Data } from '../io/types'
import { escapeFileName } from 'src/utils/security'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'
import { Requester } from '../auth/requester.object'

interface ListPhrasesParams {
  revisionId: string
  key?: string
  translated?: string
  untranslated?: string
  tags?: string[]
  pagination: PaginationParams
  requester: Requester
}

interface CreatePhraseParams {
  revisionId: string
  key: string
  requester: Requester
}

interface UpdatePhraseKeyParams {
  phraseId: string
  key: string
  requester: Requester
}

interface TranslatePhraseParams {
  phraseId: string
  requester: Requester
  translations: Array<{
    languageId: string
    content: string
  }>
}

interface DeletePhraseParams {
  phraseId: string
  requester: Requester
}

interface BatchDeletePhrasesParams {
  ids: string[]
  requester: Requester
}

interface GetPhraseParams {
  phraseId: string
  requester: Requester
}

interface ImportPhrasesParams {
  file: Buffer
  fileFormat: Components.Schemas.FileFormat
  revisionId: string
  languageId: string
  tagIds: string[]
  mappingSheetName?: string
  mappingRowStartIndex?: number
  mappingKeyColumnIndex?: number
  mappingTranslationColumnIndex?: number
  requester: Requester
}

interface GeneratePhrasesExportTokenParams {
  revisionId: string
  languageId: string
  containsTagIds: string[] | null
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
  requester: Requester
}

interface ExportPhrasesParams {
  token: string
}

interface PhrasesExportTokenPayload {
  revisionId: string
  projectId: string
  languageId: string
  containsTagIds: string[] | null
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
}

@Injectable()
export class PhraseService {
  private static jwtIssuer = 'recontent.app'

  constructor(
    private prismaService: PrismaService,
    private csvService: CSVService,
    private jsonService: JSONService,
    private yamlService: YAMLService,
    private excelService: ExcelService,
    private configService: ConfigService<Config, true>,
  ) {}

  async listPhrases({
    revisionId,
    pagination,
    requester,
    tags,
    key,
    translated,
    untranslated,
  }: ListPhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const where: Prisma.PhraseWhereInput = {
      revisionId,
      ...(key && {
        key: {
          contains: key,
        },
      }),
      ...(tags && {
        taggables: {
          some: {
            tagId: {
              in: tags,
            },
          },
        },
      }),
      ...(translated && {
        translations: {
          some: {
            languageId: translated,
          },
        },
      }),
      ...(untranslated && {
        translations: {
          none: {
            languageId: untranslated,
          },
        },
      }),
    }

    const { limit, offset, pageSize, page } = pagination
    const [phrases, count] = await Promise.all([
      this.prismaService.phrase.findMany({
        where,
        include: {
          taggables: { select: { tagId: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.phrase.count({
        where,
      }),
    ])

    return {
      items: phrases,
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  async createPhrase({ key, requester, revisionId }: CreatePhraseParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const phrase = await this.prismaService.phrase.create({
      data: {
        key,
        revisionId,
        projectId: revision.projectId,
        workspaceId: revision.workspaceId,
        createdBy: workspaceAccess.getAccountID(),
      },
      include: { translations: true },
    })

    return phrase
  }

  async getPhrase({ phraseId, requester }: GetPhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
      include: {
        translations: true,
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phrase.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    return phrase
  }

  async updatePhraseKey({ phraseId, key, requester }: UpdatePhraseKeyParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phrase.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const updatedPhrase = await this.prismaService.phrase.update({
      where: { id: phraseId },
      data: {
        key,
        updatedBy: workspaceAccess.getAccountID(),
      },
      include: {
        translations: true,
      },
    })

    return updatedPhrase
  }

  async translatePhrase({
    phraseId,
    translations,
    requester,
  }: TranslatePhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
      include: {
        project: {
          include: {
            languages: true,
          },
        },
      },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phrase.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const availableLanguages = phrase.project.languages.map(
      language => language.id,
    )
    const requestedLanguages = translations.map(({ languageId }) => languageId)
    const someLanguagesDoNotExist = requestedLanguages.some(
      languageId => !availableLanguages.includes(languageId),
    )
    if (someLanguagesDoNotExist) {
      throw new BadRequestException('Some languages do not exist in project')
    }

    const existingTranslations =
      await this.prismaService.phraseTranslation.findMany({
        where: {
          phraseId,
        },
      })

    const toInsert: Array<{ languageId: string; content: string }> = []
    const toUpdate: Array<{
      translationId: string
      content: string
    }> = []
    const toDelete: Array<string> = []

    for (const translation of translations) {
      const { languageId, content } = translation

      const index = existingTranslations.findIndex(
        t => t.languageId === languageId,
      )

      if (content.length === 0 && index !== -1) {
        toDelete.push(existingTranslations[index].id)
        continue
      }

      if (index === -1) {
        toInsert.push({ languageId, content })
        continue
      }

      toUpdate.push({
        translationId: existingTranslations[index].id,
        content,
      })
    }

    const createdBy = workspaceAccess.getAccountID()

    await this.prismaService.$transaction([
      this.prismaService.phrase.update({
        where: {
          id: phraseId,
        },
        data: {
          updatedAt: new Date(),
          updatedBy: createdBy,
        },
      }),
      ...toDelete.map(translationId =>
        this.prismaService.phraseTranslation.delete({
          where: {
            id: translationId,
          },
        }),
      ),
      ...toInsert.map(({ languageId, content }) =>
        this.prismaService.phraseTranslation.create({
          data: {
            content: content,
            createdBy,
            languageId,
            phraseId,
            workspaceId: phrase.workspaceId,
            revisionId: phrase.revisionId,
          },
        }),
      ),
      ...toUpdate.map(({ translationId, content }) =>
        this.prismaService.phraseTranslation.update({
          where: {
            id: translationId,
          },
          data: {
            content,
            updatedBy: createdBy,
          },
        }),
      ),
    ])

    return this.prismaService.phrase.findFirstOrThrow({
      where: {
        id: phraseId,
      },
      include: {
        translations: true,
      },
    })
  }

  async deletePhrase({ phraseId, requester }: DeletePhraseParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      phrase.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    await this.prismaService.$transaction(async t => {
      await t.phraseTranslation.deleteMany({
        where: {
          phraseId,
        },
      })
      await t.taggable.deleteMany({
        where: {
          recordId: phraseId,
        },
      })
      await t.phrase.delete({
        where: {
          id: phraseId,
        },
      })
    })
  }

  async batchDeletePhrases({ ids, requester }: BatchDeletePhrasesParams) {
    const phrases = await this.prismaService.phrase.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    if (phrases.length !== ids.length) {
      throw new BadRequestException('Some phrases do not exist')
    }

    const allBelongToSameProject = phrases.every(
      p => p.projectId === phrases[0].projectId,
    )
    if (!allBelongToSameProject) {
      throw new BadRequestException(
        'All phrases must belong to the same project',
      )
    }

    const workspaceId = phrases[0].workspaceId

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    await this.prismaService.$transaction(async t => {
      await t.phraseTranslation.deleteMany({
        where: {
          phraseId: {
            in: ids,
          },
        },
      })
      await t.taggable.deleteMany({
        where: {
          recordId: {
            in: ids,
          },
        },
      })
      await t.phrase.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })
    })
  }

  async importPhrases({
    file,
    fileFormat,
    revisionId,
    languageId,
    requester,
    tagIds,
    ...mappingParams
  }: ImportPhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const language = await this.prismaService.language.findUniqueOrThrow({
      where: { id: languageId },
    })

    if (language.workspaceId !== revision.workspaceId) {
      throw new BadRequestException(
        'Language does not belong to this workspace',
      )
    }

    if (tagIds.length > 0) {
      const tags = await this.prismaService.tag.findMany({
        where: {
          id: {
            in: tagIds,
          },
        },
      })

      if (tags.length !== tagIds.length) {
        throw new BadRequestException('Some tags do not exist')
      }

      const allBelongToSameProject = tags.every(
        tag => tag.projectId === revision.projectId,
      )
      if (!allBelongToSameProject) {
        throw new BadRequestException(
          'All tags must belong to the same project',
        )
      }
    }

    if (
      fileFormat === 'excel' &&
      (mappingParams.mappingSheetName === undefined ||
        mappingParams.mappingRowStartIndex === undefined ||
        mappingParams.mappingKeyColumnIndex === undefined ||
        mappingParams.mappingTranslationColumnIndex === undefined)
    ) {
      throw new BadRequestException('Missing mapping parameters for Excel file')
    }

    let data: Data = {}

    switch (fileFormat) {
      case 'json':
      case 'nested_json':
        data = this.jsonService.parse(file)
        break
      case 'csv':
        data = this.csvService.parse(file)
        break
      case 'yaml':
      case 'nested_yaml':
        data = this.yamlService.parse(file)
        break
      case 'excel':
        data = await this.excelService.parse({
          buffer: file,
          sheetName: mappingParams.mappingSheetName!,
          rowStartIndex: mappingParams.mappingRowStartIndex!,
          keyColumnIndex: mappingParams.mappingKeyColumnIndex!,
          translationColumnIndex: mappingParams.mappingTranslationColumnIndex!,
        })
        break
    }

    await this.prismaService.$transaction(
      Object.entries(data).map(([key, value]) =>
        this.prismaService.phrase.upsert({
          where: {
            key_revisionId: {
              key,
              revisionId,
            },
          },
          create: {
            key,
            revisionId,
            projectId: revision.projectId,
            workspaceId: revision.workspaceId,
            createdBy: workspaceAccess.getAccountID(),
            taggables: {
              create: tagIds.map(tagId => ({
                tagId,
                recordType: 'phrase',
                createdBy: workspaceAccess.getAccountID(),
                workspaceId: revision.workspaceId,
              })),
            },
            translations: {
              create: {
                content: value,
                languageId,
                workspaceId: revision.workspaceId,
                revisionId,
                createdBy: workspaceAccess.getAccountID(),
              },
            },
          },
          update: {},
        }),
      ),
    )
  }

  async generatePhrasesExportToken({
    revisionId,
    languageId,
    containsTagIds,
    fileFormat,
    includeEmptyTranslations,
    requester,
  }: GeneratePhrasesExportTokenParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    const workspaceAccess = requester.getWorkspaceAccessOrThrow(
      revision.workspaceId,
    )
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    if (containsTagIds && containsTagIds.length > 0) {
      const tags = await this.prismaService.tag.findMany({
        where: {
          id: {
            in: containsTagIds,
          },
        },
      })

      if (tags.length !== containsTagIds.length) {
        throw new BadRequestException('Some tags do not exist')
      }

      const allBelongToSameProject = tags.every(
        tag => tag.projectId === revision.projectId,
      )
      if (!allBelongToSameProject) {
        throw new BadRequestException(
          'All tags must belong to the same project',
        )
      }
    }

    const language = await this.prismaService.language.findUniqueOrThrow({
      where: { id: languageId },
    })

    if (language.workspaceId !== revision.workspaceId) {
      throw new BadRequestException(
        'Language does not belong to this workspace',
      )
    }

    const payload: PhrasesExportTokenPayload = {
      fileFormat,
      projectId: revision.projectId,
      includeEmptyTranslations,
      revisionId,
      languageId,
      containsTagIds,
    }

    try {
      const token = jwt.sign(
        payload,
        this.configService.get('security.jwtSecret', { infer: true })!,
        {
          expiresIn: '1h',
          issuer: PhraseService.jwtIssuer,
        },
      )

      return token
    } catch (e) {
      console.log(e)
      throw new BadRequestException('Could not generate token')
    }
  }

  async exportPhrases({ token }: ExportPhrasesParams) {
    let payload: PhrasesExportTokenPayload | null = null

    try {
      payload = jwt.verify(
        token,
        this.configService.get('security.jwtSecret', { infer: true })!,
        {
          issuer: PhraseService.jwtIssuer,
        },
      ) as PhrasesExportTokenPayload
    } catch (e) {}

    if (!payload) {
      throw new BadRequestException('Invalid token')
    }

    const {
      revisionId,
      projectId,
      languageId,
      fileFormat,
      containsTagIds,
      includeEmptyTranslations,
    } = payload

    const [project, language] = await Promise.all([
      this.prismaService.project.findUniqueOrThrow({
        where: { id: projectId },
        select: {
          name: true,
        },
      }),
      this.prismaService.language.findUniqueOrThrow({
        where: { id: languageId },
        select: {
          name: true,
        },
      }),
    ])

    const tagIds = containsTagIds ?? []

    const phrases = await this.prismaService.phrase.findMany({
      where: {
        revisionId,
        ...(tagIds.length > 0 && {
          taggables: {
            some: {
              tagId: {
                in: tagIds,
              },
            },
          },
        }),
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

    const fileName = escapeFileName(
      `Recontent_${project.name}_${language.name}`,
    )

    return {
      buffer,
      contentType: fileFormatContentType[fileFormat],
      fileName: `${fileName}${fileFormatExtensions[fileFormat]}`,
    }
  }
}
