import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  Language,
  Phrase,
  PhraseTranslation,
  Project,
  ProjectRevision,
  Workspace,
} from '@prisma/client'
import { Components, Paths } from 'src/generated/public/typeDefinitions'
import { APIKeyGuard } from 'src/modules/auth/api-key.guard'
import { PhraseService } from 'src/modules/phrase/phrase.service'
import { possibleLocales } from 'src/modules/workspace/locale'
import { Pagination, PaginationParams } from 'src/utils/pagination'
import { PrismaService } from 'src/utils/prisma.service'
import { RequiredQuery } from 'src/utils/required-query'
import { CreatePhraseExportDto } from './public-dto/phrase.dto'
import { Throttle } from '@nestjs/throttler'
import { AuthenticatedRequester } from 'src/modules/auth/requester.decorator'
import { Requester } from 'src/modules/auth/requester.object'

@Controller('public')
@Throttle({ default: { limit: 10, ttl: 1000 } })
@UseGuards(APIKeyGuard)
export class PublicApiController {
  constructor(
    private readonly phraseService: PhraseService,
    private readonly prismaService: PrismaService,
  ) {}

  private static formatPhraseItem(
    phrase: Phrase,
  ): Components.Schemas.PhraseItem {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
    }
  }

  private static formatPhrase(
    phrase: Phrase & { translations: PhraseTranslation[] },
  ): Components.Schemas.Phrase {
    return {
      id: phrase.id,
      key: phrase.key,
      revisionId: phrase.revisionId,
      projectId: phrase.projectId,
      workspaceId: phrase.workspaceId,
      translations: phrase.translations.map(t => ({
        id: t.id,
        languageId: t.languageId,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        createdBy: t.createdBy,
        updatedBy: t.updatedBy,
      })),
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
    }
  }

  private static formatWorkspace(
    workspace: Workspace,
  ): Components.Schemas.Workspace {
    return {
      id: workspace.id,
      name: workspace.name,
      key: workspace.key,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    }
  }

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
      // TODO: How to enforce presence?
      masterRevisionId: project.revisions.find(r => r.isMaster)?.id ?? '',
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }

  @Get('/workspaces/me')
  async getWorkspacesMe(
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetWorkspace.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const workspace = await this.prismaService.workspace.findUniqueOrThrow({
      where: {
        id: workspaceId,
      },
    })

    return PublicApiController.formatWorkspace(workspace)
  }

  @Get('/languages')
  async getLanguages(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @Query('projectId') projectId?: string,
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
      items: languages.map(PublicApiController.formatLanguage),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Get('/projects')
  async getProjects(
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
      items: projects.map(PublicApiController.formatProject),
      pagination: {
        page,
        pageSize,
        pagesCount: Math.ceil(count / pageSize),
        itemsCount: count,
      },
    }
  }

  @Get('/projects/:id')
  async getProject(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.GetProject.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const project = await this.prismaService.project.findUniqueOrThrow({
      where: {
        id,
        workspaceId,
      },
      include: {
        revisions: {
          where: { isMaster: true },
        },
      },
    })

    return PublicApiController.formatProject(project)
  }

  @Get('/phrases')
  async getPhrases(
    @AuthenticatedRequester() requester: Requester,
    @Pagination() pagination: PaginationParams,
    @RequiredQuery('revisionId') revisionId: string,
  ): Promise<Paths.ListPhrases.Responses.$200> {
    const result = await this.phraseService.listPhrases({
      revisionId,
      requester,
      pagination,
    })

    return {
      items: result.items.map(PublicApiController.formatPhraseItem),
      pagination: result.pagination,
    }
  }

  @Get('/phrases/:id')
  async getPhrase(
    @AuthenticatedRequester() requester: Requester,
    @Param('id') id: string,
  ): Promise<Paths.GetPhrase.Responses.$200> {
    const phrase = await this.phraseService.getPhrase({
      phraseId: id,
      requester,
    })

    return PublicApiController.formatPhrase(phrase)
  }

  @Get('/possible-locales')
  async getPossibleLocales(): Promise<Paths.ListPossibleLocales.Responses.$200> {
    return {
      items: possibleLocales.map(key => ({
        key,
        label: key,
      })),
    }
  }

  @Post('/phrase-exports')
  async createPhraseExport(
    @AuthenticatedRequester() requester: Requester,
    @Body() { revisionId, languageId, containsTagIds }: CreatePhraseExportDto,
  ): Promise<Paths.ExportPhrases.Responses.$200> {
    const workspaceId = requester.getDefaultWorkspaceID()
    const workspaceAccess = requester.getWorkspaceAccessOrThrow(workspaceId)
    workspaceAccess.hasAbilityOrThrow('workspace:read')

    const phrases = await this.prismaService.phrase.findMany({
      where: {
        revisionId,
        workspaceId,
        ...(containsTagIds &&
          containsTagIds.length > 0 && {
            taggables: {
              some: {
                tagId: {
                  in: containsTagIds,
                },
              },
            },
          }),
      },
      select: {
        key: true,
        translations: {
          where: { languageId },
          select: {
            content: true,
          },
        },
      },
    })

    return {
      data: phrases.reduce(
        (acc, phrase) => {
          acc[phrase.key] = phrase.translations.at(0)?.content ?? ''
          return acc
        },
        {} as Record<string, string>,
      ),
    }
  }
}
