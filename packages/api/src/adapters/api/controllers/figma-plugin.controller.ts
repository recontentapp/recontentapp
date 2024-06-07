import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  FigmaFile,
  FigmaText,
  Language,
  Phrase,
  PhraseTranslation,
  Project,
  ProjectRevision,
} from '@prisma/client'
import { Components, Paths } from 'src/generated/figma-plugin/typeDefinitions'
import { APIKeyGuard } from 'src/modules/auth/api-key.guard'
import { AuthenticatedRequester } from 'src/modules/auth/requester.decorator'
import { Requester } from 'src/modules/auth/requester.object'
import { FigmaService } from 'src/modules/figma/figma.service'
import { Config } from 'src/utils/config'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { RequiredQuery } from 'src/utils/required-query'
import {
  CreateFigmaFileDto,
  CreateFigmaTextDto,
  UpdateFigmaFileDto,
  UpdateFigmaTextDto,
} from '../dto/figma-plugin/figma.dto'

@Controller('figma-plugin')
@UseGuards(APIKeyGuard)
export class FigmaPluginController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly figmaService: FigmaService,
    private readonly configService: ConfigService<Config, true>,
  ) {}

  private static formatLanguage(
    language: Language,
  ): Components.Schemas.Language {
    return {
      id: language.id,
      workspaceId: language.workspaceId,
      locale: language.locale,
      name: language.name,
      createdAt: language.createdAt.toISOString(),
      updatedAt: language.updatedAt.toISOString(),
    }
  }

  private static formatProject(
    project: Project & { revisions: ProjectRevision[] },
  ): Components.Schemas.Project {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }

  private formatFigmaFile(
    file: FigmaFile & {
      language: Language
      project: Project
    },
    workspaceKey: string,
  ): Components.Schemas.FigmaFile {
    const appUrl = this.configService.get('urls.app', { infer: true })

    return {
      id: file.id,
      revisionId: file.revisionId,
      workspaceId: file.workspaceId,
      languageId: file.languageId,
      projectId: file.projectId,
      languageName: file.language.name,
      projectName: file.project.name,
      key: file.key,
      url: file.url,
      inAppUrl: `${appUrl}/${workspaceKey}/projects/${file.projectId}/phrases/${file.revisionId}`,
      name: file.name,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    }
  }

  private static formatAvailablePhrase(
    phrase: Phrase & { translations: PhraseTranslation[] },
  ): Components.Schemas.AvailablePhrase {
    return {
      id: phrase.id,
      key: phrase.key,
      content: phrase.translations.at(0)?.content ?? null,
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
    }
  }

  private static formatFigmaFileText(
    text: FigmaText & {
      phrase: Phrase & { translations: PhraseTranslation[] }
    },
  ): Components.Schemas.FigmaText {
    return {
      id: text.id,
      fileId: text.fileId,
      workspaceId: text.workspaceId,
      phraseId: text.phraseId,
      phraseKey: text.phrase.key,
      textNodeId: text.textNodeId,
      pageNodeId: text.pageNodeId,
      content: text.phrase.translations.at(0)?.content ?? null,
      createdAt: text.createdAt.toISOString(),
      updatedAt: text.updatedAt.toISOString(),
    }
  }

  @Get('/me')
  async getMe(
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetMe.Responses.$200> {
    const defaultWorkspaceId = requester.getDefaultWorkspaceID()
    const appConfig = this.configService.get('app', {
      infer: true,
    })

    const workspaceAccess =
      requester.getWorkspaceAccessOrThrow(defaultWorkspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:write')

    const id = requester.getUserID()
    const { firstName, lastName } = requester.getUserDetails()

    return {
      id,
      firstName,
      lastName,
      workspace: workspaceAccess.getWorkspaceDetails(),
      system: {
        version: appConfig.version,
        distribution: appConfig.distribution,
      },
    }
  }

  @Get('/languages')
  async listLanguages(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @RequiredQuery('projectId') projectId?: string,
  ): Promise<Paths.ListLanguages.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { page, pageSize, limit, offset } = pagination
    const [languages, count] = await Promise.all([
      this.prismaService.language.findMany({
        where: {
          workspaceId,
          projects: projectId ? { some: { id: projectId } } : undefined,
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.language.count({
        where: {
          workspaceId,
          projects: projectId ? { some: { id: projectId } } : undefined,
        },
      }),
    ])

    return {
      items: languages.map(FigmaPluginController.formatLanguage),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Get('/projects')
  async listProjects(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListProjects.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const { page, pageSize, limit, offset } = pagination
    const [projects, count] = await Promise.all([
      this.prismaService.project.findMany({
        where: {
          workspaceId,
        },
        include: {
          revisions: {
            where: { isMaster: true },
          },
        },
        take: limit,
        skip: offset,
      }),
      this.prismaService.project.count({
        where: {
          workspaceId,
        },
      }),
    ])

    return {
      items: projects.map(FigmaPluginController.formatProject),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Post('/figma-files')
  async createFigmaFile(
    @AuthenticatedRequester() requester: Requester,
    @Body() { revisionId, languageId, url, name }: CreateFigmaFileDto,
  ): Promise<Paths.CreateFigmaFile.Responses.$201> {
    const file = await this.figmaService.createFile({
      requester,
      revisionId,
      languageId,
      url,
      name,
    })

    return this.formatFigmaFile(file, file.workspace.key)
  }

  @Get('/figma-files/:id')
  async getFigmaFile(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.GetFigmaFile.Responses.$200> {
    const file = await this.figmaService.getFile({ requester, id })
    return this.formatFigmaFile(file, file.workspace.key)
  }

  @Put('/figma-files/:id')
  async updateFigmaFile(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
    @Body() { languageId }: UpdateFigmaFileDto,
  ): Promise<Paths.UpdateFigmaFile.Responses.$200> {
    const file = await this.figmaService.updateFile({
      requester,
      id,
      languageId,
    })

    return this.formatFigmaFile(file, file.workspace.key)
  }

  @Delete('/figma-files/:id')
  async deleteFigmaFile(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.DeleteFigmaFile.Responses.$204> {
    await this.figmaService.deleteFile({ requester, id })
    return {}
  }

  @Get('/figma-files/:id/available-phrases')
  async listFigmaFileAvailablePhrases(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') fileId: string,
    @RequiredQuery('query') query: string,
  ): Promise<Paths.ListFigmaFileAvailablePhrases.Responses.$200> {
    const phrases = await this.figmaService.listAvailablePhrases({
      requester,
      fileId,
      query,
    })

    return { items: phrases.map(FigmaPluginController.formatAvailablePhrase) }
  }

  @Get('/figma-files/:id/texts')
  async listFigmaFileTexts(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') fileId: string,
    @RequiredQuery('pageNodeId') pageNodeId: string,
    @Pagination() pagination: PaginationParams,
  ): Promise<Paths.ListFigmaFileTexts.Responses.$200> {
    const { items, pagination: computedPagination } =
      await this.figmaService.listFileTexts({
        fileId,
        pageNodeId,
        requester,
        pagination,
      })

    return {
      items: items.map(FigmaPluginController.formatFigmaFileText),
      pagination: computedPagination,
    }
  }

  @Post('/figma-files/:id/texts')
  async createFigmaText(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') fileId: string,
    @Body() { items }: CreateFigmaTextDto,
  ): Promise<Paths.CreateFigmaFileText.Responses.$201> {
    const texts = await this.figmaService.createFileTexts({
      requester,
      fileId,
      items,
    })

    return {
      items: texts.map(FigmaPluginController.formatFigmaFileText),
    }
  }

  @Put('/figma-files/:id/texts/:textId')
  async updateFigmaText(
    @AuthenticatedRequester() requester: Requester,
    @Param('textId') textId: string,
    @Body() { content }: UpdateFigmaTextDto,
  ): Promise<Paths.UpdateFigmaFileText.Responses.$200> {
    const text = await this.figmaService.updateFileText({
      requester,
      id: textId,
      content,
    })

    return FigmaPluginController.formatFigmaFileText(text)
  }
}
