import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Components } from 'src/generated/typeDefinitions'
import { PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { HumanRequester, Requester } from 'src/utils/requester'
import * as jwt from 'jsonwebtoken'
import { JSONService } from '../io/json.service'
import { CSVService } from '../io/csv.service'
import { YAMLService } from '../io/yaml.service'
import { fileFormatContentType, fileFormatExtensions } from '../io/fileFormat'
import { ExcelService } from '../io/excel.service'
import { Data } from '../io/types'
import { escapeFileName } from 'src/utils/security'

interface ListPhrasesParams {
  revisionId: string
  key?: string
  translated?: string
  untranslated?: string
  pagination: PaginationParams
  requester: Requester
}

interface CreatePhraseParams {
  revisionId: string
  key: string
  requester: HumanRequester
}

interface UpdatePhraseKeyParams {
  phraseId: string
  key: string
  requester: HumanRequester
}

interface TranslatePhraseParams {
  phraseId: string
  requester: HumanRequester
  translations: Array<{
    languageId: string
    content: string
  }>
}

interface DeletePhraseParams {
  phraseId: string
  requester: HumanRequester
}

interface BatchDeletePhrasesParams {
  ids: string[]
  requester: HumanRequester
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
  mappingSheetName?: string
  mappingRowStartIndex?: number
  mappingKeyColumnIndex?: number
  mappingTranslationColumnIndex?: number
  requester: HumanRequester
}

interface GeneratePhrasesExportTokenParams {
  revisionId: string
  languageId: string
  fileFormat: Components.Schemas.FileFormat
  includeEmptyTranslations: boolean
  requester: HumanRequester
}

interface ExportPhrasesParams {
  token: string
}

interface PhrasesExportTokenPayload {
  revisionId: string
  projectId: string
  languageId: string
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
  ) {}

  async listPhrases({
    revisionId,
    pagination,
    requester,
    key,
    translated,
    untranslated,
  }: ListPhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const where: Prisma.PhraseWhereInput = {
      revisionId,
      ...(key && {
        key: {
          contains: key,
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

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const phrase = await this.prismaService.phrase.create({
      data: {
        key,
        revisionId,
        projectId: revision.projectId,
        workspaceId: revision.workspaceId,
        createdBy: requester.getAccountIDForWorkspace(revision.workspaceId)!,
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

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    return phrase
  }

  async updatePhraseKey({ phraseId, key, requester }: UpdatePhraseKeyParams) {
    const phrase = await this.prismaService.phrase.findUniqueOrThrow({
      where: { id: phraseId },
    })

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const updatedPhrase = await this.prismaService.phrase.update({
      where: { id: phraseId },
      data: {
        key,
        updatedBy: requester.getAccountIDForWorkspace(phrase.workspaceId)!,
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

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

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

    translations.forEach(({ languageId, content }) => {
      const index = existingTranslations.findIndex(
        t => t.languageId === languageId,
      )

      if (index === -1) {
        toInsert.push({ languageId, content })
      } else {
        toUpdate.push({
          translationId: existingTranslations[index].id,
          content,
        })
      }
    })

    const createdBy = requester.getAccountIDForWorkspace(phrase.workspaceId)!

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

    if (!requester.canAccessWorkspace(phrase.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    await this.prismaService.$transaction(async t => {
      await t.phraseTranslation.deleteMany({
        where: {
          phraseId,
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
    if (!requester.canAccessWorkspace(workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    await this.prismaService.$transaction(async t => {
      await t.phraseTranslation.deleteMany({
        where: {
          phraseId: {
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
    ...mappingParams
  }: ImportPhrasesParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
    }

    const language = await this.prismaService.language.findUniqueOrThrow({
      where: { id: languageId },
    })

    if (language.workspaceId !== revision.workspaceId) {
      throw new BadRequestException(
        'Language does not belong to this workspace',
      )
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
            createdBy: requester.getAccountIDForWorkspace(
              revision.workspaceId,
            )!,
            translations: {
              create: {
                content: value,
                languageId,
                workspaceId: revision.workspaceId,
                revisionId,
                createdBy: requester.getAccountIDForWorkspace(
                  revision.workspaceId,
                )!,
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
    fileFormat,
    includeEmptyTranslations,
    requester,
  }: GeneratePhrasesExportTokenParams) {
    const revision = await this.prismaService.projectRevision.findUniqueOrThrow(
      {
        where: { id: revisionId },
      },
    )

    if (!requester.canAccessWorkspace(revision.workspaceId)) {
      throw new ForbiddenException('User is not part of this workspace')
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
    }

    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '1h',
        issuer: PhraseService.jwtIssuer,
      })

      return token
    } catch (e) {
      console.log(e)
      throw new BadRequestException('Could not generate token')
    }
  }

  async exportPhrases({ token }: ExportPhrasesParams) {
    let payload: PhrasesExportTokenPayload | null = null

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: PhraseService.jwtIssuer,
      }) as PhrasesExportTokenPayload
    } catch (e) {
      console.log(e)
    }

    if (!payload) {
      throw new BadRequestException('Invalid token')
    }

    const {
      revisionId,
      projectId,
      languageId,
      fileFormat,
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
